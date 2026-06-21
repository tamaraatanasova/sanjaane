import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bus, Check, ChevronDown, ChevronUp, LogOut, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from '../lib/api';
import type { AdditionalGuest, RsvpData, RsvpFormData, Stats } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type StatusFilter = 'all' | 'attending' | 'declined';
type LanguageFilter = 'all' | 'mk' | 'hr';
type TransportFilter = 'organized' | 'own';

type AdminForm = {
  id: number | null;
  full_name: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  language: 'mk' | 'hr';
  transport: 'organized' | 'own';
  additional_guests: AdditionalGuest[];
  dietary_notes: string;
  message: string;
};

const emptyForm = (): AdminForm => ({
  id: null,
  full_name: '',
  phone: '',
  attending: true,
  guest_count: 1,
  language: 'mk',
  transport: 'organized',
  additional_guests: [],
  dietary_notes: '',
  message: '',
});

const makeEmail = (phone: string, language: 'mk' | 'hr', id?: number | null) => {
  const normalizedPhone = phone.replace(/\D/g, '') || `${Date.now()}${id ?? ''}`;
  return `admin-${language}-${normalizedPhone}@sanja-angelcho-rsvp.local`;
};

const createAdditionalGuests = (count: number, current: AdditionalGuest[]) =>
  Array.from({ length: Math.max(0, count - 1) }, (_, index) => (
    current[index] ?? { fullName: '', isChild: false }
  ));

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout: signOut } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [transportListOpen, setTransportListOpen] = useState(false);
  const [transportListTransport, setTransportListTransport] = useState<TransportFilter>('organized');
  const [transportListLanguage, setTransportListLanguage] = useState<LanguageFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, rsvpData] = await Promise.all([
        api.getStats(),
        api.getRsvps(),
      ]);

      setStats(statsData);
      setRsvps(rsvpData.rsvps);
    } catch {
      navigate('/admin/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRsvps = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rsvps.filter((rsvp) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'attending' && rsvp.attending === 1) ||
        (statusFilter === 'declined' && rsvp.attending === 0);
      const matchesLanguage = languageFilter === 'all' || rsvp.language === languageFilter;
      const matchesSearch =
        !term ||
        [rsvp.full_name, rsvp.phone ?? '', rsvp.email]
          .some((value) => value.toLowerCase().includes(term));

      return matchesStatus && matchesLanguage && matchesSearch;
    });
  }, [languageFilter, rsvps, search, statusFilter]);

  const transportListRsvps = useMemo(() => (
    rsvps
      .filter((rsvp) =>
        rsvp.attending === 1 &&
        rsvp.transport === transportListTransport &&
        (transportListLanguage === 'all' || rsvp.language === transportListLanguage)
      )
      .sort((first, second) => first.full_name.localeCompare(second.full_name))
  ), [rsvps, transportListLanguage, transportListTransport]);

  const logout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const openCreate = () => {
    setForm(emptyForm());
    setError('');
    setFormOpen(true);
  };

  const openEdit = (rsvp: RsvpData) => {
    setForm({
      id: rsvp.id,
      full_name: rsvp.full_name,
      phone: rsvp.phone ?? '',
      attending: rsvp.attending === 1,
      guest_count: rsvp.guest_count,
      language: rsvp.language,
      transport: rsvp.transport ?? 'organized',
      additional_guests: createAdditionalGuests(rsvp.guest_count, rsvp.additional_guests),
      dietary_notes: rsvp.dietary_notes ?? '',
      message: rsvp.message ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const saveForm = async () => {
    setSaving(true);
    setError('');

    const payload: RsvpFormData = {
      full_name: form.full_name.trim(),
      email: makeEmail(form.phone, form.language, form.id),
      phone: form.phone.trim() || undefined,
      attending: form.attending,
      guest_count: form.attending ? form.guest_count : 1,
      language: form.language,
      transport: form.attending ? form.transport : null,
      additional_guests: form.attending ? form.additional_guests : [],
      dietary_notes: form.dietary_notes.trim() || undefined,
      message: form.message.trim() || undefined,
    };

    try {
      if (form.id) {
        await api.updateRsvp(form.id, payload);
      } else {
        await api.submitRsvp(payload);
      }

      setFormOpen(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminDashboard.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const deleteRsvp = async (id: number) => {
    if (!window.confirm(t('adminDashboard.confirmDelete'))) return;

    await api.deleteRsvp(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-charcoal">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">{t('adminDashboard.title')}</h1>
            <p className="text-xs text-muted">{t('adminDashboard.subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-black/10 bg-white p-1">
              {(['mk', 'hr'] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => i18n.changeLanguage(lng)}
                  className={`h-8 rounded px-2 text-xs font-semibold ${
                    i18n.language.startsWith(lng) ? 'bg-charcoal text-white' : 'text-muted hover:text-charcoal'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-charcoal px-3 py-2 text-sm text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              {t('adminDashboard.newResponse')}
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-muted hover:text-charcoal"
            >
              <LogOut className="h-4 w-4" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading ? (
          <p className="py-20 text-center text-muted">{t('adminDashboard.loading')}</p>
        ) : (
          <div className="space-y-6">
            {stats && <DashboardStats stats={stats} />}

            <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <AdminFormPanel
                form={form}
                formOpen={formOpen}
                saving={saving}
                error={error}
                setForm={setForm}
                setFormOpen={setFormOpen}
                saveForm={saveForm}
              />

              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-3 md:flex-row md:items-center">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t('adminDashboard.searchPlaceholder')}
                      className="h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <select
                    value={languageFilter}
                    onChange={(event) => setLanguageFilter(event.target.value as LanguageFilter)}
                    className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold"
                  >
                    <option value="all">{t('adminDashboard.allGroups')}</option>
                    <option value="mk">{t('adminDashboard.macedonian')}</option>
                    <option value="hr">{t('adminDashboard.croatian')}</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold"
                  >
                    <option value="all">{t('adminDashboard.allConfirmations')}</option>
                    <option value="attending">{t('adminDashboard.confirmedYes')}</option>
                    <option value="declined">{t('adminDashboard.confirmedNo')}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setTransportListOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm text-muted hover:text-charcoal"
                  >
                    <Bus className="h-4 w-4" />
                    {t('adminDashboard.transportList')}
                  </button>
                </div>

                <section className="rounded-lg border border-black/10 bg-white">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                    <h2 className="text-sm font-semibold">{t('adminDashboard.allResponses')}</h2>
                    <span className="text-xs text-muted">{t('adminDashboard.displayed', { count: filteredRsvps.length })}</span>
                  </div>

                  {filteredRsvps.length === 0 ? (
                    <p className="p-6 text-sm text-muted">{t('adminDashboard.noFilteredResults')}</p>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {filteredRsvps.map((rsvp) => (
                        <RsvpRow
                          key={rsvp.id}
                          rsvp={rsvp}
                          expanded={expandedId === rsvp.id}
                          onToggle={() => setExpandedId(expandedId === rsvp.id ? null : rsvp.id)}
                          onEdit={() => openEdit(rsvp)}
                          onDelete={() => deleteRsvp(rsvp.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </section>
          </div>
        )}
      </main>

      {transportListOpen && (
        <TransportListDialog
          rsvps={transportListRsvps}
          transport={transportListTransport}
          language={transportListLanguage}
          onTransportChange={setTransportListTransport}
          onLanguageChange={setTransportListLanguage}
          onClose={() => setTransportListOpen(false)}
        />
      )}
    </div>
  );
}

function DashboardStats({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  const summary = [
    { label: t('adminDashboard.totalResponses'), value: stats.total },
    { label: t('adminDashboard.confirmedYes'), value: stats.attending },
    { label: t('adminDashboard.confirmedNo'), value: stats.notAttending },
    { label: t('adminDashboard.totalGuests'), value: stats.guestTotal },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
        {summary.map((item) => (
          <div key={item.label} className="rounded-lg border border-black/10 bg-white p-4">
            <p className="text-xs uppercase text-muted">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <GroupPanel title={t('adminDashboard.macedonianGuests')} stats={stats.mk} />
        <GroupPanel title={t('adminDashboard.croatianGuests')} stats={stats.hr} />
      </div>
    </section>
  );
}

function GroupPanel({ title, stats }: { title: string; stats: Stats['mk'] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Users className="h-4 w-4 text-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label={t('adminDashboard.responses')} value={stats.total} />
        <Metric label={t('adminDashboard.guests')} value={stats.guestTotal} />
        <Metric label={t('adminDashboard.adults')} value={stats.adultTotal} />
        <Metric label={t('adminDashboard.children')} value={stats.childTotal} />
        <Metric label={t('adminDashboard.yes')} value={stats.attending} tone="good" />
        <Metric label={t('adminDashboard.no')} value={stats.declined} tone="bad" />
        <Metric label={t('adminDashboard.organizedTransport')} value={stats.organizedTransport} />
        <Metric label={t('adminDashboard.ownTransport')} value={stats.ownTransport} />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-md bg-[#f6f4ef] px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-xl font-semibold ${tone === 'good' ? 'text-sage-dark' : tone === 'bad' ? 'text-red-700' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function TransportListDialog({
  rsvps,
  transport,
  language,
  onTransportChange,
  onLanguageChange,
  onClose,
}: {
  rsvps: RsvpData[];
  transport: TransportFilter;
  language: LanguageFilter;
  onTransportChange: (transport: TransportFilter) => void;
  onLanguageChange: (language: LanguageFilter) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const passengerTotal = rsvps.reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <section className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-semibold">{t('adminDashboard.transportList')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-black/5 hover:text-charcoal"
            aria-label={t('admin.cancel')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label={t('adminDashboard.transport')}>
              <select
                value={transport}
                onChange={(event) => onTransportChange(event.target.value as TransportFilter)}
                className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold"
              >
                <option value="organized">{t('adminDashboard.organized')}</option>
                <option value="own">{t('adminDashboard.own')}</option>
              </select>
            </Field>

            <Field label={t('adminDashboard.group')}>
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as LanguageFilter)}
                className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold"
              >
                <option value="all">{t('adminDashboard.allGroups')}</option>
                <option value="mk">{t('adminDashboard.macedonian')}</option>
                <option value="hr">{t('adminDashboard.croatian')}</option>
              </select>
            </Field>

            <div className="rounded-md bg-[#f6f4ef] px-3 py-2">
              <p className="text-xs text-muted">{t('adminDashboard.passengers')}</p>
              <p className="text-xl font-semibold">{passengerTotal}</p>
            </div>
          </div>

          {rsvps.length === 0 ? (
            <p className="rounded-md bg-[#f6f4ef] p-4 text-sm text-muted">{t('adminDashboard.noTransportListResults')}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="rounded-md bg-[#f6f4ef] px-3 py-2 text-sm font-medium">
                  {rsvp.full_name} ({rsvp.guest_count})
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminFormPanel({
  form,
  formOpen,
  saving,
  error,
  setForm,
  setFormOpen,
  saveForm,
}: {
  form: AdminForm;
  formOpen: boolean;
  saving: boolean;
  error: string;
  setForm: React.Dispatch<React.SetStateAction<AdminForm>>;
  setFormOpen: (open: boolean) => void;
  saveForm: () => void;
}) {
  const { t } = useTranslation();

  if (!formOpen) {
    return (
      <aside className="rounded-lg border border-black/10 bg-white p-4">
        <h2 className="text-sm font-semibold">{t('adminDashboard.quickEntry')}</h2>
        <p className="mt-2 text-sm text-muted">{t('adminDashboard.quickEntryDescription')}</p>
        <button
          onClick={() => setFormOpen(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-charcoal px-3 py-2 text-sm text-white hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          {t('adminDashboard.addResponse')}
        </button>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-black/10 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{form.id ? t('adminDashboard.editResponse') : t('adminDashboard.newResponse')}</h2>
        <button onClick={() => setFormOpen(false)} className="rounded-md p-1 text-muted hover:bg-black/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <Field label={t('adminDashboard.fullName')}>
          <input
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            className="admin-input"
          />
        </Field>

        <Field label={t('adminDashboard.phone')}>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="admin-input"
          />
        </Field>

        <Field label={t('adminDashboard.group')}>
          <div className="grid grid-cols-2 gap-2">
            <Toggle active={form.language === 'mk'} onClick={() => setForm((current) => ({ ...current, language: 'mk' }))}>
              MK
            </Toggle>
            <Toggle active={form.language === 'hr'} onClick={() => setForm((current) => ({ ...current, language: 'hr' }))}>
              HR
            </Toggle>
          </div>
        </Field>

        <Field label={t('adminDashboard.confirmation')}>
          <div className="grid grid-cols-2 gap-2">
            <Toggle active={form.attending} onClick={() => setForm((current) => ({ ...current, attending: true }))}>
              {t('adminDashboard.yes')}
            </Toggle>
            <Toggle active={!form.attending} onClick={() => setForm((current) => ({ ...current, attending: false, guest_count: 1, additional_guests: [] }))}>
              {t('adminDashboard.no')}
            </Toggle>
          </div>
        </Field>

        {form.attending && (
          <>
            <Field label={t('adminDashboard.guestCount')}>
              <select
                value={form.guest_count}
                onChange={(event) => {
                  const guestCount = Number(event.target.value);
                  setForm((current) => ({
                    ...current,
                    guest_count: guestCount,
                    additional_guests: createAdditionalGuests(guestCount, current.additional_guests),
                  }));
                }}
                className="admin-input"
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </Field>

            <Field label={t('adminDashboard.transport')}>
              <div className="grid grid-cols-2 gap-2">
                <Toggle active={form.transport === 'organized'} onClick={() => setForm((current) => ({ ...current, transport: 'organized' }))}>
                  {t('adminDashboard.organized')}
                </Toggle>
                <Toggle active={form.transport === 'own'} onClick={() => setForm((current) => ({ ...current, transport: 'own' }))}>
                  {t('adminDashboard.own')}
                </Toggle>
              </div>
            </Field>
          </>
        )}

        {form.attending && form.additional_guests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">{t('adminDashboard.additionalGuests')}</p>
            {form.additional_guests.map((guest, index) => (
              <div key={index} className="rounded-md border border-black/10 p-2">
                <input
                  value={guest.fullName}
                  onChange={(event) => {
                    const additionalGuests = [...form.additional_guests];
                    additionalGuests[index] = { ...guest, fullName: event.target.value };
                    setForm((current) => ({ ...current, additional_guests: additionalGuests }));
                  }}
                  placeholder={t('adminDashboard.guestNumber', { number: index + 2 })}
                  className="admin-input"
                />
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={guest.isChild}
                    onChange={(event) => {
                      const additionalGuests = [...form.additional_guests];
                      additionalGuests[index] = { ...guest, isChild: event.target.checked };
                      setForm((current) => ({ ...current, additional_guests: additionalGuests }));
                    }}
                  />
                  {t('adminDashboard.child')}
                </label>
              </div>
            ))}
          </div>
        )}

        <Field label={t('adminDashboard.dietaryNotes')}>
          <textarea
            value={form.dietary_notes}
            onChange={(event) => setForm((current) => ({ ...current, dietary_notes: event.target.value }))}
            className="admin-input min-h-20"
          />
        </Field>

        <Field label={t('adminDashboard.messageDetails')}>
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="admin-input min-h-20"
          />
        </Field>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          onClick={saveForm}
          disabled={saving || !form.full_name.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-3 py-2 text-sm text-white hover:bg-gold-light disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {saving ? t('adminDashboard.saving') : t('admin.save')}
        </button>
      </div>

      <style>{`
        .admin-input {
          width: 100%;
          min-height: 2.5rem;
          border-radius: 0.375rem;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .admin-input:focus {
          border-color: #b8956a;
          box-shadow: 0 0 0 3px rgba(184, 149, 106, 0.12);
        }
      `}</style>
    </aside>
  );
}

function RsvpRow({
  rsvp,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  rsvp: RsvpData;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const statusClass = rsvp.attending === 1 ? 'bg-sage/15 text-sage-dark' : 'bg-red-50 text-red-700';

  return (
    <article>
      <div className="grid gap-3 px-4 py-3 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto] md:items-center">
        <div>
          <p className="font-medium">{rsvp.full_name}</p>
          <p className="text-xs text-muted">{rsvp.phone || t('adminDashboard.noPhone')}</p>
        </div>
        <div className="text-sm">
          <span className="rounded-md bg-black/5 px-2 py-1 text-xs uppercase">{rsvp.language}</span>
        </div>
        <span className={`w-fit rounded-md px-2 py-1 text-xs font-medium ${statusClass}`}>
          {rsvp.attending === 1 ? t('adminDashboard.yes') : t('adminDashboard.no')}
        </span>
        <div className="text-sm text-muted">
          {rsvp.attending === 1
            ? t('adminDashboard.rowSummary', { count: rsvp.guest_count, transport: transportLabel(rsvp.transport, t) })
            : t('adminDashboard.notAttending')}
        </div>
        <div className="flex items-center gap-1">
          <IconButton label={t('adminDashboard.details')} onClick={onToggle}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </IconButton>
          <IconButton label={t('admin.edit')} onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton label={t('admin.delete')} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-black/10 bg-[#fbfaf7] px-4 py-4">
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <Detail label={t('adminDashboard.confirmation')} value={rsvp.attending === 1 ? t('adminDashboard.yes') : t('adminDashboard.no')} />
            <Detail label={t('adminDashboard.group')} value={rsvp.language === 'mk' ? t('adminDashboard.macedonian') : t('adminDashboard.croatian')} />
            <Detail label={t('adminDashboard.transport')} value={transportLabel(rsvp.transport, t)} />
            <Detail label={t('adminDashboard.guestCount')} value={String(rsvp.guest_count)} />
            <Detail label={t('adminDashboard.phone')} value={rsvp.phone || '-'} />
            <Detail label={t('admin.date')} value={new Date(rsvp.created_at).toLocaleDateString()} />
          </div>

          {rsvp.additional_guests.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase text-muted">{t('adminDashboard.additionalGuests')}</p>
              <div className="flex flex-wrap gap-2">
                {rsvp.additional_guests.map((guest, index) => (
                  <span key={`${guest.fullName}-${index}`} className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm">
                    {guest.fullName || t('adminDashboard.guestNumber', { number: index + 2 })}
                    {guest.isChild ? ` · ${t('adminDashboard.child').toLowerCase()}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(rsvp.dietary_notes || rsvp.message) && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailBlock label={t('adminDashboard.dietaryNotes')} value={rsvp.dietary_notes} />
              <DetailBlock label={t('adminDashboard.messageDetails')} value={rsvp.message} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm ${
        active ? 'border-gold bg-gold text-white' : 'border-black/10 bg-white text-muted hover:border-gold/60'
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-md border border-black/10 p-2 text-muted hover:bg-black/5 hover:text-charcoal"
    >
      {children}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-3">
      <p className="mb-1 text-xs font-medium uppercase text-muted">{label}</p>
      <p className="whitespace-pre-line text-sm">{value || '-'}</p>
    </div>
  );
}

function transportLabel(transport: RsvpData['transport'], t: (key: string) => string) {
  if (transport === 'organized') return t('adminDashboard.organized');
  if (transport === 'own') return t('adminDashboard.own');
  return '-';
}
