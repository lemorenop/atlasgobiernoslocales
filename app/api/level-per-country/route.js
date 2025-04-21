import { NextResponse } from 'next/server';
import { getLevelPerCountry } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const levelPerCountry = await getLevelPerCountry();
    return NextResponse.json(levelPerCountry);
  } catch (error) {
    console.error('Error fetching level per country data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de nivel por país' }, { status: 500 });
  }
} 