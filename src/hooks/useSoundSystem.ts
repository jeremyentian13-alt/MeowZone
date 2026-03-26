import { useState, useEffect, useRef } from 'react';

const MEOW_SOUNDS = [
  'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Short meow
  'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', // Long meow
  'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Kitten meow
  'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Angry meow
  'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Purr
];

export const useSoundSystem = () => {
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const [lastPlayed, setLastPlayed] = useState(0);

  useEffect(() => {
    audioRefs.current = MEOW_SOUNDS.map(url => {
      const audio = new Audio(url);
      audio.volume = 0.4;
      return audio;
    });
  }, []);

  const playMeow = (index?: number) => {
    const now = Date.now();
    if (now - lastPlayed < 200) return; // Anti-spam

    const idx = index !== undefined ? index : Math.floor(Math.random() * MEOW_SOUNDS.length);
    const audio = audioRefs.current[idx];
    
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setLastPlayed(now);
    }
  };

  const playUltimateMeow = () => {
    audioRefs.current.forEach((audio, i) => {
      setTimeout(() => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }, i * 100);
    });
  };

  return { playMeow, playUltimateMeow };
};
