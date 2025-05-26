import { NextResponse } from 'next/server';
import { fetchData } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const indicators = await fetchData("indicators","es"); 
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de indicadores' }, { status: 500 });
  }
} 