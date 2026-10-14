/** Склеивает классы и выбрасывает пустые. Свой маленький аналог библиотеки clsx. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
