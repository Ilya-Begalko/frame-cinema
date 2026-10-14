import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addCollection,
  addMovieToCollection,
  deleteCollection,
  emptyLibrary,
  mergeLibrary,
  rememberMovie,
  removeMovieFromCollection,
  setNote,
  setRating,
  toggleFavorite,
  toggleWatched,
  toggleWatchlist,
} from '../features/collections/library'
import type { CinemaLanguage, CinemaSnapshot, LibraryData, SavedMovie, SharedCollection } from '../features/collections/types'

/**
 * Zustand хранит то, что принадлежит пользователю и должно пережить перезагрузку.
 * persist записывает часть состояния в localStorage под ключом frame-cinema.
 *
 * Серверные фильмы сюда не кладём: их кэширует TanStack Query и может обновить.
 * Открытые окна и черновик поиска тоже не кладём: это временный React state.
 */
interface CinemaStore extends LibraryData {
  toggleFavorite: (movie: SavedMovie) => void
  toggleWatchlist: (movie: SavedMovie) => void
  toggleWatched: (movie: SavedMovie) => void
  remember: (movie: SavedMovie) => void
  setRating: (id: number, rating: number | null) => void
  setNote: (id: number, note: string) => void
  createCollection: (name: string, description: string) => void
  deleteCollection: (id: string) => void
  addToCollection: (collectionId: string, movie: SavedMovie) => void
  removeFromCollection: (collectionId: string, movieId: number) => void
  mergeImported: (snapshot: CinemaSnapshot) => void
  replaceImported: (snapshot: CinemaSnapshot) => void
  importShared: (collection: SharedCollection) => void
  setLanguage: (language: CinemaLanguage) => void
}

export const useCinemaStore = create<CinemaStore>()(
  persist(
    (set) => ({
      ...emptyLibrary(),
      toggleFavorite: (movie) => set((state) => toggleFavorite(state, movie)),
      toggleWatchlist: (movie) => set((state) => toggleWatchlist(state, movie)),
      toggleWatched: (movie) => set((state) => toggleWatched(state, movie, new Date().toISOString())),
      remember: (movie) => set((state) => rememberMovie(state, movie)),
      setRating: (id, rating) => set((state) => setRating(state, id, rating)),
      setNote: (id, note) => set((state) => setNote(state, id, note)),
      createCollection: (name, description) =>
        set((state) => addCollection(state, { name, description }, crypto.randomUUID(), new Date().toISOString())),
      deleteCollection: (id) => set((state) => deleteCollection(state, id)),
      addToCollection: (collectionId, movie) => set((state) => addMovieToCollection(state, collectionId, movie)),
      removeFromCollection: (collectionId, movieId) =>
        set((state) => removeMovieFromCollection(state, collectionId, movieId)),
      mergeImported: (snapshot) => set((state) => mergeLibrary(state, snapshot)),
      replaceImported: (snapshot) =>
        set((state) => ({
          ...emptyLibrary(),
          ...mergeLibrary(emptyLibrary(), snapshot),
          language: state.language,
        })),
      importShared: (collection) =>
        set((state) => {
          const id = crypto.randomUUID()
          const withCollection = addCollection(
            state,
            { name: collection.name, description: collection.description },
            id,
            new Date().toISOString(),
          )
          return collection.movies.reduce(
            (next, movie) => addMovieToCollection(next, id, movie),
            withCollection,
          )
        }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'frame-cinema',
      version: 1,
      partialize: (state) => ({
        favorites: state.favorites,
        watchlist: state.watchlist,
        watched: state.watched,
        ratings: state.ratings,
        notes: state.notes,
        collections: state.collections,
        library: state.library,
        language: state.language,
      }),
    },
  ),
)
