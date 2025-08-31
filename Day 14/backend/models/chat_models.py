from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatResponse(BaseModel):
    transcription: str
    llmResponse: str
    audioUrl: Optional[str]
    chatHistory: List[ChatMessage]
    error: Optional[str] = None
