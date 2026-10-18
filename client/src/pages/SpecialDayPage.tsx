import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Camera, ChevronLeft, ImagePlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type MediaItem = {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  uploadStatus: 'uploading' | 'uploaded' | 'error';
  uploadError?: string;
};

export function SpecialDayPage() {
  const { t } = useTranslation();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const mediaRef = useRef<MediaItem[]>([]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => () => mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const addMedia = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const newItems = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
        url: URL.createObjectURL(file),
        uploadStatus: 'uploading' as const,
        file,
      }));
    setMedia((current) => [...current, ...newItems.map(({ file: _file, ...item }) => item)]);
    event.target.value = '';

    await Promise.all(newItems.map(async ({ id, file }) => {
      try {
        await api.uploadSpecialDayMedia(file);
        setMedia((current) => current.map((item) => item.id === id ? { ...item, uploadStatus: 'uploaded' } : item));
      } catch (error) {
        const uploadError = error instanceof Error ? error.message : t('specialDay.uploadError');
        setMedia((current) => current.map((item) => item.id === id ? { ...item, uploadStatus: 'error', uploadError } : item));
      }
    }));
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((item) => item.id !== id);
    });
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] pb-24 text-charcoal">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-gold/10 hover:text-gold" aria-label="Back"><ChevronLeft className="h-5 w-5" /></Link>
          <div className="text-center"><p className="font-serif text-xl text-gold">Sanja & Angelcho</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage">10 · 10 · 2026</p></div>
          <span className="h-10 w-10" />
        </div>
      </header>

      <section className="mx-auto max-w-lg px-4 pt-7">
        <section className="overflow-hidden rounded-[1.75rem] border border-gold/15 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(61,61,61,0.55)]">
          <GalleryCard t={t} media={media} onAdd={addMedia} onRemove={removeMedia} />
        </section>
      </section>
    </main>
  );
}

function GalleryCard({ t, media, onAdd, onRemove }: { t: TFunction; media: MediaItem[]; onAdd: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: (id: string) => void }) {
  return <div>
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Camera className="h-6 w-6" /></div>
    <h1 className="mt-4 font-serif text-3xl">{t('specialDay.galleryTitle')}</h1>
    <p className="mt-2 text-sm leading-6 text-muted">{t('specialDay.galleryText')}</p>
    <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 bg-cream text-center text-gold transition hover:border-gold hover:bg-gold/5">
      <ImagePlus className="h-6 w-6" />
      <span className="mt-2 px-4 text-sm font-semibold">{t('specialDay.addMedia')}</span>
      <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => { void onAdd(event); }} />
    </label>
    {media.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{media.map((item) => <article key={item.id} className="relative overflow-hidden rounded-xl bg-charcoal">
      <button type="button" onClick={() => onRemove(item.id)} aria-label={t('specialDay.removeMedia')} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-charcoal"><X className="h-3.5 w-3.5" /></button>
      {item.type === 'image' ? <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" /> : <video src={item.url} controls className="aspect-square w-full object-cover" />}
      <p className="absolute inset-x-0 bottom-0 bg-charcoal/75 px-2 py-1 text-center text-[10px] font-semibold text-white">{item.uploadStatus === 'uploading' ? t('specialDay.uploading') : item.uploadStatus === 'uploaded' ? t('specialDay.uploaded') : item.uploadError ?? t('specialDay.uploadError')}</p>
    </article>)}</div>}
    <p className="mt-4 text-center text-xs leading-5 text-muted">{t('specialDay.mediaHint')}</p>
  </div>;
}
