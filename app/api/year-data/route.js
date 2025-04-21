import { NextResponse } from 'next/server';
import { getYearData } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const yearData = await getYearData();
    return NextResponse.json(yearData);
  } catch (error) {
    console.error('Error fetching year data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de años' }, { status: 500 });
  }
} 