import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, VolumeX } from 'lucide-react';

const backgroundTrack = '/music/background.mp3';

export function BackgroundMusic() {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // try autoplay + fallback unlock
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    tryPlay();

    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));

      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      audio.pause();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={backgroundTrack} loop preload="auto" />

      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-white/85 text-gold shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-ivory"
        aria-label={isPlaying ? t('music.pause') : t('music.play')}
        title={isPlaying ? t('music.pause') : t('music.play')}
      >
        {isPlaying ? <VolumeX className="h-5 w-5" /> : <Music className="h-5 w-5" />}
      </button>
    </>
  );
}