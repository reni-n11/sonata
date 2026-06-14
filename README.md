# Sonata - AI Music Genre Identifier


## Local development

```bash
npm install
cp .env.example .env.local
# fill in HF_BACKEND_URL and TICKETMASTER_KEY
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import your repo
3. Add environment variables:
   - `HF_BACKEND_URL` — your Hugging Face Space URL
   - `TICKETMASTER_KEY` — your Ticketmaster API key
4. Click Deploy

## Architecture

- `/` — Home page: upload file / search / paste link
- `/results` — Results page: all analysis output
- `/api/analyse` — Proxies audio to HuggingFace backend
- `/api/events` — Calls Ticketmaster Discovery API

## Connecting to your Python backend

Set `HF_BACKEND_URL` to your Hugging Face Space URL.
Your Gradio app needs one extra FastAPI-style endpoint:

```python
@app.post("/api/analyse")
async def analyse(file=None, search=None, link=None):
    # run full_prediction() and return the result dict
    ...
```

Gradio Spaces expose a REST API automatically — see
https://huggingface.co/docs/hub/spaces-sdks-gradio
