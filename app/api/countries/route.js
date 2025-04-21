import { NextResponse } from 'next/server';
import { getCountries } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de países' }, { status: 500 });
  }
} 