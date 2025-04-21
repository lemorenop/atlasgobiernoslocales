import { NextResponse } from 'next/server';
import { getAboutCopy } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const aboutCopy = await getAboutCopy();
    return NextResponse.json(aboutCopy);
  } catch (error) {
    console.error('Error fetching about copy data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de la página "Acerca de"' }, { status: 500 });
  }
} 