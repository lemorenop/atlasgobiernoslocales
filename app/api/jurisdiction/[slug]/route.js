import { NextResponse } from 'next/server';
import { getGovernments, getAllData, getIndicators, getYearData, getCountries } from '@/app/utils/dataFetchers';
import { getFromCache, setInCache } from '@/app/utils/cache';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    // Verificar si los datos filtrados ya están en caché
    const cacheKey = `jurisdiction_${slug}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Obtener el gobierno específico
    const governments = await getGovernments();
    const foundGovernment = governments.find(gov => gov.id === slug);
    const countries = await getCountries();
    const foundCountry = countries.find(country => country.iso3 === foundGovernment.country_iso3);
    if (!foundGovernment) {
      return NextResponse.json({ error: 'Gobierno no encontrado' }, { status: 404 });
    }
    
    // Obtener todos los datos y filtrar por el ID del gobierno
    const [allData, indicatorsData, yearData] = await Promise.all([
      getAllData(),
      getIndicators(),
      getYearData()
    ]);
    
    // Filtrar los datos del año por el país del gobierno
    const filteredYearData = yearData.filter(elm => elm.country_iso3 === foundGovernment.country_iso3)[0];
    
    // Filtrar los datos por el ID del gobierno
    const filteredData = allData.filter(item => item.government_id === slug);
    
    // Agregar los datos del año al objeto del gobierno
    foundGovernment.yearData = filteredYearData;
    
    // Preparar la respuesta
    const responseData = {
      government: {...foundGovernment, country: foundCountry},
      governmentData: filteredData,
      indicators: indicatorsData
    };
    
    // Almacenar en caché (con un TTL más corto para los datos filtrados)
    setInCache(cacheKey, responseData, 30 * 60 * 1000); // 30 minutos
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching government data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
} 