import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { BookOpen, Camera, CheckCircle2, ChevronLeft, ImagePlus, MapPin, Search, UtensilsCrossed, UsersRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type Tab = 'welcome' | 'table' | 'menu' | 'gallery';
type MediaItem = { id: string; name: string; type: 'image' | 'video'; url: string };

const LANGUAGE_KEY = 'special-day-language';

export function SpecialDayPage() {
  const { t, i18n } = useTranslation();
  const [languageChosen, setLanguageChosen] = useState(() => Boolean(localStorage.getItem(LANGUAGE_KEY)));
  const [activeTab, setActiveTab] = useState<Tab>('welcome');
  const [name, setName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupState, setLookupState] = useState<'idle' | 'empty' | 'error'>('idle');
  const [guests, setGuests] = useState<{ fullName: string; tableNumber: string }[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const mediaRef = useRef<MediaItem[]>([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage === 'mk' || savedLanguage === 'hr') void i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => () => mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const tabs = useMemo(() => [
    { id: 'welcome' as const, label: t('specialDay.welcome'), icon: UsersRound },
    { id: 'table' as const, label: t('specialDay.table'), icon: MapPin },
    { id: 'menu' as const, label: t('specialDay.menu'), icon: UtensilsCrossed },
    { id: 'gallery' as const, label: t('specialDay.gallery'), icon: Camera },
  ], [t]);

  const selectLanguage = (language: 'mk' | 'hr') => {
    localStorage.setItem(LANGUAGE_KEY, language);
    void i18n.changeLanguage(language);
    setLanguageChosen(true);
  };

  const findTable = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSearching(true);
    setLookupState('idle');
    setGuests([]);
    try {
      const matches = await api.findGuestTable(name);
      setGuests(matches);
      if (!matches.length) setLookupState('empty');
    } catch {
      setLookupState('error');
    } finally {
      setIsSearching(false);
    }
  };

  const addMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const newItems = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
        url: URL.createObjectURL(file),
      }));
    setMedia((current) => [...current, ...newItems]);
    event.target.value = '';
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((item) => item.id !== id);
    });
  };

  if (!languageChosen) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f5ecdf,transparent_45%),#faf7f2] p-5 text-charcoal">
        <section className="w-full max-w-sm rounded-[2rem] border border-gold/25 bg-white/85 p-7 text-center shadow-[0_25px_70px_-35px_rgba(61,61,61,0.55)] backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold"><BookOpen className="h-6 w-6" /></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-sage">Sanja & Angelcho</p>
          <h1 className="mt-2 font-serif text-4xl">{t('specialDay.languageTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{t('specialDay.languageText')}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => selectLanguage('mk')} className="rounded-2xl border border-gold/30 bg-cream px-4 py-4 text-sm font-semibold transition hover:border-gold hover:bg-gold hover:text-white">МК</button>
            <button type="button" onClick={() => selectLanguage('hr')} className="rounded-2xl border border-gold/30 bg-cream px-4 py-4 text-sm font-semibold transition hover:border-gold hover:bg-gold hover:text-white">HR</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] pb-24 text-charcoal">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-gold/10 hover:text-gold" aria-label="Back"><ChevronLeft className="h-5 w-5" /></Link>
          <div className="text-center"><p className="font-serif text-xl text-gold">Sanja & Angelcho</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage">10 · 10 · 2026</p></div>
          <button type="button" onClick={() => setLanguageChosen(false)} className="rounded-full border border-gold/25 px-3 py-2 text-xs font-semibold text-gold">{t('specialDay.changeLanguage')}</button>
        </div>
      </header>

      <section className="mx-auto max-w-lg px-4 pt-7">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-sage">{t('specialDay.title')}</p>
        <p className="mt-2 text-center font-serif text-2xl">{t('specialDay.subtitle')}</p>

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-gold/15 bg-white/80 p-2 shadow-sm">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-semibold leading-tight transition ${activeTab === id ? 'bg-gold text-white shadow-sm' : 'text-muted hover:bg-gold/10 hover:text-gold'}`}><Icon className="mb-1 h-4 w-4" />{label}</button>)}
        </div>

        <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-gold/15 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(61,61,61,0.55)]">
          {activeTab === 'welcome' && <WelcomeCard t={t} />}
          {activeTab === 'table' && <TableCard t={t} name={name} setName={setName} isSearching={isSearching} guests={guests} lookupState={lookupState} onSubmit={findTable} />}
          {activeTab === 'menu' && <MenuCard t={t} />}
          {activeTab === 'gallery' && <GalleryCard t={t} media={media} onAdd={addMedia} onRemove={removeMedia} />}
        </section>
      </section>
    </main>
  );
}

