from fastapi import FastAPI, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from dotenv import load_dotenv
from services.downloader import download_video
from services.gemini_analyzer import analyze_video

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
    url: str

DEFAULT_API_KEY = os.getenv("GEMINI_API_KEY")

@app.post("/analyze")
async def analyze_claim(
    request: AnalysisRequest,
    x_gemini_api_key: str | None = Header(default=None)
):
    api_key = x_gemini_api_key or DEFAULT_API_KEY
    if not api_key:
        raise HTTPException(status_code=400, detail="API Key not provided and no default server key found.")

    try:
        # 1. Download Video
        print(f"Downloading video from: {request.url}")
        video_path = download_video(request.url)
        print(f"Video downloaded to: {video_path}")

        # 2. Analyze with Gemini
        print("Starting analysis...")
        analysis_result = analyze_video(video_path, api_key)
        
        # 3. Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)
            print("Temporary video file removed.")

        return analysis_result

    except Exception as e:
        print(f"Error: {str(e)}")
        # Attempt cleanup even on error
        # In a real app we might want to track paths better
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
