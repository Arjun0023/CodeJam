import os
from fastapi import FastAPI, HTTPException
import json
from google import genai
from google.genai import types
from prompts.system_prompt import SYSTEM_PROMPT
from context.context import FEW_SHOT_CONTEXT
from fastapi.middleware.cors import CORSMiddleware
from models.models import QueryRequest

app = FastAPI(title="SPL Query Generator API")

# Load API key from environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/query")
async def generate_spl_query(request: QueryRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")

    try:
        # Call the non-streaming function directly
        response = await generate_spl(request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def generate_spl(query: str):
    client = genai.Client(api_key=GEMINI_API_KEY)
    model = "gemini-2.0-flash"

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="Find failed login attempts."),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text=FEW_SHOT_CONTEXT),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=query),
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="application/json",
        system_instruction=[
            types.Part.from_text(text=SYSTEM_PROMPT),
        ],
    )

    try:
        # Use the non-streaming API
        response = client.models.generate_content(
            model=model, contents=contents, config=generate_content_config
        )
        
        # Return the complete response text
        return json.loads(response.text)
    
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def root():
    return {
        "message": "Welcome to SPL Query Generator API. Use /query endpoint with a POST request."
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)