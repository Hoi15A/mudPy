import uvicorn
from pydantic import BaseModel
from safeeval import SafeEval
from fastapi import FastAPI

app = FastAPI(root_path="/api")


def solvepuzzle(code):
    res = SafeEval.safeEval(code)
    print(res)
    return res


class Code(BaseModel):
    code: str


@app.get("/")
async def root():
    return "Hello world!"


@app.get("/msg")
async def api():
    return {"message": "Hello World"}


@app.get("/test")
async def test():
    return "testing!"


@app.post("/submit")
async def submit(code: Code):
    print(code.code)
    res = solvepuzzle(code.code)
    return res


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
