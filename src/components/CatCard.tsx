import { Cat } from '../types';
import { motion } from 'motion/react';
import { Heart, Star, Trash2 } from 'lucide-react';

interface CatCardProps {
  cat: Cat;
  onFavorite?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const CatCard = ({ cat, onFavorite, onRemove }: CatCardProps) => {
  const rarityColors = {
    common: 'bg-white',
    rare: 'bg-pastel-blue/30 border-2 border-blue-400',
    legendary: 'bg-pastel-yellow/30 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]',
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ y: -5 }}
      className={`relative group rounded-2xl overflow-hidden p-2 ${rarityColors[cat.rarity]} transition-all duration-300`}
    >
      <div className="aspect-square rounded-xl overflow-hidden relative">
        <img
          src={cat.url}
          alt="A cute cat"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onFavorite && (
            <button
              onClick={() => onFavorite(cat.id)}
              className="p-2 bg-white rounded-full text-pink-500 hover:scale-110 transition-transform"
            >
              <Heart className={cat.isFavorite ? 'fill-current' : ''} size={20} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(cat.id)}
              className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-2 px-1 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
          {cat.rarity}
        </span>
        {cat.rarity === 'legendary' && <Star size={14} className="text-yellow-500 fill-current" />}
      </div>
    </motion.div>
  );
};
