import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, VolumeX } from 'lucide-react';

const backgroundTrack = '/music/background.mp3';

export function BackgroundMusic() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  const startMusic = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.4;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
      return;
    }

    startMusic();
  };

  return (
    <>
      <audio ref={audioRef} src={backgroundTrack} loop preload="none" />
      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-white/85 text-gold shadow-lg shadow-charcoal/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        aria-label={isPlaying ? t('music.pause') : t('music.play')}
        title={isPlaying ? t('music.pause') : t('music.play')}
      >
        {isPlaying ? <VolumeX className="h-5 w-5" /> : <Music className="h-5 w-5" />}
      </button>
    </>
  );
}
