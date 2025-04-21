import { NextResponse } from 'next/server';
import { getRegions } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const regions = await getRegions();
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de regiones' }, { status: 500 });
  }
} 