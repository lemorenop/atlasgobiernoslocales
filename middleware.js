import { NextResponse } from 'next/server';
import { i18n } from '@/app/i18n.config';
import { getOriginalSlug, slugExists } from '@/app/utils/slugMapping';

// export function middleware(request) {
//   const pathname = request.nextUrl.pathname;
  
//   // Check if the pathname already has a locale
//   const pathnameHasLocale = i18n.locales.some(
//     (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
//   );

//   if (!pathnameHasLocale) {
//     // Redirect to the default locale if no locale is present
//     const locale = i18n.defaultLocale;
//     const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
//     console.log('Middleware: Redirecting to:', newUrl.toString());
//     return NextResponse.redirect(newUrl);
//   }
  
//   // Get locale from URL
//   const locale = pathname.split('/')[1];
  
//   // Process the URL segments to handle translated slugs
//   if (pathname.split('/').length > 2) {
//     // Extract the segments after the locale
//     const segments = pathname.split('/').slice(2);
    
//     // Check if we need to handle translations
//     let needsRewrite = false;
//     const originalSegments = [...segments];
    
//     // Get the original slug for the first segment (which is likely the page name)
//     // This helps Next.js router find the correct page component
//     if (segments.length > 0) {
//       const firstSegment = segments[0];
//       const originalFirstSlug = getOriginalSlug(firstSegment, locale);
      
//       // If the slug was translated and different from the original
//       if (originalFirstSlug !== firstSegment && slugExists(firstSegment, locale)) {
//         originalSegments[0] = originalFirstSlug;
//         needsRewrite = true;
//       }
//     }
    
//     // For jurisdiction pages, also translate the second segment (jurisdiction slug)
//     if (segments.length > 1 && 
//         (segments[0] === 'jurisdictions' || 
//          getOriginalSlug(segments[0], locale) === 'jurisdictions')) {
      
//       const jurisdictionSlug = segments[1];
//       const originalJurisdictionSlug = getOriginalSlug(jurisdictionSlug, locale);
      
//       // If the jurisdiction slug was translated
//       if (originalJurisdictionSlug !== jurisdictionSlug && slugExists(jurisdictionSlug, locale)) {
//         originalSegments[1] = originalJurisdictionSlug;
//         needsRewrite = true;
//       }
//     }
    
//     // If any segment needed translation, rewrite the URL internally
//     if (needsRewrite) {
//       // Create the rewritten URL with original slugs for internal routing
//       const rewriteUrl = new URL(`/${locale}/${originalSegments.join('/')}`, request.url);
      
//       // Add custom headers so the page knows the translated slugs
//       const response = NextResponse.rewrite(rewriteUrl);
//       response.headers.set('x-localized-path', pathname);
      
//       return response;
//     }
//   }
// }

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)  
    '/((?!api|_next/static|_next/image|favicon.ico).*)|public',
  ],
}; 