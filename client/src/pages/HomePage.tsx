import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Heart } from 'lucide-react';
import { Countdown } from '../components/Countdown';
import { DetailsPage } from './DetailsPage';
import { RsvpPage } from './RsvpPage';
import heroImage from '../assets/hero.jpg';

export function HomePage() {
  const { t } = useTranslation();
  const [showIntro, setShowIntro] = useState(true);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => (prev.includes(entry.target.id) ? prev : [...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const sections = document.querySelectorAll('[data-reveal]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const beginExperience = () => {
    setShowIntro(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-cream transition-all duration-700 ${
          showIntro ? 'opacity-100' : 'pointer-events-none opacity-0 scale-110'
        }`}
      >
        <div className="absolute inset-0">
          <img src={heroImage} alt="Wedding invitation" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,247,242,0.92),rgba(61,61,61,0.42))]" />
        </div>

        <div className="relative z-10 mx-4 w-full max-w-xl">
          <div className={`relative mx-auto overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_25px_80px_-30px_rgba(61,61,61,0.6)] backdrop-blur ${showIntro ? '' : 'opacity-0'}`}>
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.25))]" />
            <div className="absolute inset-x-0 top-0 h-24 origin-top transition-all duration-700 ease-out" style={{ transform: showIntro ? 'rotateX(0deg)' : 'rotateX(180deg)' }}>
              <div className="absolute inset-x-0 top-0 h-full rounded-t-[2rem] border-b border-gold/20 bg-[linear-gradient(180deg,#fdfaf4_0%,#f1e6d2_100%)]" />
              <div className="absolute inset-x-0 top-0 h-full rounded-t-[2rem] border-b border-gold/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(184,149,106,0.18))]" />
            </div>

            <div className={`relative z-10 px-8 py-10 text-center transition-all duration-700 ${showIntro ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-white/80 shadow-lg shadow-gold/10">
                <Heart className="h-8 w-8 text-gold fill-gold/30" />
              </div>
              <p className="text-sm uppercase tracking-[0.35em] text-sage">{t('hero.together')}</p>
              <h2 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Sanja & Angelcho</h2>
              <p className="mt-3 text-lg text-muted">{t('hero.invite')}</p>
              <p className="mt-2 font-serif text-2xl text-gold">10.10.2026 · Ohrid</p>
              <button
                type="button"
                onClick={beginExperience}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm uppercase tracking-widest text-white shadow-lg shadow-gold/20 transition-all hover:bg-gold-light"
              >
                {t('hero.openInvitation')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section data-reveal id="hero-main" className="relative flex min-h-[100vh] items-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage}
            alt="Sanja and Angelcho"
            className="h-full w-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(250,247,242,0.94),rgba(250,247,242,0.72),rgba(61,61,61,0.28))]" />
        </div>
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-sage/15 blur-3xl" />

        <div className={`reveal-on-scroll relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] ${visibleSections.includes('hero-main') ? 'is-visible' : ''}`} style={{ transform: `translateY(${Math.max(0, scrollY * 0.02)}px)` }}>
          <div className="animate-fade-up text-center lg:text-left">
            <p className="mb-6 text-sm uppercase tracking-[0.3em] text-sage">{t('hero.together')}</p>

            <div className="mb-4 flex items-center justify-center gap-4 lg:justify-start">
              <div className="decorative-line w-16 sm:w-24" />
              <Heart className="h-6 w-6 text-gold fill-gold/30 animate-float" />
              <div className="decorative-line w-16 sm:w-24" />
            </div>

            <h1 className="mb-2 font-serif text-5xl leading-none text-charcoal sm:text-7xl md:text-8xl">
              Sanja
            </h1>
            <p className="my-2 font-serif text-3xl text-gold italic sm:text-4xl">&</p>
            <h1 className="mb-8 font-serif text-5xl leading-none text-charcoal sm:text-7xl md:text-8xl">
              Angelcho
            </h1>

            <p className="mx-auto mb-4 max-w-md text-lg font-light leading-relaxed text-muted sm:text-xl lg:mx-0">
              {t('hero.invite')}
            </p>

            <p className="mb-10 font-serif text-2xl tracking-wide text-gold sm:text-3xl">
              {t('hero.date')}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="#rsvp"
                className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm uppercase tracking-widest text-white shadow-lg shadow-gold/20 transition-all hover:bg-gold-light"
              >
                {t('hero.cta')}
              </a>
              <a
                href="#details"
                className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-white/70 px-8 py-3.5 text-sm uppercase tracking-widest text-gold transition-all hover:bg-gold/5"
              >
                {t('hero.details')}
              </a>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="overflow-hidden rounded-[2rem] border border-gold/20 bg-white/70 p-3 shadow-2xl shadow-gold/10 backdrop-blur-sm transition-transform duration-700" style={{ transform: `translateY(${Math.max(0, scrollY * 0.03)}px)` }}>
              <img
                src={heroImage}
                alt="Sanja and Angelcho"
                className="h-[420px] w-full rounded-[1.5rem] object-cover"
              />
              <div className="mt-4 flex items-center justify-between rounded-[1.25rem] bg-ivory/80 px-4 py-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sage">{t('hero.together')}</p>
                  <p className="font-serif text-xl text-charcoal">10.10.2026 · Ohrid</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted animate-bounce">
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      <section data-reveal id="countdown-section" className="bg-ivory/50 px-4 py-20">
        <Countdown />
      </section>

      <section data-reveal id="details" className="bg-cream px-4 py-20">

          <DetailsPage />
      </section>

      <section data-reveal id="rsvp" className="bg-ivory/40 px-4 py-20">

          <RsvpPage />
      </section>
    </>
  );
}
