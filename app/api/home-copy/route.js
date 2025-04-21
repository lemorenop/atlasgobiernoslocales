import { NextResponse } from 'next/server';
import { getHomeCopy } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const homeCopy = await getHomeCopy();
    return NextResponse.json(homeCopy);
  } catch (error) {
    console.error('Error fetching home copy data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de contenido de la página de inicio' }, { status: 500 });
  }
} 