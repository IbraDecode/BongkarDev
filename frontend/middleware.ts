import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './src/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  matcher: ['/((?!_next|.*\..*).*)'],
};
