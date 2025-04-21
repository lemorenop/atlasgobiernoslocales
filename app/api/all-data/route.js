import { NextResponse } from 'next/server';
import { getAllData } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const allData = await getAllData();
    return NextResponse.json(allData);
  } catch (error) {
    console.error('Error fetching all data:', error);
    return NextResponse.json({ error: 'Error al obtener todos los datos' }, { status: 500 });
  }
} 