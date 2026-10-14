/**
 * Идентификаторы жанров TMDB не зависят от языка интерфейса.
 * Названия здесь английские: статистика личной коллекции опирается на них,
 * даже если карточка когда-то пришла без поля genres.
 */
export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
] as const

const GENRE_NAMES = new Map<number, string>(GENRES.map((genre) => [genre.id, genre.name]))

/** Возвращает английское имя жанра или сам номер, если TMDB добавит новый id. */
export function genreName(id: number) {
  return GENRE_NAMES.get(id) ?? `Genre ${id}`
}
