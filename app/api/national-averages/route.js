import { NextResponse } from 'next/server';
import { getNationalAverages } from '@/app/utils/dataFetchers';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const countryIso3 = searchParams.get('country_iso3');
    const nivel = searchParams.get('nivel');
    
    // Fetch all national averages data
    const data = await getNationalAverages();
    
    // Apply filters if provided
    let filteredData = data;
    
    if (countryIso3) {
      filteredData = filteredData.filter(item => item.country_iso3 === countryIso3);
    }
    
    if (nivel) {
      filteredData = filteredData.filter(item => item.nivel == nivel);
    }
    
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching national averages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch national averages data' },
      { status: 500 }
    );
  }
} 