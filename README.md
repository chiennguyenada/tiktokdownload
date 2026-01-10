# TikTok Fact-Checker

Web app to download TikTok videos and verify claims using Google Gemini AI.

## Prerequisites

- Python 3.8+
- Active internet connection (for CDN and API access)

## Setup

1.  **Install Dependencies** (if not already done):
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
    *Note: If you encounter "externally-managed-environment" errors, use `pip install --user --break-system-packages -r requirements.txt`.*

2.  **Configuration**:
    - The backend uses a default Gemini API key.
    - You can provide your own key in the Frontend "Settings" page.

## Running the App

The easiest way is to use the provided script:

```bash
./run.sh
```

This will start:
- Backend at `http://localhost:8000`
- Frontend at `http://localhost:5173`

### Manual Start

**Backend**:
```bash
cd backend
python3 -m uvicorn main:app --port 8000 --reload
```

**Frontend**:
```bash
python3 -m http.server 5173 --directory frontend
```
