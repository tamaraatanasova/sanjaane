import { useTranslation } from 'react-i18next';
import {
  Clock,
  MapPin,
  Church,
  Wine,
  Shirt,
  Heart,
} from 'lucide-react';

export function DetailsPage() {
  const { t } = useTranslation();

  const schedule = t('details.scheduleItems', {
    returnObjects: true,
  }) as Array<{
    time: string;
    event: string;
    note?: string;
    locationUrl?: string;
  }>;

  const icons = [Shirt, Church, Heart, Wine];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Timeline Section */}
      <section className="mb-24">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-white/80 p-4 shadow-sm">
            <Clock className="h-7 w-7 text-gold" />
          </div>
          <h2 className="mt-5 font-serif text-4xl text-charcoal">
            {t('details.schedule')}
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-24 bg-gold"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-6 hidden h-[calc(100%-3rem)] -translate-x-1/2 md:block">
            <div className="h-full w-px bg-gradient-to-b from-gold via-gold/25 to-transparent" />
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
                    group w-full max-w-md rounded-2xl border border-gold/10
                    bg-white/85 p-6 shadow-[0_18px_50px_-34px_rgba(61,61,61,0.55)] backdrop-blur
                    transition-all duration-300 hover:-translate-y-1 hover:border-gold/25 hover:bg-white hover:shadow-[0_22px_60px_-36px_rgba(61,61,61,0.65)]
                    ${isLeft ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'}
                  `}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="font-serif text-2xl font-medium text-gold">
                      {item.time}
                    </div>
                    
                  </div>
                  <p className="text-[17px] leading-relaxed text-charcoal">
                    {item.event}
                  </p>
                  {item.note && (
                    <p className="mt-3 rounded-xl border border-gold/10 bg-ivory/60 px-3 py-2 text-sm leading-relaxed text-muted">
                      {item.note}
                    </p>
                  )}
                  {item.locationUrl && (
                    <a
                      href={item.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/15 bg-white px-3 py-1.5 text-sm font-medium text-charcoal transition-colors hover:border-gold/35 hover:text-gold"
                    >
                      <MapPin className="h-4 w-4" />
                      {t('details.map')}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
