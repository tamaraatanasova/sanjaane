import { useTranslation } from 'react-i18next';
import {
  Clock,
  MapPin,
  Church,
  Wine,
  Shirt,
  Heart,
} from 'lucide-react';
import heroImage from '../assets/hero.jpg';

export function DetailsPage() {
  const { t } = useTranslation();

  const schedule = t('details.scheduleItems', {
    returnObjects: true,
  }) as Array<{
    time: string;
    event: string;
  }>;

  const icons = [Church, Shirt, Heart, Wine];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Timeline Section */}
      <section className="mb-24">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-sage/10 p-4">
            <Clock className="h-7 w-7 text-sage-dark" />
          </div>
          <h2 className="mt-5 font-serif text-4xl text-charcoal">
            {t('details.schedule')}
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-24 bg-gold"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-6 hidden h-[calc(100%-3rem)] -translate-x-1/2 md:block">
            <div className="h-full w-[2px] bg-gradient-to-b from-gold via-gold/40 to-transparent" />
          </div>

          {schedule.map((item, index) => {
            const Icon = icons[index % icons.length];
            const isLeft = index % 2 === 0;

            return (
              <div
                key={index}
                className={`relative mb-12 flex items-start md:items-center ${
                  isLeft ? 'md:justify-start' : 'md:justify-end'
                }`}
              >
                {/* Timeline Icon */}
                <div
                  className="
                    absolute left-1/2 z-20 hidden h-14 w-14 -translate-x-1/2 
                    items-center justify-center rounded-full border-4 border-white 
                    bg-gold shadow-xl md:flex
                  "
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Mobile Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold shadow-md md:hidden">
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Compact Card */}
                <div
                  className={`
                    w-full max-w-md rounded-3xl border border-white/40 
                    bg-white/90 p-6 shadow-lg backdrop-blur-lg
                    transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                    ${isLeft ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'}
                  `}
                >
                  <div className="font-serif text-2xl font-medium text-gold mb-2">
                    {item.time}
                  </div>
                  <p className="text-[17px] leading-relaxed text-charcoal">
                    {item.event}
                  </p>
                </div>-
              </div>
            );
          })}
        </div>
      </section>

      {/* Redesigned Venue / Location Section */}
      <section className="overflow-hidden rounded-[40px] bg-gradient-to-br from-[#faf7f2] via-white to-[#fff8ef] shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Left: Info */}
          <div className="flex flex-col justify-center p-12 md:p-16">
            <div className="inline-flex items-center justify-center rounded-full bg-gold/10 p-5 mb-6">
              <MapPin className="h-9 w-9 text-gold" />
            </div>

            <h2 className="font-serif text-4xl text-charcoal mb-3">
              {t('details.map')}
            </h2>
            <div className="h-1 w-20 bg-gold mb-8" />

            <p className="text-lg leading-relaxed text-muted mb-10">
              {t('details.mapNote')}
            </p>

            <a
              href="https://maps.google.com/?q=Despina's+Wedding+Venue+and+Lounge"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-gold px-9 py-4 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#c8a86b] hover:scale-105 active:scale-95"
            >
              <MapPin className="h-5 w-5" />
              Open in Google Maps
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>

          {/* Right: Visual / Map Preview Area */}
          <div className="relative h-80 overflow-hidden md:h-auto">
            <img src={heroImage} alt="Wedding venue preview" className="h-full w-full object-cover" />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r" />
            
            {/* Venue label overlay */}
            <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:top-8 md:bottom-auto">
              <div className="rounded-2xl bg-white/90 p-5 backdrop-blur-md shadow-xl max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gold/10 p-2">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-charcoal">Despina's Wedding Venue & Lounge</div>
                    <div className="text-sm text-muted">Beautiful • Elegant • Unforgettable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}