import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Vehicle Service Management
        </h1>
        <p className="text-slate-400 mb-6 text-lg">
          Your premium platform for managing vehicle maintenance and service tracking with ease.
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/40">
            Get Started
          </button>
          <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Learn More
          </button>
        </div>
      </div>
      <footer className="mt-12 text-slate-500 text-sm">
        © 2026 Vehicle Service Management System. Built with React & Tailwind.
      </footer>
    </div>
  )
}

export default App
