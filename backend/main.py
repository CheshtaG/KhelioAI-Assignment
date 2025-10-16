import os
import json
import asyncio
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
import re
from dotenv import load_dotenv

from langgraph_pipeline import ProductImagePipeline

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Product Imagery API", version="1.0.0")

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving output images
app.mount("/output", StaticFiles(directory="output"), name="output")

# Pydantic models
class VideoProcessingRequest(BaseModel):
    url: str

class VideoProcessingResponse(BaseModel):
    success: bool
    message: str
    products: List[Dict[str, Any]] = []
    error: str = None

class VideoInfoResponse(BaseModel):
    title: str
    duration: str
    duration_seconds: int
    error: str = None

# Initialize the pipeline
pipeline = ProductImagePipeline()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Product Imagery API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}

@app.get("/video-info/{video_id}")
async def get_video_info(video_id: str):
    """
    Get video metadata using Google YouTube Data API v3
    """
    try:
        youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        
        if not youtube_api_key:
            return {
                "title": "YouTube Video",
                "duration": "Unknown",
                "duration_seconds": 0,
                "error": "YouTube API key not configured"
            }
        
        api_url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "contentDetails,snippet",
            "id": video_id,
            "key": youtube_api_key
        }
        
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get("items"):
            return {
                "title": "Video not found",
                "duration": "Unknown",
                "duration_seconds": 0,
                "error": "Video not found or private"
            }
        
        video_item = data["items"][0]
        title = video_item["snippet"]["title"]
        duration_iso = video_item["contentDetails"]["duration"]
        duration_seconds = parse_iso_duration(duration_iso)
        
        if duration_seconds:
            hours = int(duration_seconds // 3600)
            minutes = int((duration_seconds % 3600) // 60)
            seconds = int(duration_seconds % 60)
            
            if hours > 0:
                duration_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            else:
                duration_str = f"{minutes:02d}:{seconds:02d}"
        else:
            duration_str = "Unknown"
        
        return {
            "title": title,
            "duration": duration_str,
            "duration_seconds": duration_seconds
        }
        
    except requests.RequestException as e:
        return {
            "title": "YouTube Video",
            "duration": "Unknown",
            "duration_seconds": 0,
            "error": f"API request failed: {str(e)}"
        }
    except Exception as e:
        return {
            "title": "YouTube Video",
            "duration": "Unknown",
            "duration_seconds": 0,
            "error": f"Unexpected error: {str(e)}"
        }

def parse_iso_duration(iso_duration: str) -> int:
    """
    Parse ISO 8601 duration format (PT4M13S) to seconds
    """
    duration = iso_duration[2:]
    hours = re.search(r'(\d+)H', duration)
    minutes = re.search(r'(\d+)M', duration)
    seconds = re.search(r'(\d+)S', duration)
    
    total_seconds = 0
    if hours:
        total_seconds += int(hours.group(1)) * 3600
    if minutes:
        total_seconds += int(minutes.group(1)) * 60
    if seconds:
        total_seconds += int(seconds.group(1))
    
    return total_seconds

@app.post("/process-video", response_model=VideoProcessingResponse)
async def process_video(request: VideoProcessingRequest):
    """
    Process a YouTube video to extract and enhance product images
    """
    try:
        # Process the video using the LangGraph pipeline
        result = await pipeline.process_video(request.url)
        
        if result.get("error"):
            return VideoProcessingResponse(
                success=False,
                message="Video processing failed",
                error=result["error"]
            )
        
        # Convert products to serializable format
        products_data = []
        for product in result.get("products", []):
            product_data = {
                "name": product.name,
                "confidence": product.confidence,
                "description": product.description,
                "timestamp": product.timestamp,
                "frame_image_path": product.frame_image_path,
                "segmented_image_path": product.segmented_image_path,
                "enhanced_images": product.enhanced_images
            }
            products_data.append(product_data)
        
        return VideoProcessingResponse(
            success=True,
            message=f"Successfully processed video and found {len(products_data)} products",
            products=products_data
        )
        
    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message="Video processing failed",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
