import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { BackgroundMusic } from './BackgroundMusic';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-gold/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-serif text-xl tracking-wide hidden sm:inline">S & A</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <BackgroundMusic />

      <footer className="border-t border-gold/20 py-10 text-center">
        <p className="font-serif text-2xl text-gold mb-1">{t('footer.names')}</p>
        <p className="text-sm text-muted tracking-widest uppercase">{t('footer.love')}</p>
        <p className="text-xs text-muted/60 mt-4">10.10.2026</p>
      </footer>
    </div>
  );
}
