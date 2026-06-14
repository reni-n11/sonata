import { NextRequest, NextResponse } from 'next/server'

const TM_KEY = process.env.TICKETMASTER_KEY ?? ''

async function fetchEvents(keyword: string, country: string) {
  if (!TM_KEY || !keyword) return []
  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    url.searchParams.set('apikey',             TM_KEY)
    url.searchParams.set('keyword',            keyword)
    url.searchParams.set('countryCode',        country.trim().toUpperCase().slice(0, 2))
    url.searchParams.set('classificationName', 'music')
    url.searchParams.set('size',               '5')
    url.searchParams.set('sort',               'date,asc')

    const res  = await fetch(url.toString())
    const data = await res.json()
    const evts = data?._embedded?.events ?? []

    return evts.map((e: Record<string, unknown>) => ({
      name:  e.name,
      date:  (e.dates as Record<string, Record<string, string>>)?.start?.localDate ?? '',
      venue: ((e._embedded as Record<string, Record<string, string>[]>)?.venues?.[0] as Record<string, string>)?.name ?? '',
      city:  (((e._embedded as Record<string, Record<string, Record<string, string>>[]>)?.venues?.[0] as Record<string, Record<string, string>>)?.city as Record<string, string>)?.name ?? '',
      url:   e.url,
    }))
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const genre    = searchParams.get('genre')    ?? ''
  const subgenre = searchParams.get('subgenre') ?? ''
  const country  = searchParams.get('country')  ?? ''

  const [genreEvents, subgenreEvents] = await Promise.all([
    fetchEvents(genre,    country),
    fetchEvents(subgenre || genre, country),
  ])

  return NextResponse.json({ genreEvents, subgenreEvents })
}
