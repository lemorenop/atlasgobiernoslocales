'use client';

import { useEffect, useState } from 'react';
import { fetchGovernments, fetchNavbarCopy } from '@/app/utils/apiClient';
import { getDictionary } from '@/app/i18n.config';
import Link from 'next/link';
import { getTextById } from '@/app/utils/textUtils';  
export default function Jurisdictions({lang}) {
  const [governments, setGovernments] = useState([]);
  const [dictionary, setDictionary] = useState({});
  const [loading, setLoading] = useState(true);
  const [jurisdictionSlug, setJurisdictionSlug] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [govData, dict, navbarCopy] = await Promise.all([
          fetchGovernments(),
          getDictionary(lang),
          fetchNavbarCopy()
        ]);
        setJurisdictionSlug(getTextById(navbarCopy, "jurisdictions_slug", lang))
        setGovernments(govData);
        setDictionary(dict);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Cargando jurisdicciones...</h1>
      </div>
    );
  }

  const jurisdictionTitle = dictionary.jurisdictions?.title || 'Jurisdicciones';
  const jurisdictionSubtitle = dictionary.jurisdictions?.subtitle || 'Seleccione una jurisdicción para ver sus datos';

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{jurisdictionTitle}</h1>
      <p className="text-lg mb-8">{jurisdictionSubtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {governments.map((government) => {          
          return (
            <Link 
              href={`/${lang}/${jurisdictionSlug}/${government.id}`}
              key={government.id}
              className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{government.name}</h2>
              <p className="text-gray-600 mb-4">{government.country_name}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{government.level_per_country_name}</span>
                <span className="text-blue-600">Ver detalles →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

