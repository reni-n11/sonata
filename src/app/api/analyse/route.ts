import { NextRequest, NextResponse } from 'next/server'

const HF_BACKEND = process.env.HF_BACKEND_URL ?? ''

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const res = await fetch(`${HF_BACKEND}/api/analyse`, {
      method: 'POST',
      body:   formData,
    })

    // Read as text first to handle non-JSON responses
    const text = await res.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error('Non-JSON response from backend:', text.slice(0, 200))
      return NextResponse.json(
        { error: `Backend error: ${text.slice(0, 200)}` },
        { status: 502 }
      )
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error ?? 'Backend error' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('/api/analyse error:', err)
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 })
  }
}