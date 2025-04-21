import { NextResponse } from 'next/server';
import { getPageError } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const pageError = await getPageError();
    return NextResponse.json(pageError);
  } catch (error) {
    console.error('Error fetching page error data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de error de la página' }, { status: 500 });
  }
} 
