import uvicorn
from fastapi import FastAPI

app = FastAPI(root_path="/api")


@app.get("/")
async def root():
    return "Hello world!"


@app.get("/msg")
async def api():
    return {"message": "Hello World"}


@app.get("/test")
async def test():
    return "testing!"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
