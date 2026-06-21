import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WEDDING_DATE = new Date('2026-10-10T14:00:00');

function getTimeLeft() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const { t } = useTranslation();
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: t('countdown.days') },
    { value: time.hours, label: t('countdown.hours') },
    { value: time.minutes, label: t('countdown.minutes') },
    { value: time.seconds, label: t('countdown.seconds') },
  ];

  return (
    <div className="text-center">
      <p className="mb-6 text-sm uppercase tracking-[0.35em] text-muted">{t('countdown.until')}</p>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {units.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-[1.4rem] border border-gold/25 bg-gradient-to-b from-white via-ivory/90 to-cream px-3 py-5 shadow-[0_16px_40px_-20px_rgba(184,149,106,0.95)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="font-serif text-4xl text-gold sm:text-5xl">{value}</div>
            <div className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
