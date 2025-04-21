'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { translateSlug } from '@/app/utils/slugMapping';

/**
 * Un componente Link personalizado que traduce automáticamente los slugs según el idioma actual
 * 
 * Uso:
 * <LocalizedLink href="/indicators">Indicadores</LocalizedLink>
 * Se traduce automáticamente a "/indicadores" en español, "/indicators" en inglés, etc.
 */
export default function LocalizedLink({ href, children, ...props }) {
  const params = useParams();
  const currentLocale = params.lang;
  
  // Si la href es externa o absoluta, no hacemos traducción
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return <Link href={href} {...props}>{children}</Link>;
  }
  
  // Si la href empieza con el idioma actual, no hacemos nada
  if (href.startsWith(`/${currentLocale}`)) {
    return <Link href={href} {...props}>{children}</Link>;
  }
  
  // Si es una ruta relativa como "/about", necesitamos traducirla
  if (href.startsWith('/')) {
    // Quitamos el slash inicial
    const path = href.substring(1);
    
    // Si la ruta contiene múltiples segmentos, dividimos y traducimos el primer segmento
    const segments = path.split('/');
    
    if (segments.length > 0 && segments[0]) {
      // Traducir el primer segmento (nombre de la página) de inglés al idioma actual
      const translatedFirstSegment = translateSlug(segments[0], 'en', currentLocale);
      segments[0] = translatedFirstSegment;
      
      // Reconstruir la ruta con el segmento traducido
      const localizedHref = `/${currentLocale}/${segments.join('/')}`;
      return <Link href={localizedHref} {...props}>{children}</Link>;
    }
    
    // Si la ruta es solo "/", redirigir a la página principal con el idioma
    return <Link href={`/${currentLocale}`} {...props}>{children}</Link>;
  }
  
  // Para rutas relativas sin slash inicial, añadir el idioma
  return <Link href={`/${currentLocale}/${href}`} {...props}>{children}</Link>;
} 