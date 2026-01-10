import google.generativeai as genai
import os
import time
import json
import typing

def analyze_video(video_path: str, api_key: str) -> dict:
    genai.configure(api_key=api_key)
    
    # Upload the file
    print(f"Uploading file: {video_path}")
    video_file = genai.upload_file(path=video_path)
    print(f"Completed upload: {video_file.uri}")

    # Wait for the file to be active
    while video_file.state.name == "PROCESSING":
        print('.', end='', flush=True)
        time.sleep(2)
        video_file = genai.get_file(video_file.name)
    
    if video_file.state.name == "FAILED":
        raise ValueError("Video processing failed.")

    print(f"File state: {video_file.state.name}")

    # Create the prompt
    prompt = """
    Analyze this video for fact-checking purposes. 
    Identify the main claims made in the video.
    For each claim, verify it against known facts.
    Provide a verdict for the overall video: 'Fact', 'Fiction', 'Misleading', or 'Mixed'.
    
    Return the result as a raw JSON object (no markdown formatting) with the following structure:
    {
        "claims": [
            {
                "claim": "The claim text",
                "verification": "The verification details",
                "status": "True/False/Misleading/Unverified"
            }
        ],
        "verdict": "Fact/Fiction/Misleading/Mixed",
        "summary": "A brief summary of the analysis"
    }
    """

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp")
    
    # Generate content
    print("Generating analysis...")
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
