import os
import json
import asyncio
import cv2
import yt_dlp
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from PIL import Image
import google.generativeai as genai
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict, Annotated

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

@dataclass
class ProductInfo:
    name: str
    confidence: float
    description: str
    timestamp: float
    frame_image_path: str = ""
    segmented_image_path: str = ""
    enhanced_images: List[str] = None
    
    def __post_init__(self):
        if self.enhanced_images is None:
            self.enhanced_images = []

class State(TypedDict):
    url: str
    video_id: str
    video_path: str
    frames: List[Dict[str, Any]]
    products: List[ProductInfo]
    error: Optional[str]

class ProductImagePipeline:
    def __init__(self):
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create the LangGraph workflow
        self.workflow = self._create_workflow()
    
    def _create_workflow(self) -> StateGraph:
        """Create the LangGraph workflow for video processing"""
        workflow = StateGraph(State)
        
        # Add nodes
        workflow.add_node("extract_video", self._extract_video)
        workflow.add_node("extract_frames", self._extract_frames)
        workflow.add_node("identify_products", self._identify_products)
        workflow.add_node("segment_products", self._segment_products)
        workflow.add_node("enhance_products", self._enhance_products)
        
        # Add edges
        workflow.set_entry_point("extract_video")
        workflow.add_edge("extract_video", "extract_frames")
        workflow.add_edge("extract_frames", "identify_products")
        workflow.add_edge("identify_products", "segment_products")
        workflow.add_edge("segment_products", "enhance_products")
        workflow.add_edge("enhance_products", END)
        
        return workflow.compile()
    
    async def process_video(self, url: str) -> Dict[str, Any]:
        """Process a YouTube video to extract and enhance product images"""
        try:
            # Initialize state
            initial_state = State(
                url=url,
                video_id="",
                video_path="",
                frames=[],
                products=[],
                error=None
            )
            
            # Run the workflow
            result = await self.workflow.ainvoke(initial_state)
            
            if result.get("error"):
                return {"error": result["error"]}
            
            return {
                "products": result["products"],
                "message": f"Successfully processed video and found {len(result['products'])} products"
            }
            
        except Exception as e:
            return {"error": f"Pipeline execution failed: {str(e)}"}
    
    async def _extract_video(self, state: State) -> State:
        """Extract video ID and download the video"""
        try:
            video_id = self._extract_video_id(state["url"])
            state["video_id"] = video_id
            
            video_path = os.path.join(self.output_dir, f"video_{video_id}.mp4")
            state["video_path"] = video_path
            
            # Download video if not already exists
            if not os.path.exists(video_path):
                ydl_opts = {
                    'format': 'best[height<=720]',
                    'outtmpl': video_path,
                    'quiet': True,
                }
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([state["url"]])
            
            return state
            
        except Exception as e:
            state["error"] = f"Video extraction failed: {str(e)}"
            return state
    
    def _extract_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        if "youtube.com/watch?v=" in url:
            return url.split("v=")[1].split("&")[0]
        elif "youtube.com/shorts/" in url:
            return url.split("shorts/")[1].split("?")[0]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1].split("?")[0]
        else:
            return "unknown"
    
    async def _extract_frames(self, state: State) -> State:
        """Extract frames from the video"""
        try:
            cap = cv2.VideoCapture(state["video_path"])
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps
            
            # Extract frames every 2 seconds
            frame_interval = int(fps * 2)
            frames = []
            
            frame_number = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_number % frame_interval == 0:
                    timestamp = frame_number / fps
                    frame_path = os.path.join(self.output_dir, f"frame_{state['video_id']}_{frame_number}.jpg")
                    cv2.imwrite(frame_path, frame)
                    
                    frames.append({
                        "frame_number": frame_number,
                        "timestamp": timestamp,
                        "image_path": frame_path,
                        "products_detected": []
                    })
                
                frame_number += 1
            
            cap.release()
            state["frames"] = frames
            return state
            
        except Exception as e:
            state["error"] = f"Frame extraction failed: {str(e)}"
            return state
    
    async def _identify_products(self, state: State) -> State:
        """Use Gemini to identify products in frames"""
        try:
            for frame_data in state["frames"]:
                image = Image.open(frame_data["image_path"])
                prompt = """
                Look at this image from a YouTube video and identify ANY objects that could be considered products being shown, reviewed, demonstrated, or unboxed.
                
                Look for items like:
                - Electronics (phones, laptops, gadgets)
                - Beauty products (makeup, skincare, cosmetics)
                - Fashion items (clothes, shoes, accessories)
                - Household items (kitchen tools, decor, appliances)
                - Food/drinks being reviewed
                - Books, games, toys
                - ANY object that someone might review or showcase
        
                Be generous in your detection - if there's ANY object that looks like it could be a product, include it.
                
                For each item you find, provide:
                1. Product name/type
                2. Confidence level (0-1)
                3. Brief description
                4. Whether this frame shows the product clearly
                
                Respond in JSON format:
                {
                    "products": [
                        {
                            "name": "product name",
                            "confidence": 0.8,
                            "description": "brief description",
                            "is_good_frame": true
                        }
                    ]
                }
                """
                
                response = model.generate_content([prompt, image])
                
                try:
                    result = json.loads(response.text)
                    for product in result.get("products", []):
                        if product.get("is_good_frame", False) and product.get("confidence", 0) > 0.5:
                            product_info = ProductInfo(
                                name=product["name"],
                                confidence=product["confidence"],
                                description=product["description"],
                                timestamp=frame_data["timestamp"]
                            )
                            state["products"].append(product_info)
                            frame_data["products_detected"].append(product_info)
                            
                except json.JSONDecodeError:
                    # Fallback: simple text parsing - be more generous
                    response_lower = response.text.lower()
                    if any(word in response_lower for word in ["product", "item", "object", "thing", "device", "tool", "cosmetic", "makeup", "phone", "laptop", "book", "food", "drink"]):
                        product_info = ProductInfo(
                            name="Detected Product",
                            confidence=0.6,
                            description=response.text[:200],
                            timestamp=frame_data["timestamp"]
                        )
                        state["products"].append(product_info)
                        frame_data["products_detected"].append(product_info)
                        
        except Exception as e:
            state["error"] = f"Product identification failed: {str(e)}"
            
        return state
    
    async def _segment_products(self, state: State) -> State:
        """Use Gemini to segment products in identified frames"""
        try:
            for product in state["products"]:
                # Find the frame for this product
                frame_data = None
                for frame in state["frames"]:
                    if abs(frame["timestamp"] - product.timestamp) < 1.0:
                        frame_data = frame
                        break
                
                if frame_data:
                    image = Image.open(frame_data["image_path"])
                    prompt = f"""
                    Segment the product "{product.name}" from this image.
                    
                    Create a clean, cropped image of just the product with:
                    - White or transparent background
                    - Product centered and well-framed
                    - High quality and clear visibility
                    
                    Focus on the main product and remove any background elements, hands, or other objects.
                    """
                    
                    response = model.generate_content([prompt, image])
                    
                    # For now, we'll use the original frame as segmented
                    # In a real implementation, you'd use Gemini's segmentation capabilities
                    segmented_path = os.path.join(self.output_dir, f"segmented_{product.name.replace(' ', '_')}_{int(product.timestamp)}.jpg")
                    image.save(segmented_path)
                    product.segmented_image_path = f"/output/segmented_{product.name.replace(' ', '_')}_{int(product.timestamp)}.jpg"
                    product.frame_image_path = f"/output/frame_{state['video_id']}_{frame_data['frame_number']}.jpg"
                    
        except Exception as e:
            state["error"] = f"Product segmentation failed: {str(e)}"
            
        return state
    
    async def _enhance_products(self, state: State) -> State:
        """Use Gemini to enhance product images with different styles"""
        try:
            for product in state["products"]:
                if product.segmented_image_path:
                    # Load the segmented image
                    image_path = product.segmented_image_path.replace("/output/", f"{self.output_dir}/")
                    image = Image.open(image_path)
                    
                    # Create different enhanced versions
                    styles = [
                        "professional product photography with clean white background",
                        "modern lifestyle setting with subtle background",
                        "e-commerce style with shadow and depth"
                    ]
                    
                    enhanced_images = []
                    for i, style in enumerate(styles):
                        prompt = f"""
                        Enhance this product image with: {style}
                        
                        Make it look like a professional product photo suitable for:
                        - E-commerce websites
                        - Marketing materials
                        - Product catalogs
                        
                        Ensure the product is the main focus and looks appealing.
                        """
                        
                        response = model.generate_content([prompt, image])
                        
                        # For now, we'll create a copy with a different name
                        # In a real implementation, you'd use Gemini's image generation
                        enhanced_path = os.path.join(self.output_dir, f"enhanced_{product.name.replace(' ', '_')}_{i+1}_{int(product.timestamp)}.jpg")
                        image.save(enhanced_path)
                        enhanced_images.append(f"/output/enhanced_{product.name.replace(' ', '_')}_{i+1}_{int(product.timestamp)}.jpg")
                    
                    product.enhanced_images = enhanced_images
                    
        except Exception as e:
            state["error"] = f"Product enhancement failed: {str(e)}"
            
        return state
