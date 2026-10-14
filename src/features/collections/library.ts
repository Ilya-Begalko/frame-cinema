import type { LibraryData, SavedMovie, UserCollection, WatchedMovie } from './types'

export function emptyLibrary(): LibraryData {
  return {
    favorites: [],
    watchlist: [],
    watched: [],
    ratings: {},
    notes: {},
    collections: [],
    library: {},
    language: 'en-US',
  }
}

function remember(library: LibraryData['library'], movie: SavedMovie) {
  const key = String(movie.id)
  const previous = library[key]
  return {
    ...library,
    [key]: {
      ...previous,
      ...movie,
      director: movie.director || previous?.director,
      overview: movie.overview || previous?.overview || '',
    },
  }
}

/** Кладёт фильм в список или убирает его, если он уже там. Порядок — сначала новые. */
export function toggleMovie<T extends SavedMovie>(list: readonly T[], movie: T): T[] {
  if (list.some((item) => item.id === movie.id)) {
    return list.filter((item) => item.id !== movie.id)
  }
  return [movie, ...list]
}

export function toggleFavorite(state: LibraryData, movie: SavedMovie): LibraryData {
  return {
    ...state,
    favorites: toggleMovie(state.favorites, movie),
    library: remember(state.library, movie),
  }
}

export function toggleWatchlist(state: LibraryData, movie: SavedMovie): LibraryData {
  return {
    ...state,
    watchlist: toggleMovie(state.watchlist, movie),
    library: remember(state.library, movie),
  }
}

/**
 * Просмотренное исключает фильм из «Посмотреть»: он уже не ждёт вечера.
 * Повторный вызов снимает отметку и не возвращает его в список ожидания.
 */
export function toggleWatched(state: LibraryData, movie: SavedMovie, watchedAt: string): LibraryData {
  const already = state.watched.some((item) => item.id === movie.id)
  const watched: WatchedMovie[] = already
    ? state.watched.filter((item) => item.id !== movie.id)
    : [{ ...movie, watchedAt }, ...state.watched]
  return {
    ...state,
    watched,
    watchlist: already ? state.watchlist : state.watchlist.filter((item) => item.id !== movie.id),
    library: remember(state.library, movie),
  }
}

/** Обновляет снимок в списках, где фильм уже лежит. Нужно, чтобы дописать режиссёра. */
export function rememberMovie(state: LibraryData, movie: SavedMovie): LibraryData {
  const refresh = <T extends SavedMovie>(list: T[]): T[] =>
    list.map((item) =>
      item.id === movie.id
        ? { ...item, ...movie, director: movie.director || item.director, overview: movie.overview || item.overview }
        : item,
    )
  return {
    ...state,
    library: remember(state.library, movie),
    favorites: refresh(state.favorites),
    watchlist: refresh(state.watchlist),
    watched: refresh(state.watched),
  }
}

export function setRating(state: LibraryData, id: number, rating: number | null): LibraryData {
  const ratings = { ...state.ratings }
  if (rating === null) delete ratings[String(id)]
  else ratings[String(id)] = rating
  return { ...state, ratings }
}

export function setNote(state: LibraryData, id: number, note: string): LibraryData {
  const notes = { ...state.notes }
  const trimmed = note.trim()
  if (!trimmed) delete notes[String(id)]
  else notes[String(id)] = note
  return { ...state, notes }
}

export function addCollection(
  state: LibraryData,
  draft: { name: string; description: string },
  id: string,
  createdAt: string,
): LibraryData {
  const name = draft.name.trim()
  if (!name) return state
  const collection: UserCollection = {
    id,
    name,
    description: draft.description.trim(),
    movieIds: [],
    createdAt,
  }
  return { ...state, collections: [collection, ...state.collections] }
}

export function deleteCollection(state: LibraryData, id: string): LibraryData {
  return { ...state, collections: state.collections.filter((collection) => collection.id !== id) }
}

export function addMovieToCollection(state: LibraryData, collectionId: string, movie: SavedMovie): LibraryData {
  return {
    ...state,
    library: remember(state.library, movie),
    collections: state.collections.map((collection) => {
      if (collection.id !== collectionId || collection.movieIds.includes(movie.id)) return collection
      return { ...collection, movieIds: [...collection.movieIds, movie.id] }
    }),
  }
}

export function removeMovieFromCollection(state: LibraryData, collectionId: string, movieId: number): LibraryData {
  return {
    ...state,
    collections: state.collections.map((collection) =>
      collection.id === collectionId
        ? { ...collection, movieIds: collection.movieIds.filter((id) => id !== movieId) }
        : collection,
    ),
  }
}

function mergeById<T extends { id: number }>(current: readonly T[], incoming: readonly T[]): T[] {
  const map = new Map<number, T>()
  for (const item of current) map.set(item.id, item)
  for (const item of incoming) {
    const previous = map.get(item.id)
    map.set(item.id, previous ? { ...previous, ...item, id: item.id } : item)
  }
  return [...map.values()]
}

function asSaved(movie: SavedMovie): SavedMovie {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    voteAverage: movie.voteAverage,
    genreIds: [...movie.genreIds],
    overview: movie.overview,
    director: movie.director,
  }
}

/** Импорт не стирает то, что уже было в этом браузере. Совпадающие id обновляются. */
export function mergeLibrary(
  current: LibraryData,
  incoming: Pick<LibraryData, 'favorites' | 'watchlist' | 'watched' | 'ratings' | 'notes' | 'collections'>,
): LibraryData {
  const favorites = mergeById(current.favorites, incoming.favorites)
  const watchlist = mergeById(current.watchlist, incoming.watchlist)
  const watched = mergeById(current.watched, incoming.watched)
  const library = { ...current.library }
  for (const movie of [...favorites, ...watchlist, ...watched]) {
    const saved = asSaved(movie)
    const previous = library[String(movie.id)]
    library[String(movie.id)] = {
      ...previous,
      ...saved,
      director: saved.director || previous?.director,
      overview: saved.overview || previous?.overview || '',
    }
  }
  const collections = new Map(current.collections.map((collection) => [collection.id, collection]))
  for (const collection of incoming.collections) collections.set(collection.id, collection)
  return {
    ...current,
    favorites,
    watchlist,
    watched,
    ratings: { ...current.ratings, ...incoming.ratings },
    notes: { ...current.notes, ...incoming.notes },
    collections: [...collections.values()],
    library,
  }
}
