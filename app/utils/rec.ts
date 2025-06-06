// dinoRecommender.ts
import { LocationClient, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";
import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

// Explicit path fallback if needed
dotenv.config();

interface Place {
  source: 'google' | 'amazon' | 'spoonacular';
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
  if (typeof address !== 'string') return '';
  return address
    .toLowerCase()
    .replace(/[,]/g, '') // Remove commas
    .replace(/\b(ste|suite|#)\s*\d+\b/g, '') // Remove suite/unit/#
    .replace(/\bstreet\b/g, 'st')
    .replace(/\broad\b/g, 'rd')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/[^\w\s]/gi, '') // Remove any other punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLabel(label: string): string {
  if (typeof label !== 'string') return '';
  return label.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
}

function deduplicatePlaces(places: Place[], thresholdKm = 0.1): Place[] {
  const seen = new Map<string, Place>();

  for (const place of places) {
    const normAddr = normalizeAddress(place.address);
    const normLabel = normalizeLabel(place.label);
    console.log(`Processing place: ${normLabel} at ${normAddr}`);
    let duplicate = false;

    for (const [key, existing] of seen.entries()) {
      const [existingLabel, existingAddr] = key.split('|');
      // Compare both normalized label and address, and check distance
      if (
        normLabel === existingLabel &&
        normAddr === existingAddr
      ) {
        const dist = getDistanceKm(place.lat, place.lng, existing.lat, existing.lng);
        if (dist < thresholdKm) {
          duplicate = true;
          break;
        }
      }
    }

    if (!duplicate) {
      seen.set(`${normLabel}|${normAddr}`, place);
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
  const params = {
    location: `${lat},${lng}`,
    radius,
    keyword,
    type: 'restaurant',
    key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY as string,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data.results.map((place: any) => ({
      source: 'google',
      label: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      misc: place,
    }));
  } catch (error) {
    console.error('Google Places error:', error);
    return [];
  }
}

async function fetchAmazonPlaces(lat: number, lng: number, radius: number, foodType: string): Promise<Place[]> {
  const client = new LocationClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const command = new SearchPlaceIndexForTextCommand({
    IndexName: process.env.EXPO_PUBLIC_AWS_PLACE_INDEX as string,
    Text: foodType,
    BiasPosition: [lng, lat],
    MaxResults: 50,
  });

  try {
    const response = await client.send(command);
    return (response.Results || []).map((result: any) => {
      const place = result.Place;
      return {
        source: 'amazon',
        label: (place.Label).split(',')[0],
        address: [
          place.AddressNumber,
          place.Street,
          place.Municipality,
          place.Region,
          place.PostalCode,
          place.Country,
        ].filter(Boolean).join(' '),
        lat: place.Geometry.Point[1],
        lng: place.Geometry.Point[0],
        misc: place,
      };
    });
  } catch (error) {
    console.error('Amazon Places error:', error);
    return [];
  }
}

async function fetchSpoonacularPlaces(lat: number, lng: number, radius: number, keyword: string): Promise<Place[]> {
  const apiKey = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY as string;
  const url = `https://api.spoonacular.com/food/restaurants/search`;
  const params = {
    query: keyword,
    lat,
    lng,
    radius,
    number: 50,
  };

  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'x-api-key': apiKey,
      },
    });
    // Spoonacular's response structure may differ; adjust as needed
    return (response.data.restaurants || []).map((place: any) => ({
      source: 'spoonacular',
      label: place.name,
      address: place.address?.street_addr || place.address || '',
      lat: place.geo?.latitude || place.latitude,
      lng: place.geo?.longitude || place.longitude,
      misc: place,
    }));
  } catch (error) {
    console.error('Spoonacular error:', error);
    return [];
  }
}

export async function getRecommendations(context: Context): Promise<Place[]> {
  const [googleResults, amazonResults, spoonacularResults] = await Promise.all([
    fetchGooglePlaces(context.homeLat, context.homeLng, context.radius, context.keyword),
    fetchAmazonPlaces(context.homeLat, context.homeLng, context.radius, context.keyword),
    fetchSpoonacularPlaces(context.homeLat, context.homeLng, context.radius, context.keyword),
  ]);

  const combined = [...googleResults, ...amazonResults, ...spoonacularResults];
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
  // console.log('Top Recommendations (JSON):');
  // console.log(JSON.stringify(
  //   recommendations.map(place => ({
  //     label: place.label,
  //     address: place.address,
  //     score: place.score,
  //     distance_km: place.distance_km,
  //     source: place.source === 'google' ? 'Google' : 'AWS'
  //   })),
  //   null,
  //   2
  // ));
  console.log("Saved recommendations to results.json");

  writeFileSync('app/utils/results.json', JSON.stringify(recommendations, null, 2));
  console.log('Results saved to results.json');
})();