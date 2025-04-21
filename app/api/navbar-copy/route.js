import { NextResponse } from 'next/server';
import { getNavbarCopy } from '@/app/utils/dataFetchers';

export async function GET() {
  try {
    const navbarCopy = await getNavbarCopy();
    return NextResponse.json(navbarCopy);
  } catch (error) {
    console.error('Error fetching navbar copy data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos de la barra de navegación' }, { status: 500 });
  }
} 