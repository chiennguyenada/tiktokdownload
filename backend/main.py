from fastapi import FastAPI, HTTPException, Header, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
import os
import shutil
from dotenv import load_dotenv
from services import downloader
from services import gemini_analyzer

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    video_url: str

@app.post("/analyze")
async def analyze_video_endpoint(request: AnalysisRequest, x_gemini_api_key: str = Header(None)):
    api_key = x_gemini_api_key
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
        
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required (either in header or .env)")

    try:
        # 1. Download Video
        print(f"Downloading video from: {request.video_url}")
        # Run blocking download in thread pool
        video_path = await run_in_threadpool(downloader.download_video, request.video_url, "temp")
        print(f"Video downloaded to: {video_path}")
        
        # 2. Analyze with Gemini
        print("Starting analysis...")
        # Run blocking analysis in thread pool
        analysis_result = await run_in_threadpool(gemini_analyzer.analyze_video, video_path, api_key)
        
        # 3. Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)
            print("Temporary video file removed.")
        
        return analysis_result

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-upload")
async def analyze_upload_endpoint(video: UploadFile = File(...), x_gemini_api_key: str = Header(None)):
    api_key = x_gemini_api_key
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
        
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required")

    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    import uuid
    unique_filename = f"{uuid.uuid4()}_{video.filename}"
    video_path = os.path.join(temp_dir, unique_filename)

    try:
        # 1. Save Uploaded File
        print(f"Receiving upload: {video.filename}")
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            buffer.flush()
            os.fsync(buffer.fileno())
        
        file_size = os.path.getsize(video_path)
        print(f"File saved to: {video_path} (Size: {file_size} bytes)")
        
        if file_size == 0:
            raise ValueError("Uploaded file is empty.")

        # 2. Analyze with Gemini
        print("Starting analysis...")
        analysis_result = await run_in_threadpool(gemini_analyzer.analyze_video, video_path, api_key)
        
        return analysis_result

    except Exception as e:
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 3. Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)
            print("Temporary upload file removed.")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment for cloud deployment (Render/Railway)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
