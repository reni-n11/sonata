import { NextRequest, NextResponse } from 'next/server'

const TM_KEY = process.env.TICKETMASTER_KEY ?? ''

async function fetchEvents(keyword: string, country: string, lat?: number, lng?: number) {
  if (!TM_KEY || !keyword) return []

  // First try: exact country match
  let events = await tryFetch(keyword, country, lat, lng)
  if (events.length > 0) return events

  // Fallback: search without country restriction, sorted by distance if coords available
  events = await tryFetch(keyword, null, lat, lng)
  return events
}

async function tryFetch(keyword: string, country: string | null, lat?: number, lng?: number) {
  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    url.searchParams.set('apikey', TM_KEY)
    url.searchParams.set('keyword', keyword)
    url.searchParams.set('classificationName', 'music')
    url.searchParams.set('size', '5')
    url.searchParams.set('sort', 'date,asc')

    if (country) {
      url.searchParams.set('countryCode', country.trim().toUpperCase().slice(0, 2))
    } else if (lat && lng) {
      // No country filter — use geo radius search instead, sorted by relevance/distance
      url.searchParams.set('latlong', `${lat},${lng}`)
      url.searchParams.set('radius', '5000')        // 5000 km radius — effectively global
      url.searchParams.set('unit', 'km')
      url.searchParams.set('sort', 'relevance,desc')
    }

    const res  = await fetch(url.toString())
    const data = await res.json()
    const evts = data?._embedded?.events ?? []

    return evts.map((e: Record<string, unknown>) => ({
      name:  e.name,
      date:  (e.dates as Record<string, Record<string, string>>)?.start?.localDate ?? '',
      venue: ((e._embedded as Record<string, Record<string, string>[]>)?.venues?.[0] as Record<string, string>)?.name ?? '',
      city:  (((e._embedded as Record<string, Record<string, Record<string, string>>[]>)?.venues?.[0] as Record<string, Record<string, string>>)?.city as Record<string, string>)?.name ?? '',
      country: (((e._embedded as Record<string, Record<string, Record<string, string>>[]>)?.venues?.[0] as Record<string, Record<string, string>>)?.country as Record<string, string>)?.name ?? '',
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
  const lat      = parseFloat(searchParams.get('lat') ?? '')
  const lng      = parseFloat(searchParams.get('lng') ?? '')

  const [genreEvents, subgenreEvents] = await Promise.all([
    fetchEvents(genre, country, isNaN(lat) ? undefined : lat, isNaN(lng) ? undefined : lng),
    fetchEvents(subgenre || genre, country, isNaN(lat) ? undefined : lat, isNaN(lng) ? undefined : lng),
  ])

  return NextResponse.json({ genreEvents, subgenreEvents })
}
