import en from "./en";
import ro from "./ro";

export const translations = { en, ro } as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

const interpolate = (
  value: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return value;
  let result = value;
  Object.entries(params).forEach(([key, paramValue]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(paramValue));
  });
  return result;
};

export const t = (
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string => {
  const table = translations[language] ?? translations.en;
  const value = String(table[key] ?? translations.en[key] ?? key);
  return interpolate(value, params);
};

export const tRaw = (
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string | null => {
  const table = translations[language] ?? translations.en;
  const value =
    (table as Record<string, string>)[key] ??
    (translations.en as Record<string, string>)[key];
  if (value === undefined) return null;
  return interpolate(String(value), params);
};
