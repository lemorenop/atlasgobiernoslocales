import { NextResponse } from 'next/server';
import { getFooterCopy } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const footerCopy = await getFooterCopy();
    return NextResponse.json(footerCopy);
  } catch (error) {
    console.error('Error fetching footer copy data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos del pie de página' }, { status: 500 });
  }
} 