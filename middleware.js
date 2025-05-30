export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)  
    '/((?!api|_next/static|_next/image|favicon.ico).*)|public',
  ],
}; 