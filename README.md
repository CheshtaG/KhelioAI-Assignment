# AI Product Imagery - YouTube Video Product Extraction & Enhancement

A full-stack AI-powered solution that extracts and enhances product images from YouTube videos using Google Gemini and LangGraph.

## 🎯 Project Overview

This application processes YouTube videos (reviews, unboxings, demos) to:
1. **Extract Key Frames** - Identify products in video frames using AI
2. **Segment Products** - Isolate products from backgrounds
3. **Enhance Images** - Create professional product shots with different styles

## 🏗️ Architecture

### Backend (LangGraph + FastAPI)
- **LangGraph Pipeline**: Orchestrates the AI processing workflow
- **Google Gemini Integration**: Handles frame analysis, product identification, and image enhancement
- **FastAPI**: RESTful API for frontend communication
- **Video Processing**: YouTube video download and frame extraction

### Frontend (Next.js + React)
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Real-time Processing**: Live status updates during video processing
- **Image Gallery**: Interactive display of original, segmented, and enhanced images
- **TypeScript**: Type-safe development

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```bash
cp env_example.txt .env
# Edit .env and add your Google Gemini API key
GOOGLE_API_KEY=your_google_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000
```

Start the backend:
```bash
python main.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📋 Assignment Tasks Implementation

### ✅ 1. Video Input
- **Implementation**: React form with YouTube URL validation
- **Features**: Real-time URL validation, example URLs, user-friendly interface
- **Tech**: Next.js forms, Tailwind CSS, Heroicons

### ✅ 2. Key Frame/Image Extraction (LangGraph)
- **Implementation**: `_extract_frames()` method in LangGraph pipeline
- **Process**: 
  - Downloads video using yt-dlp
  - Extracts frames every 2 seconds
  - Uses Gemini to analyze frames for products
- **Tech**: LangGraph state management, OpenCV, YouTube-dl

### ✅ 3. Image Segmentation (LangGraph)
- **Implementation**: `_segment_products()` method
- **Process**:
  - Uses Gemini to analyze product boundaries
  - Implements center-crop segmentation (demo approach)
  - Saves segmented product images
- **Tech**: Google Gemini Vision API, PIL, NumPy

### ✅ 4. Image Enhancement (LangGraph)
- **Implementation**: `_enhance_images()` method
- **Process**:
  - Creates 3 different enhancement styles
  - Applies basic image processing (brightness, contrast)
  - Generates professional product shots
- **Tech**: Gemini image analysis, OpenCV enhancements

### ✅ 5. Frontend Display (React/Next.js)
- **Implementation**: Complete UI with multiple components
- **Features**:
  - Video input form with validation
  - Real-time processing status
  - Interactive results display
  - Image gallery with fullscreen view
- **Tech**: React hooks, Framer Motion, Tailwind CSS

### ✅ 6. API Communication
- **Implementation**: FastAPI endpoints with proper CORS
- **Endpoints**:
  - `POST /process-video` - Main processing endpoint
  - `GET /health` - Health check
  - `GET /` - API info
- **Tech**: FastAPI, Pydantic models, Axios

## 🔧 Technical Implementation Details

### LangGraph Pipeline Flow
```
Video URL → Extract Frames → Identify Products → Segment Products → Enhance Images → Results
```

### State Management
```python
class State(TypedDict):
    video_url: str
    video_id: str
    frames: List[FrameData]
    products: List[ProductInfo]
    segmentations: List[SegmentationResult]
    enhancements: List[EnhancementResult]
    status: str
    error: str
```

### Gemini Integration
- **Frame Analysis**: Multi-modal input (image + text prompt)
- **Product Identification**: JSON-structured responses
- **Segmentation Guidance**: Detailed boundary descriptions
- **Enhancement Instructions**: Style-specific prompts

## 📊 Processing Workflow

### 1. Video Processing
- YouTube video download (720p max for efficiency)
- Frame extraction every 2 seconds
- Timestamp tracking for each frame

### 2. AI Analysis
- Gemini analyzes each frame for products
- Confidence scoring (0-1 scale)
- Product description generation
- Frame quality assessment

### 3. Image Processing
- Product segmentation using center-crop approach
- Multiple enhancement styles applied
- High-quality image output

### 4. Results Delivery
- Structured JSON response
- Image paths for frontend display
- Processing metadata

## 🎨 Frontend Features

### Components
- **VideoInputForm**: YouTube URL input with validation
- **ProcessingStatus**: Real-time processing updates
- **ResultsDisplay**: Product results with image gallery
- **ImageGallery**: Interactive image viewing

### UI/UX Features
- Responsive design for all devices
- Smooth animations with Framer Motion
- Loading states and error handling
- Fullscreen image viewing
- Tab-based image navigation

## 🔑 API Endpoints

### POST /process-video
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=..."
}
```

Response:
```json
{
  "video_id": "video_id",
  "products": [
    {
      "product_name": "Product Name",
      "confidence": 0.95,
      "frame_timestamp": 45.2,
      "frame_image_path": "/output/frames/frame_xxx_45.jpg",
      "segmented_image_path": "/output/segmented/product_45.jpg",
      "enhanced_images": ["/output/enhanced/product_style_1.jpg", ...]
    }
  ],
  "status": "completed",
  "message": "Processing completed successfully"
}
```

## 🛠️ Technologies Used

