// Geocoding utility using Mapbox
// Falls back to city center coordinates if geocoding fails

interface GeocodeResult {
  lat: number;
  lng: number;
  confidence: 'high' | 'medium' | 'low';
}

// City center fallback coordinates
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Manchester': { lat: 53.4808, lng: -2.2426 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Birmingham': { lat: 52.4862, lng: -1.8904 },
  'Leeds': { lat: 53.8008, lng: -1.5491 },
  'Bristol': { lat: 51.4545, lng: -2.5879 },
  'Edinburgh': { lat: 55.9533, lng: -3.1883 },
  'Glasgow': { lat: 55.8642, lng: -4.2518 },
  'Liverpool': { lat: 53.4084, lng: -2.9916 },
  'Sheffield': { lat: 53.3811, lng: -1.4701 },
  'Newcastle': { lat: 54.9783, lng: -1.6178 },
  'Nottingham': { lat: 52.9548, lng: -1.1581 },
  'Brighton': { lat: 50.8225, lng: -0.1372 },
  'Oxford': { lat: 51.7520, lng: -1.2577 },
  'Cambridge': { lat: 52.2053, lng: 0.1218 },
  'Cardiff': { lat: 51.4816, lng: -3.1791 },
};

export async function geocodeMeetingPoint(
  meetingPoint: string,
  area: string,
  city: string
): Promise<GeocodeResult> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // If no Mapbox token, use city center fallback
  if (!mapboxToken) {
    console.warn('No Mapbox token configured, using city center fallback');
    const fallback = cityCoordinates[city] || { lat: 51.5074, lng: -0.1278 }; // Default to London
    return { ...fallback, confidence: 'low' };
  }

  try {
    // Build search query: "meeting point, area, city, UK"
    const searchQuery = encodeURIComponent(`${meetingPoint}, ${area}, ${city}, UK`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxToken}&country=gb&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const relevance = data.features[0].relevance;

      return {
        lat,
        lng,
        confidence: relevance > 0.8 ? 'high' : relevance > 0.5 ? 'medium' : 'low',
      };
    }

    // No results, try with just area and city
    const fallbackQuery = encodeURIComponent(`${area}, ${city}, UK`);
    const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fallbackQuery}.json?access_token=${mapboxToken}&country=gb&limit=1`;

    const fallbackResponse = await fetch(fallbackUrl);
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.features && fallbackData.features.length > 0) {
        const [lng, lat] = fallbackData.features[0].center;
        return { lat, lng, confidence: 'medium' };
      }
    }

    // Ultimate fallback to city center
    const cityFallback = cityCoordinates[city] || { lat: 51.5074, lng: -0.1278 };
    return { ...cityFallback, confidence: 'low' };
  } catch (error) {
    console.error('Geocoding error:', error);
    const fallback = cityCoordinates[city] || { lat: 51.5074, lng: -0.1278 };
    return { ...fallback, confidence: 'low' };
  }
}
