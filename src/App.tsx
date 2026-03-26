/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cat, GameState } from './types';
import { CatCard } from './components/CatCard';
import { useSoundSystem } from './hooks/useSoundSystem';
import { 
  Cat as CatIcon, 
  Sparkles, 
  Gamepad2, 
  Volume2, 
  Zap, 
  Trophy,
  RefreshCw,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('meow-zone-state');
    return saved ? JSON.parse(saved) : {
      collection: [],
      unlockedSounds: [],
      milestones: [],
      chaosMode: false,
    };
  });

  const [currentCat, setCurrentCat] = useState<Cat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playMeow, playUltimateMeow } = useSoundSystem();

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('meow-zone-state', JSON.stringify(gameState));
  }, [gameState]);

  const fetchCat = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(CAT_API_URL);
      if (!response.ok) throw new Error('Failed to fetch cat');
      const data = await response.json();
      const catData = data[0];

      // Determine rarity
      const rand = Math.random();
      let rarity: Cat['rarity'] = 'common';
      if (rand > 0.95) rarity = 'legendary';
      else if (rand > 0.8) rarity = 'rare';

      const newCat: Cat = {
        id: catData.id,
        url: catData.url,
        width: catData.width,
        height: catData.height,
        rarity,
        collectedAt: Date.now(),
      };

      setCurrentCat(newCat);
      playMeow();
      
      if (rarity === 'legendary') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FFFFFF']
        });
      }
    } catch (err) {
      setError('The cats are hiding! Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const collectCat = () => {
    if (!currentCat) return;
    
    // Prevent duplicates
    if (gameState.collection.some(c => c.id === currentCat.id)) {
      setCurrentCat(null);
      return;
    }

    setGameState(prev => {
      const newCollection = [currentCat, ...prev.collection];
      const newMilestones = [...prev.milestones];
      
      if (newCollection.length >= 5 && !newMilestones.includes('5-cats')) {
        newMilestones.push('5-cats');
        confetti({ particleCount: 150, spread: 100 });
      }
      if (newCollection.length >= 10 && !newMilestones.includes('10-cats')) {
        newMilestones.push('10-cats');
      }
      if (newCollection.length >= 20 && !newMilestones.includes('20-cats')) {
        newMilestones.push('20-cats');
      }

      return {
        ...prev,
        collection: newCollection,
        milestones: newMilestones,
      };
    });
    
    setCurrentCat(null);
  };

  const toggleFavorite = (id: string) => {
    setGameState(prev => ({
      ...prev,
      collection: prev.collection.map(c => 
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      )
    }));
  };

  const removeCat = (id: string) => {
    setGameState(prev => ({
      ...prev,
      collection: prev.collection.filter(c => c.id !== id)
    }));
  };

  const toggleChaos = () => {
    setGameState(prev => ({ ...prev, chaosMode: !prev.chaosMode }));
    if (!gameState.chaosMode) {
      const interval = setInterval(() => {
        playMeow();
      }, 300);
      setTimeout(() => clearInterval(interval), 3000);
    }
  };

  const progress = Math.min((gameState.collection.length / 20) * 100, 100);

  return (
    <div className={`min-h-screen pb-20 transition-all duration-500 ${gameState.chaosMode ? 'chaos-shake bg-red-100' : ''}`}>
      {/* Hero Section */}
      <header className="pt-12 pb-8 px-4 text-center relative overflow-hidden">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
          <div className="inline-block p-3 bg-white rounded-full shadow-lg mb-4 animate-float">
            <CatIcon size={40} className="text-pink-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-2 tracking-tight">
            Meow Zone <span className="text-pink-500">🐱</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            The ultimate whimsical cat collection game. Fetch cats, unlock sounds, and embrace the chaos!
          </p>
        </motion.div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          {[...Array(6)].map((_, i) => (
            <Sparkles 
              key={i} 
              className="absolute animate-pulse" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: ['#ffd1dc', '#b4e1ff', '#fff9c4'][i % 3]
              }}
            />
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-12">
        {/* Generator Section */}
        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-100/50 border border-pink-50 text-center">
          <div className="mb-8 h-64 md:h-80 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <RefreshCw className="animate-spin text-pink-400" size={48} />
                  <p className="font-bold text-pink-400">Summoning a feline...</p>
                </motion.div>
              ) : currentCat ? (
                <motion.div
                  key="cat"
                  initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="relative group"
                >
                  <img
                    src={currentCat.url}
                    alt="New friend"
                    className="max-h-64 md:max-h-80 rounded-2xl shadow-2xl border-4 border-white"
                    referrerPolicy="no-referrer"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={collectCat}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-pink-600 transition-colors"
                  >
                    <Heart size={20} /> Collect Cat!
                  </motion.button>
                </motion.div>
              ) : error ? (
                <motion.div key="error" className="text-red-400 font-bold">{error}</motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="text-slate-300 flex flex-col items-center gap-2"
                >
                  <CatIcon size={64} strokeWidth={1} />
                  <p className="font-medium">Ready for a new cat?</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={fetchCat}
              disabled={isLoading}
              className="px-8 py-4 bg-pastel-blue text-slate-800 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-0 flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={20} /> Give me a random cat 🐾
            </button>
            
            <button
              onClick={() => playMeow()}
              className="px-6 py-4 bg-pastel-green text-slate-800 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <Volume2 size={20} /> Meow!
            </button>

            {gameState.milestones.includes('5-cats') && (
              <button
                onClick={playUltimateMeow}
                className="px-6 py-4 bg-pastel-purple text-slate-800 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Zap size={20} /> Ultimate Meow
              </button>
            )}

            {gameState.milestones.includes('10-cats') && (
              <button
                onClick={toggleChaos}
                className={`px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 ${
                  gameState.chaosMode ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white'
                }`}
              >
                <Gamepad2 size={20} /> {gameState.chaosMode ? 'Stop Chaos!' : 'Chaos Mode 🎉'}
              </button>
            )}
          </div>
        </section>

        {/* Progress Section */}
        <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} /> 
              Collection Progress
            </h2>
            <span className="font-bold text-slate-500">{gameState.collection.length} / 20 Cats</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-pink-400 to-pastel-purple"
            />
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${gameState.milestones.includes('5-cats') ? 'bg-pastel-green text-green-800' : 'bg-slate-200 text-slate-400'}`}>
              5 Cats: Ultimate Meow
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${gameState.milestones.includes('10-cats') ? 'bg-pastel-blue text-blue-800' : 'bg-slate-200 text-slate-400'}`}>
              10 Cats: Rainbow Button
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${gameState.milestones.includes('20-cats') ? 'bg-pastel-yellow text-yellow-800' : 'bg-slate-200 text-slate-400'}`}>
              20 Cats: Chaos Mode
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section>
          <h2 className="text-2xl font-black mb-6 px-2">Your Collection 🐾</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {gameState.collection.map(cat => (
                <CatCard 
                  key={cat.id} 
                  cat={cat} 
                  onFavorite={toggleFavorite}
                  onRemove={removeCat}
                />
              ))}
            </AnimatePresence>
            {gameState.collection.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 italic">
                Your gallery is empty. Start collecting cats!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Chaos Mode Overlays */}
      {gameState.chaosMode && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(10)].map((_, i) => (
            <motion.img
              key={i}
              src={`https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4Z2Z4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3oriO0OEd9QIDdllqo/giphy.gif`}
              className="absolute w-32 h-32 opacity-40"
              initial={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                scale: 0
              }}
              animate={{ 
                scale: [0, 1.5, 0],
                rotate: [0, 360],
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-20 py-10 border-t border-pink-100 text-center text-slate-400 text-sm">
        <p>Made with 💖 for cat lovers</p>
        <p className="mt-2">Powered by TheCatAPI</p>
      </footer>
    </div>
  );
}
