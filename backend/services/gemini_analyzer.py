import google.generativeai as genai
import os
import time
import json
import typing

def analyze_video(video_path: str, api_key: str) -> dict:
    genai.configure(api_key=api_key)
    
    # Upload the file
    # Upload the file
    print(f"Uploading file: {video_path}")
    video_file = None
    retries = 3
    for attempt in range(retries):
        try:
            video_file = genai.upload_file(path=video_path)
            break
        except Exception as e:
            print(f"Upload attempt {attempt + 1} failed: {e}")
            if attempt == retries - 1:
                raise e
            time.sleep(2)
            
    print(f"Completed upload: {video_file.uri}")

    # Wait for the file to be active
    while video_file.state.name == "PROCESSING":
        print('.', end='', flush=True)
        time.sleep(2)
        video_file = genai.get_file(video_file.name)
    
    if video_file.state.name == "FAILED":
        print(f"\nGemini File Processing Error Details: {video_file}")
        raise ValueError(f"Video processing failed. Gemini state: {video_file.state.name}")

    print(f"File state: {video_file.state.name}")

    # Create the prompt
    prompt = """
    Analyze this video for fact-checking purposes.
    
    Part 1: Transcript (Spoken Text Only)
    For each distinct segment in the video, provide a timestamped transcription of what is spoken.
    Do NOT describe the visual scene (e.g., do not describe people, background, or text overlays).
    Only output the spoken words.
    
    Part 2: Fact Checking
    Identify the main claims made in the video.
    For each claim, verify it against known facts.
    Provide a verdict for the overall video: 'Fact', 'Fiction', 'Misleading', or 'Mixed'.
    
    Return the result as a raw JSON object (no markdown formatting) with the following structure:
    {
        "transcript": [
            {
                "time": "MM:SS",
                "content": "Spoken text only"
            }
        ],
        "claims": [
            {
                "claim": "The claim text",
                "verification": "The verification details",
                "status": "True/False/Misleading/Unverified"
            }
        ],
        "verdict": "Fact/Fiction/Misleading/Mixed",
        "summary": "A brief summary of the analysis in Vietnamese (Tiếng Việt)"
    }
    """

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp")
    
    # Generate content
    print("Generating analysis with A/V Captions...")
    response = model.generate_content(
        [video_file, prompt],
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    # Clean up
    try:
        genai.delete_file(video_file.name)
    except Exception as e:
        print(f"Warning: Failed to delete file {video_file.name}: {e}")

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
         return {
            "claims": [],
            "verdict": "Error",
            "summary": "Failed to parse JSON response from Gemini.",
            "raw_response": response.text
        }


