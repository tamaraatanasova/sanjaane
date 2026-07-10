import React, { useEffect, useRef, useState } from 'react';
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

// Посебна компонента за поединечна „грепка“ картичка
function ScratchUnit({ value, label }: { value: number | string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Поставување на димензии на канвасот
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Цртање на „грепка“ слојот (Сина боја со малку текстура)
    ctx.fillStyle = '#93c5fd'; // Светло сина (blue-300)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Додавање на малку „метален“ ефект на сината боја
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 20, canvas.height);
        ctx.stroke();
    }

    // Текст врз грепката за да знаат дека треба да се гребе
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('', canvas.width / 2, canvas.height / 2 + 5);

    const scratch = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY) - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (e.buttons === 1 || 'touches' in e) {
        scratch(e);
      }
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-lg">
      {/* Ова е тоа што се гледа ПОСЛЕ гребење (Бројката) */}
      <div className="flex h-full flex-col items-center justify-center">
        <div className="font-serif text-4xl text-gold sm:text-5xl">{value}</div>
        <div className="mt-1 text-[0.6rem] uppercase tracking-widest text-slate-400">{label}</div>
      </div>

      {/* Канвасот кој е одозгора и се гребе */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 touch-none cursor-pointer transition-opacity duration-1000"
        style={{ opacity: isScratched ? 0 : 1 }}
      />
    </div>
  );
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
    <div className="text-center px-4">
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className="h-1.5 w-1.5 rotate-45 bg-blue-400 shadow-sm" />
        <p className="text-sm uppercase tracking-[0.3em] text-muted/80">
            {t('countdown.until')}
        </p>
        <div className="h-1.5 w-1.5 rotate-45 bg-blue-400 shadow-sm" />
      </div>

      <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
        {units.map((unit, idx) => (
          <ScratchUnit key={idx} value={unit.value} label={unit.label} />
        ))}
      </div>

    

      <div className="mt-10 flex items-center justify-center gap-2">
        <div className="h-px w-8 bg-gold/30" />
        <div className="h-1 w-1 rounded-full bg-blue-300" />
        <div className="h-px w-8 bg-gold/30" />
      </div>
    </div>
  );
}