import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    uri = os.getenv("MONGO_URI")
    print("MONGO_URI:", uri)
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    db = client["test"]
    try:
        print("Pinging MongoDB...")
        await db.command("ping")
        print("Ping successful! Connected to MongoDB.")
    except Exception as e:
        print("Ping failed with error:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
