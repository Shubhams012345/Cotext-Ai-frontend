export const conversations = [
  {
    id: "1",
    title: "Build a REST API with FastAPI",
    preview:
      "Here's how to structure your FastAPI project with async endpoints...",
    time: "2m ago",
    group: "Today",
    model: "Coding",
    active: true,
  },
  {
    id: "2",
    title: "Explain transformer architecture",
    preview: "The attention mechanism works by computing query, key, value...",
    time: "1h ago",
    group: "Today",
    model: "Chat",
    active: false,
  },
  {
    id: "3",
    title: "Generate pitch deck slides",
    preview: "I've created 12 slides covering market opportunity, traction...",
    time: "3h ago",
    group: "Today",
    model: "PPT",
    active: false,
  },
  {
    id: "4",
    title: "Debug React useEffect hook",
    preview:
      "The issue is with the dependency array — you're missing `userId`...",
    time: "Yesterday",
    group: "Yesterday",
    model: "Coding",
    active: false,
  },
  {
    id: "5",
    title: "Summarize research paper",
    preview: "This paper presents a novel approach to few-shot learning...",
    time: "Yesterday",
    group: "Yesterday",
    model: "PDF",
    active: false,
  },
  {
    id: "6",
    title: "Write SQL migration script",
    preview: "ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20)...",
    time: "3 days ago",
    group: "Previous 7 Days",
    model: "Coding",
    active: false,
  },
  {
    id: "7",
    title: "Analyze competitor website",
    preview: "Based on the screenshots provided, their pricing page focuses...",
    time: "5 days ago",
    group: "Previous 7 Days",
    model: "Vision",
    active: false,
  },
  {
    id: "8",
    title: "Product roadmap planning",
    preview: "Q1 priorities should center around developer experience...",
    time: "2 weeks ago",
    group: "Older",
    model: "Chat",
    active: false,
  },
];

export const models = [
  { id: "auto", label: "Auto" },
  { id: "chat", label: "Chat" },
  { id: "coding", label: "Coding" },
  { id: "search", label: "Search" },
  { id: "vision", label: "Vision" },
  { id: "ppt", label: "PPT" },
  { id: "pdf", label: "PDF" },
];

export const messages = [
  {
    id: "1",
    role: "user",
    content:
      "Can you help me build a REST API with FastAPI? I need endpoints for user auth, CRUD for posts, and WebSocket support.",
    timestamp: "2:14 PM",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Absolutely! Here's a well-structured FastAPI application with JWT auth, CRUD endpoints, and WebSocket support. I've organized it using a modular architecture for scalability.",
    timestamp: "2:14 PM",
    code: {
      lang: "python",
      content: `from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import asyncio

app = FastAPI(title="CotextAI API", version="1.0.0")
security = HTTPBearer()

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    published: bool = False

@app.post("/auth/register", status_code=201)
async def register(user: UserCreate):
    # Hash password and store user
    hashed = hash_password(user.password)
    new_user = await db.users.create({
        "email": user.email,
        "password": hashed,
        "name": user.name,
    })
    return {"user": new_user, "token": create_jwt(new_user.id)}

@app.get("/posts", response_model=list[Post])
async def get_posts(skip: int = 0, limit: int = 20):
    return await db.posts.find_many(skip=skip, take=limit)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(ws: WebSocket, user_id: str):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"Echo: {data}")
    except Exception:
        await ws.close()`,
    },
  },
  {
    id: "3",
    role: "user",
    content:
      "Great! Can you add rate limiting and Redis caching to the endpoints?",
    timestamp: "2:18 PM",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Sure — here's how to wire up slowapi for rate limiting and aioredis for response caching. The decorator pattern keeps your route handlers clean.",
    timestamp: "2:18 PM",
    code: {
      lang: "python",
      content: `from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import aioredis, json

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

redis = await aioredis.create_redis_pool("redis://localhost")

@app.get("/posts/{post_id}")
@limiter.limit("60/minute")
async def get_post(post_id: str, request: Request):
    cache_key = f"post:{post_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    post = await db.posts.find_unique(where={"id": post_id})
    if not post:
        raise HTTPException(404, "Post not found")

    await redis.setex(cache_key, 300, json.dumps(post.dict()))
    return post`,
    },
  },
];

export const artifacts = [
  {
    id: "1",
    title: "FastAPI Server",
    type: "Python",
    status: "ready",
    preview:
      "REST API with auth, CRUD, WebSockets, rate limiting, Redis caching",
    lang: "python",
  },
  {
    id: "2",
    title: "Auth Middleware",
    type: "Python",
    status: "ready",
    preview: "JWT authentication middleware with refresh token support",
    lang: "python",
  },
  {
    id: "3",
    title: "API Documentation",
    type: "Markdown",
    status: "ready",
    preview: "Complete API reference with examples and response schemas",
    lang: "markdown",
  },
];
