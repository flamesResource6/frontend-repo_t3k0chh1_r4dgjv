import React, { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Search, Sparkles, Star, ChevronRight, X, Filter } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All')
  const [selected, setSelected] = useState(null)

  const genres = useMemo(() => {
    const all = Array.from(new Set(comics.map(c => c.genre))).sort()
    return ['All', ...all]
  }, [comics])

  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true)
        const url = new URL('/api/comics', BACKEND_URL)
        if (query) url.searchParams.set('q', query)
        if (genre && genre !== 'All') url.searchParams.set('genre', genre)
        const res = await fetch(url.toString())
        if (!res.ok) throw new Error('Failed to load comics')
        const data = await res.json()
        setComics(data)
        setError('')
      } catch (e) {
        setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchComics()
  }, [query, genre])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Hero onExplore={() => {
        const el = document.getElementById('collection')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }} />

      {/* Sticky search/filter bar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row gap-3 items-center">
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="hidden md:block text-gray-500 mr-1"><Filter size={16} /></div>
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-full border text-sm transition whitespace-nowrap ${genre === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collection grid */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Featured Collection</h2>
            <p className="text-gray-600">Handpicked stories with bold art and great vibes</p>
          </div>
          <a href="/test" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold">
            Check backend <ChevronRight size={18} />
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : comics.map(c => (
              <ComicCard key={c.id} comic={c} onSelect={() => setSelected(c)} />
            ))}
        </div>

        {!loading && comics.length === 0 && !error && (
          <div className="text-center py-20 text-gray-600">No comics found. Try a different search.</div>
        )}
      </section>

      <Footer />

      {selected && <ComicModal comic={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Hero({ onExplore }) {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/fN2AgePov5Uh0jfA/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white"></div>
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-3 py-1 mb-4 backdrop-blur">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-xs tracking-wide">New • Handpicked indie comics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-sm">
            Dive into a Universe of Comics
          </h1>
          <p className="mt-4 max-w-2xl text-gray-700 text-lg md:text-xl">
            Comic-style clouds, playful vibes, and a bold catalog. Discover stunning worlds, fresh voices, and unforgettable art.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={onExplore} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold shadow-lg shadow-indigo-600/30 transition">
              Explore Collection
            </button>
            <a href="#collection" className="inline-flex items-center justify-center rounded-xl bg-white/70 hover:bg-white text-gray-900 px-6 py-3 font-semibold shadow border border-gray-200 transition">
              Browse Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ComicCard({ comic, onSelect }) {
  return (
    <button onClick={onSelect} className="group text-left rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/10 transition">
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img src={comic.cover_url} alt={comic.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-lg line-clamp-1">{comic.title}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={16} className="fill-amber-400" />
            <span className="text-sm font-semibold text-gray-700">{(comic.rating ?? 4.5).toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{comic.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-semibold">{comic.genre}</span>
          {Array.isArray(comic.tags) && comic.tags.slice(0, 2).map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{t}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 animate-pulse">
      <div className="aspect-[3/4] w-full bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

function ComicModal({ comic, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-[3/4] bg-gray-100">
          <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-extrabold leading-tight">{comic.title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <p className="text-gray-600 mt-2">by {comic.author}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-semibold">{comic.genre}</span>
            <div className="inline-flex items-center gap-1 text-amber-500">
              <Star size={16} className="fill-amber-400" />
              <span className="text-sm font-semibold text-gray-700">{(comic.rating ?? 4.5).toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-4 text-gray-700 leading-relaxed">{comic.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.isArray(comic.tags) && comic.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">#{t}</span>
            ))}
          </div>
          <div className="mt-6">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold shadow-lg shadow-indigo-600/30 transition">
              Select this Comic
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} ComicVerse. All rights reserved.</p>
        <div className="inline-flex items-center gap-3 text-sm text-gray-500">
          <span>Made with ✨ vibes and great stories</span>
        </div>
      </div>
    </footer>
  )
}

export default App
