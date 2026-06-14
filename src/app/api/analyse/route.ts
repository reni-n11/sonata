import { NextRequest, NextResponse } from 'next/server'

const HF_BACKEND = process.env.HF_BACKEND_URL ?? 'https://your-hf-space.hf.space'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Forward directly to the HuggingFace Gradio backend
    const res = await fetch(`${HF_BACKEND}/api/analyse`, {
      method:  'POST',
      body:    formData,
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('/api/analyse error:', err)
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 })
  }
}