function WelcomeCard({ t }: { t: TFunction }) { return <div className="py-5 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold"><UsersRound className="h-7 w-7" /></div><h2 className="mt-5 font-serif text-4xl">{t('specialDay.welcomeTitle')}</h2><div className="mx-auto my-5 h-px w-16 bg-gold/50" /><p className="mx-auto max-w-sm leading-7 text-muted">{t('specialDay.welcomeText')}</p></div>; }

function TableCard({ t, name, setName, isSearching, guests, lookupState, onSubmit }: { t: TFunction; name: string; setName: (name: string) => void; isSearching: boolean; guests: { fullName: string; tableNumber: string }[]; lookupState: 'idle' | 'empty' | 'error'; onSubmit: (event: React.FormEvent) => void }) { return <div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/10 text-sage"><MapPin className="h-6 w-6" /></div><h2 className="mt-4 font-serif text-3xl">{t('specialDay.tableTitle')}</h2><p className="mt-2 text-sm leading-6 text-muted">{t('specialDay.tableText')}</p><form onSubmit={onSubmit} className="mt-5"><label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('specialDay.namePlaceholder')} className="h-[3.25rem] w-full rounded-2xl border border-gold/25 bg-cream pl-11 pr-4 text-sm outline-none focus:border-gold" /></label><button disabled={isSearching || !name.trim()} className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gold text-sm font-semibold text-white transition hover:bg-gold-light disabled:opacity-50">{isSearching ? t('specialDay.searching') : t('specialDay.findTable')}</button></form>{guests.map((guest) => <div key={`${guest.fullName}-${guest.tableNumber}`} className="mt-5 rounded-2xl bg-sage/10 p-4 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-sage" /><p className="mt-2 text-sm text-muted">{t('specialDay.tableResult', { name: guest.fullName })}</p><p className="mt-1 font-serif text-4xl text-sage-dark">{guest.tableNumber}</p></div>)}{lookupState !== 'idle' && <p className="mt-4 rounded-xl bg-cream p-3 text-center text-sm text-muted">{t(lookupState === 'error' ? 'specialDay.lookupError' : 'specialDay.noTable')}</p>}</div>; }

function MenuCard({ t }: { t: TFunction }) { const courses = [['starter', 'starterText'], ['main', 'mainText'], ['dessert', 'dessertText'], ['drinks', 'drinksText']]; return <div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold"><UtensilsCrossed className="h-6 w-6" /></div><h2 className="mt-4 font-serif text-3xl">{t('specialDay.menuTitle')}</h2><div className="mt-5 divide-y divide-gold/15">{courses.map(([title, text]) => <div key={title} className="py-4"><p className="font-serif text-xl text-gold">{t(`specialDay.${title}`)}</p><p className="mt-1 text-sm text-muted">{t(`specialDay.${text}`)}</p></div>)}</div><p className="mt-4 rounded-xl bg-cream px-4 py-3 text-xs leading-5 text-muted">{t('specialDay.menuNote')}</p></div>; }

function GalleryCard({ t, media, onAdd, onRemove }: { t: TFunction; media: MediaItem[]; onAdd: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: (id: string) => void }) { return <div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Camera className="h-6 w-6" /></div><h2 className="mt-4 font-serif text-3xl">{t('specialDay.galleryTitle')}</h2><p className="mt-2 text-sm leading-6 text-muted">{t('specialDay.galleryText')}</p><label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 bg-cream text-center text-gold transition hover:border-gold hover:bg-gold/5"><ImagePlus className="h-6 w-6" /><span className="mt-2 px-4 text-sm font-semibold">{t('specialDay.addMedia')}</span><input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={onAdd} /></label>{media.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{media.map((item) => <article key={item.id} className="relative overflow-hidden rounded-xl bg-charcoal"><button type="button" onClick={() => onRemove(item.id)} aria-label={t('specialDay.removeMedia')} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-charcoal"><X className="h-3.5 w-3.5" /></button>{item.type === 'image' ? <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" /> : <video src={item.url} controls className="aspect-square w-full object-cover" />}</article>)}</div>}<p className="mt-4 text-center text-xs leading-5 text-muted">{t('specialDay.mediaHint')}</p></div>; }
