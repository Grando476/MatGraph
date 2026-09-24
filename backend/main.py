from fastapi import FastAPI
from core.cors import setup_cors
from routers import health, nodes, lessons, exercises

# FastAPI application initialization
app = FastAPI(
    title="EduMath API",
    description="Backend API dla platformy hybrydowej EduMath",
    version="1.0.0"
)

# Setup CORS middleware (Web Security)
setup_cors(app)

# Register Router Controllers
app.include_router(health.router)
app.include_router(nodes.router)
app.include_router(lessons.router)
app.include_router(exercises.router)
