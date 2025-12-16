import { getRequestConfig, unstable_setRequestLocale } from 'next-intl/server';

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'id';

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  unstable_setRequestLocale(activeLocale);

  return {
    locale: activeLocale,
    messages: (await import(`../locales/${activeLocale}.json`)).default,
  };
});
