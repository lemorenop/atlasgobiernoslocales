import { NextResponse } from 'next/server';
import { getHomeMapTooltip } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const homeMapTooltip = await getHomeMapTooltip();
    return NextResponse.json(homeMapTooltip);
  } catch (error) {
    console.error('Error fetching home map tooltip data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de tooltip del mapa de la página de inicio' }, { status: 500 });
  }
} 