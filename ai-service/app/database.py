import os
import sys
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fairjudge")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    try:
        await db.command("ping")
        logger.info(f"Connected to MongoDB: {DB_NAME}")
    except Exception as exc:
        logger.critical(
            "\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "  MongoDB connection failed.\n\n"
            "  Set MONGO_URI in ai-service/.env, for example:\n\n"
            "  Option A — MongoDB Atlas (free, no install):\n"
            "    MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/\n\n"
            "  Option B — Local MongoDB (must be running):\n"
            "    MONGO_URI=mongodb://localhost:27017\n"
            "    Start it with:  net start MongoDB\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        )
        await close_db()
        sys.exit(1)


async def close_db():
    global client
    if client:
        client.close()
        client = None


def get_db():
    return db
