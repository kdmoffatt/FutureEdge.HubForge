from fastapi import FastAPI

app = FastAPI(title='HubForge AI')


@app.get('/health')
def health() -> dict[str, bool]:
    return {'ok': True}


@app.post('/v1/embed')
def embed(payload: dict) -> dict:
    texts = payload.get('texts', [])
    return {'model': 'placeholder-v1', 'embeddings': [[0.0] * 8 for _ in texts]}
