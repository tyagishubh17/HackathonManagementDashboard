from fastapi import FastAPI

app = FastAPI(title="RAG Service")

@app.get("/")
def read_root():
    return {"message": "RAG Service is running"}
