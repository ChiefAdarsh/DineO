// dinoRecommender.ts
import axios from 'axios';

// import endpointsConfig from '../../endpoints.config';

interface Place {
  source: 'google' | 'amazon';
  label: string;
  address: string;
  lat: number;
  lng: number;
  distance_km?: number;
  score?: number;
}

interface Context {
  userDiet: string[];
  groupDiet: string[];
  userCuisine: string[];
  recentVisits: string[];
  homeLat: number;
  homeLng: number;
  radius: number;
  keyword: string;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\bstreet\b/g, 'st')
    .replace(/\broad\b/g, 'rd')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\s+/g, ' ')
    .trim();
}

function deduplicatePlaces(places: Place[], thresholdKm = 0.1): Place[] {
  const seen = new Map<string, Place>();

  for (const place of places) {
    const normAddr = normalizeAddress(place.address);
    let duplicate = false;

    for (const [key, existing] of seen.entries()) {
      if (normAddr === key) {
        const dist = getDistanceKm(place.lat, place.lng, existing.lat, existing.lng);
        if (dist < thresholdKm) {
          duplicate = true;
          break;
        }
      }
    }

    if (!duplicate) {
      seen.set(normAddr, place);
    }
  }
  return Array.from(seen.values());
}

function scorePlace(place: Place, context: Context): Place {
  const { userDiet, groupDiet, userCuisine, recentVisits, homeLat, homeLng } = context;
  const label = place.label.toLowerCase();
  let score = 0;

  if (label.includes('halal') && userDiet.includes('halal')) score += 5;
  if (groupDiet.some(tag => label.includes(tag))) score += 3;
  if (userCuisine.some(c => label.includes(c))) score += 2;
  if (recentVisits.includes(label)) score -= 2;

  const dist = getDistanceKm(homeLat, homeLng, place.lat, place.lng);
  place.distance_km = parseFloat(dist.toFixed(2));
  if (dist <= 2) score += 2;
  else if (dist <= 5) score += 1;

  place.score = score;
  return place;
}

async function fetchGooglePlaces(lat: number, lng: number, radius: number, keyword: string): Promise<Place[]> {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
  console.log('Google Places API Key:', process.env.GOOGLE_API_KEY);
  const params = {
    location: `${lat},${lng}`,
    radius,
    keyword,
    type: 'restaurant',
    key: process.env.GOOGLE_API_KEY as string,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data.results.map((place: any) => ({
      source: 'google',
      label: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    }));
  } catch (error) {
    console.error('Google Places error:', error);
    return [];
  }
}

async function fetchAmazonPlaces(lat: number, lng: number, radius: number, foodType: string): Promise<Place[]> {
  const url = `https://places.geo.us-east-1.amazonaws.com/places/v0/indexes/DinoIndex/search/position`;
  const body = {
    Position: [lng, lat],
    MaxResults: 50,
    FilterCategories: ['Restaurant'],
    FilterFoodTypes: [foodType],
  };

  try {
    const key = process.env.AWS_API_KEY as string;
    console.log('Amazon Places API Key:', key);
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Amz-Api-Key': key,
      },
    });

    return response.data.Results.map((result: any) => ({
      source: 'amazon',
      label: result.Place.Label,
      address: result.Place.Address,
      lat: result.Place.Geometry.Point[1],
      lng: result.Place.Geometry.Point[0],
    }));
  } catch (error) {
    console.error('Amazon Places error:', error);
    return [];
  }
}

export async function getRecommendations(context: Context): Promise<Place[]> {
  const [googleResults, amazonResults] = await Promise.all([
    fetchGooglePlaces(context.homeLat, context.homeLng, context.radius, context.keyword),
    fetchAmazonPlaces(context.homeLat, context.homeLng, context.radius, context.keyword),
  ]);

  const combined = [...googleResults, ...amazonResults];
  const deduped = deduplicatePlaces(combined);
  const scored = deduped.map(place => scorePlace(place, context));
  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// Example test execution
(async () => {
  const context: Context = {
    userDiet: ['halal', 'vegetarian'],
    groupDiet: ['halal', 'gluten-free'],
    userCuisine: ['mediterranean', 'indian'],
    recentVisits: ['madina halal grill'],
    homeLat: 32.9857,
    homeLng: -96.7501,
    radius: 5000,
    keyword: 'halal'
  };

  const recommendations = await getRecommendations(context);
  console.log('Top Recommendations:');
  recommendations.forEach(place => {
    console.log(`- ${place.label} (${place.address}) — Score: ${place.score}, Distance: ${place.distance_km} km`);
  });
})();