### Backend
- **Python 3.8+**: Core language
- **LangGraph**: AI workflow orchestration
- **FastAPI**: Web framework
- **Google Gemini**: AI model for vision tasks
- **OpenCV**: Video and image processing
- **PIL/Pillow**: Image manipulation
- **yt-dlp**: YouTube video downloading
- **Pydantic**: Data validation

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Axios**: HTTP client
- **React Hooks**: State management

### AI/ML
- **Google Gemini 1.5 Flash**: Multi-modal AI model
- **LangChain**: AI framework integration
- **Vision API**: Image analysis and understanding

## ⏱️ Time Spent Per Section

| Section | Time | Details |
|---------|------|---------|
| Project Setup | 30 min | Directory structure, dependencies |
| Backend Core | 2 hours | LangGraph pipeline, FastAPI setup |
| Video Processing | 1 hour | YouTube download, frame extraction |
| AI Integration | 2 hours | Gemini API integration, prompts |
| Image Processing | 1 hour | Segmentation, enhancement logic |
| Frontend Development | 3 hours | React components, UI/UX |
| API Integration | 1 hour | Backend-frontend communication |
| Testing & Debugging | 1 hour | End-to-end testing, bug fixes |
| Documentation | 30 min | README, code comments |

**Total: ~12 hours**

## 🚧 Challenges Faced

### 1. Gemini API Integration
- **Challenge**: Complex multi-modal prompt engineering
- **Solution**: Structured JSON responses with fallback parsing
- **Learning**: Importance of clear, specific prompts for consistent outputs

### 2. Video Processing Performance
- **Challenge**: Large video files and processing time
- **Solution**: Frame sampling (every 2 seconds) and 720p max resolution
- **Learning**: Balance between quality and performance

### 3. Image Segmentation
- **Challenge**: Complex product boundary detection
- **Solution**: Center-crop approach for demo (production would use advanced segmentation)
- **Learning**: Need for specialized segmentation models in production

### 4. Frontend State Management
- **Challenge**: Complex state transitions during processing
- **Solution**: Clear state management with TypeScript interfaces
- **Learning**: Importance of type safety in complex applications

## 🎯 Gemini Utilization

### Vision Analysis
- **Frame Analysis**: Multi-modal input combining images and text prompts
- **Product Identification**: Structured JSON responses for consistent parsing
- **Segmentation Guidance**: Detailed descriptions of product boundaries

### Prompt Engineering
```python
prompt = """
Analyze this image and identify any products being showcased, reviewed, or demonstrated.
For each product you identify, provide:
1. Product name/type
2. Confidence level (0-1)
3. Brief description of what makes it prominent in this frame
4. Whether this is a good frame for product photography

Respond in JSON format: {...}
"""
```

### Enhancement Instructions
- Professional product photography with clean white background
- Lifestyle photography with natural outdoor background
- Studio lighting with dramatic shadows

## 💡 Ideas for Improvements & Scalability

### Short-term Improvements
1. **Better Segmentation**: Integrate SAM (Segment Anything Model) for precise segmentation
2. **More Enhancement Styles**: Add more AI-generated backgrounds and styles
3. **Batch Processing**: Process multiple videos simultaneously
4. **Caching**: Cache processed results to avoid reprocessing

### Long-term Scalability
1. **Microservices Architecture**: Separate services for video processing, AI analysis, and image enhancement
2. **Queue System**: Redis/RabbitMQ for handling multiple processing requests
3. **Cloud Storage**: AWS S3/Google Cloud Storage for image storage
4. **Database**: PostgreSQL for storing processing history and results
5. **CDN**: CloudFront for fast image delivery
6. **Monitoring**: Prometheus/Grafana for system monitoring

### Advanced Features
1. **Real-time Processing**: WebSocket updates during processing
2. **User Accounts**: Save processing history and favorites
3. **API Rate Limiting**: Prevent abuse and manage costs
4. **A/B Testing**: Different AI models and processing approaches
5. **Mobile App**: React Native app for mobile users

### Performance Optimizations
1. **GPU Processing**: CUDA acceleration for image processing
2. **Parallel Processing**: Multi-threaded frame extraction
3. **Image Compression**: WebP format for smaller file sizes
4. **Lazy Loading**: Load images on demand in frontend

## 🔒 Security Considerations

1. **API Key Management**: Environment variables for sensitive keys
2. **Input Validation**: YouTube URL validation and sanitization
3. **Rate Limiting**: Prevent abuse of AI processing endpoints
4. **CORS Configuration**: Proper cross-origin resource sharing
5. **Error Handling**: Secure error messages without sensitive information

## 📈 Monitoring & Analytics

### Metrics to Track
- Processing time per video
- Success rate of product detection
- User engagement with results
- API usage and costs
- Error rates and types

### Logging
- Structured logging with timestamps
- Processing pipeline step tracking
- Error logging with stack traces
- Performance metrics logging

## 🎓 Learning Outcomes

This project demonstrates:
- **Full-stack Development**: End-to-end application development
- **AI Integration**: Practical use of Google Gemini for real-world tasks
- **Workflow Orchestration**: LangGraph for complex AI pipelines
- **Modern Frontend**: React/Next.js with TypeScript and modern UI patterns
- **API Design**: RESTful API design with proper error handling
- **Video Processing**: Computer vision and multimedia processing
- **Project Management**: Structured development and documentation

## 🚀 Getting Started with Your Own API Key

1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `backend/env_example.txt` to `backend/.env`
3. Add your API key to the `.env` file
4. Run the backend and frontend as described above
5. Test with any YouTube product review video!

---

**Built with ❤️ using Google Gemini, LangGraph, and Next.js**
