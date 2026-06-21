import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle, MapPin, Send, Ticket, Users } from 'lucide-react';
import { api } from '../lib/api';

type AdditionalGuest = {
  fullName: string;
  isChild: boolean;
};

const createAdditionalGuests = (count: number, current: AdditionalGuest[]) =>
  Array.from({ length: Math.max(0, count - 1) }, (_, index) => (
    current[index] ?? { fullName: '', isChild: false }
  ));

const getRsvpEmail = (phone: string, language: string) => {
  const normalizedPhone = phone.replace(/\D/g, '') || String(Date.now());
  return `${language}-${normalizedPhone}@sanja-angelcho-rsvp.local`;
};

const getPassportCode = (name: string, phone: string) => {
  const source = `${name}${phone}`.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `SA-${source.slice(0, 3).padEnd(3, 'X')}-${phone.replace(/\D/g, '').slice(-4).padStart(4, '0')}`;
};

export function RsvpPage() {
  const { t, i18n } = useTranslation();
  const isHr = i18n.language.startsWith('hr');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    attending: true,
    guest_count: 1,
    dietary_notes: '',
    message: '',
    transport: 'organized',
    additionalGuests: [] as AdditionalGuest[],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const language = isHr ? 'hr' : 'mk';

      const result = await api.submitRsvp({
        full_name: form.full_name,
        email: getRsvpEmail(form.phone, language),
        phone: form.phone || undefined,
        attending: form.attending,
        guest_count: form.attending ? form.guest_count : 1,
        language,
        transport: form.attending ? form.transport as 'organized' | 'own' : null,
        additional_guests: form.attending ? form.additionalGuests : [],
      });
      setSuccess(true);
      setUpdated(result.updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('rsvp.error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center animate-fade-up">
        <CheckCircle className="w-16 h-16 text-sage mx-auto mb-6" />
        <h2 className="font-serif text-3xl text-charcoal mb-3">
          {updated ? t('rsvp.updated') : t('rsvp.success')}
        </h2>
        <p className="text-muted mb-8">Sanja & Angelcho · 10.10.2026</p>

        {form.attending && (
          <BoardingPassport
            fullName={form.full_name}
            guestCount={form.guest_count}
            transport={form.transport}
            group={t(isHr ? 'lang.hr' : 'lang.mk')}
            code={getPassportCode(form.full_name, form.phone)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-10 animate-fade-up">
        <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-3">{t('rsvp.title')}</h1>
        <p className="text-muted">{t('rsvp.subtitle')}</p>
        <div className="decorative-line w-24 mx-auto mt-6" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white/70 rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-sm">
        <Field label={t('rsvp.fullName')} required>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="input-field"
          />
        </Field>

        <Field label={t('rsvp.hr.phone')} required>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field"
          />
        </Field>

        <Field label={t('rsvp.attending')} required>
          <div className="flex gap-3">
            {[
              { value: true, label: t('rsvp.yes') },
              { value: false, label: t('rsvp.no') },
            ].map(({ value, label }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setForm({
                  ...form,
                  attending: value,
                  guest_count: value ? form.guest_count : 1,
                  additionalGuests: value ? form.additionalGuests : [],
                })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm transition-all border ${
                  form.attending === value
                    ? 'bg-gold text-white border-gold shadow-md shadow-gold/20'
                    : 'bg-white text-muted border-gold/20 hover:border-gold/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        {form.attending && (
          <Field label={t('rsvp.guestCount')} required>
            <select
              value={form.guest_count}
              onChange={(e) => {
                const guestCount = Number(e.target.value);
                setForm({
                  ...form,
                  guest_count: guestCount,
                  additionalGuests: createAdditionalGuests(guestCount, form.additionalGuests),
                });
              }}
              className="input-field"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
        )}

        {form.attending && form.guest_count > 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{t('rsvp.hr.additionalGuests')}</p>
            {form.additionalGuests.map((guest, index) => (
              <div key={index} className="rounded-xl border border-gold/15 bg-white/60 p-3">
                <Field label={`${t('rsvp.hr.guest')} ${index + 2}`} required>
                  <input
                    type="text"
                    required
                    value={guest.fullName}
                    onChange={(e) => {
                      const additionalGuests = [...form.additionalGuests];
                      additionalGuests[index] = { ...guest, fullName: e.target.value };
                      setForm({ ...form, additionalGuests });
                    }}
                    className="input-field"
                  />
                </Field>
                <label className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={guest.isChild}
                    onChange={(e) => {
                      const additionalGuests = [...form.additionalGuests];
                      additionalGuests[index] = { ...guest, isChild: e.target.checked };
                      setForm({ ...form, additionalGuests });
                    }}
                    className="h-4 w-4 accent-gold"
                  />
                  {t('rsvp.hr.child')}
                </label>
              </div>
            ))}
          </div>
        )}

        {form.attending && (
          <Field label={t('rsvp.hr.transport')} required>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'organized', label: t('rsvp.hr.organizedTransport') },
                { value: 'own', label: t('rsvp.hr.ownTransport') },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, transport: value })}
                  className={`py-3 px-4 rounded-xl text-sm transition-all border ${
                    form.transport === value
                      ? 'bg-gold text-white border-gold shadow-md shadow-gold/20'
                      : 'bg-white text-muted border-gold/20 hover:border-gold/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
        )}

        {isHr && form.attending && (
          <p className="rounded-xl border border-gold/15 bg-ivory/70 px-4 py-3 text-sm text-muted">
            {t('rsvp.hr.accommodationProvidedNote')}
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-white text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-all disabled:opacity-60 shadow-lg shadow-gold/20"
        >
          {loading ? t('rsvp.submitting') : (
            <>
              <Send className="w-4 h-4" />
              {t('rsvp.submit')}
            </>
          )}
        </button>
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(184, 149, 106, 0.25);
          background: white;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #b8956a;
          box-shadow: 0 0 0 3px rgba(184, 149, 106, 0.15);
        }
      `}</style>
    </div>
  );
}

function BoardingPassport({
  fullName,
  guestCount,
  transport,
  group,
  code,
}: {
  fullName: string;
  guestCount: number;
  transport: string;
  group: string;
  code: string;
}) {
  const { t } = useTranslation();
  const transportLabel = transport === 'organized'
    ? t('rsvp.hr.organizedTransport')
    : t('rsvp.hr.ownTransport');

  return (
    <section className="mx-auto overflow-hidden rounded-[1.25rem] border border-gold/30 bg-white text-left shadow-2xl shadow-gold/15">
      <div className="grid md:grid-cols-[1fr_210px]">
        <div className="relative p-6 sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                {t('rsvp.passport.eyebrow')}
              </p>
              <h3 className="mt-2 font-serif text-3xl text-charcoal">
                {t('rsvp.passport.title')}
              </h3>
            </div>
            <Ticket className="h-9 w-9 text-gold" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <PassportField label={t('rsvp.passport.passenger')} value={fullName} />
            <PassportField label={t('rsvp.passport.group')} value={group} />
            <PassportField label={t('rsvp.passport.guests')} value={String(guestCount)} />
          </div>

          <div className="my-6 border-t border-dashed border-gold/35" />

          <div className="grid gap-4 sm:grid-cols-3">
            <PassportInfo icon={<Calendar className="h-4 w-4" />} label={t('rsvp.passport.date')} value="10.10.2026" />
            <PassportInfo icon={<MapPin className="h-4 w-4" />} label={t('rsvp.passport.destination')} value={t('rsvp.passport.destinationValue')} />
            <PassportInfo icon={<Users className="h-4 w-4" />} label={t('rsvp.passport.transport')} value={transportLabel} />
          </div>
        </div>

        <div className="relative flex flex-col justify-between border-t border-dashed border-gold/35 bg-ivory p-6 md:border-l md:border-t-0">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">{t('rsvp.passport.admit')}</p>
            <p className="mt-2 font-serif text-4xl text-gold">S&A</p>
          </div>
          <div className="mt-8">
            <div className="mb-3 h-12 rounded bg-[repeating-linear-gradient(90deg,#3d3d3d_0_3px,transparent_3px_7px)]" />
            <p className="font-mono text-sm tracking-widest text-charcoal">{code}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PassportField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-charcoal">{value}</p>
    </div>
  );
}

function PassportInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-cream/70 p-3">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="mt-1 text-sm font-semibold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">
        {label}
        {required && <span className="text-gold ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
