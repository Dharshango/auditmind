from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")


class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Compliance query or instruction for agent")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Prior conversation messages")


class AgentToolExecution(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Dict[str, Any]


class AgentChatResponse(BaseModel):
    query: str
    response: str
    tools_used: List[Dict[str, Any]] = []
    mode: Optional[str] = None


class AgentRecallRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Semantic search query across organizational memories")
    tags: Optional[List[str]] = Field(default=None, description="Optional tag filter")
    limit: int = Field(default=5, ge=1, le=50, description="Max memories to return")


class RecalledMemoryItem(BaseModel):
    content: str
    category: Optional[str] = "EXPERIENTIAL"
    facility: Optional[str] = "CROSS_FACILITY"
    score: Optional[float] = 1.0
    tags: List[str] = []
    timestamp: Optional[str] = None


class AgentRecallResponse(BaseModel):
    query: str
    count: int
    memories: List[RecalledMemoryItem]


class AgentReflectRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Synthesized question or theme to reflect across memories")
    tags: Optional[List[str]] = Field(default=None, description="Optional tag filter")


class AgentReflectResponse(BaseModel):
    query: str
    reflection: str
    status: str = "completed"
