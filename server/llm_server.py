from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama
import json
import asyncio
from collections import defaultdict
import uvicorn

app = FastAPI()

# -------------------------------
# CORS middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Load Llama model
# -------------------------------
llm = Llama(
    model_path="/home/ajaya/models/Phi-3-mini-4k-instruct-q4.gguf",
    n_ctx=16384,
    verbose=False
)

# -------------------------------
# In-memory session store
# -------------------------------
chat_sessions = defaultdict(list)  # { session_id: [(role, content), ...] }

# -------------------------------
# System prompt
# -------------------------------
SYSTEM_PROMPT = "You are a helpful assistant that answers user queries directly and concisely. Do not explain instructions or provide examples of your functionality unless asked. Your answers should respond to the final element of the existing chat only. Only respond with a SINGULAR assistant response for your answer. Simple responses should be in plaintext, more complex answers should be formatted with markdown. If your answer contains code, be sure to wrap it in triple backticks. Only respond to the final element in the provided chat, with a clear response that does not continue for more than one segment."

# -------------------------------
# Pydantic model for requests
# -------------------------------
class PromptRequest(BaseModel):
    session_id: str              # identifies the chat session
    prompt: str
    max_tokens: int = 200
    temperature: float = 0.7
    new_context: bool = False    # reset context if True

# -------------------------------
# Helper: Build full prompt from history
# -------------------------------
def build_prompt(session_id: str) -> str:
    # Start with system instructions (not stored in session)
    prompt = f"<|system|>\n{SYSTEM_PROMPT}<|end|>\n"
    
    # Add chat history
    history = chat_sessions[session_id]
    for role, content in history:
        if role == "user":
            prompt += f"<|user|>\n{content}<|end|>\n"
        elif role == "assistant":
            prompt += f"<|assistant|>\n{content}<|end|>\n"
    
    # End with assistant tag for model to continue generating
    prompt += "<|assistant|>\n"
    return prompt

# -------------------------------
# Async generator for streaming
# -------------------------------
async def stream_response(session_id: str, prompt: str, max_tokens: int, temperature: float, new_context: bool):
    if new_context:
        chat_sessions[session_id] = []  # clear previous context

    # Save the user message
    chat_sessions[session_id].append(("user", prompt))

    # Build conversation prompt
    wrapped_prompt = build_prompt(session_id)

    assistant_reply = ""
    for output in llm(wrapped_prompt, max_tokens=max_tokens, temperature=temperature, stream=True):
        token_text = output["choices"][0]["text"]
        if token_text:
            assistant_reply += token_text
            yield f"data: {json.dumps({'token': token_text})}\n\n"
        await asyncio.sleep(0)  # allow async loop to update

    # Save assistant reply
    chat_sessions[session_id].append(("assistant", assistant_reply))

# -------------------------------
# Endpoint: streaming generation
# -------------------------------
@app.post("/generate-stream")
async def generate_stream(req: PromptRequest):
    return StreamingResponse(
        stream_response(req.session_id, req.prompt, req.max_tokens, req.temperature, req.new_context),
        media_type="text/event-stream"
    )

# -------------------------------
# Run server
# -------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)