import { supabase } from './supabase';

export interface RsvpData {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  attending: number;
  guest_count: number;
  language: 'mk' | 'hr';
  transport: 'organized' | 'own' | null;
  additional_guests: AdditionalGuest[];
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdditionalGuest {
  fullName: string;
  isChild: boolean;
}

export interface RsvpFormData {
  full_name: string;
  email: string;
  phone?: string;
  attending: boolean;
  guest_count: number;
  language: 'mk' | 'hr';
  transport?: 'organized' | 'own' | null;
  additional_guests?: AdditionalGuest[];
  dietary_notes?: string;
  message?: string;
}

export interface Stats {
  total: number;
  attending: number;
  notAttending: number;
  guestTotal: number;
  mk: GroupStats;
  hr: GroupStats;
}

export interface GroupStats {
  total: number;
  attending: number;
  declined: number;
  guestTotal: number;
  adultTotal: number;
  childTotal: number;
  organizedTransport: number;
  ownTransport: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin';
}

const HARDCODED_ADMIN_EMAIL = 'sanja@admin.com';
const HARDCODED_ADMIN_PASSWORD = 'sanja';
const ADMIN_SESSION_STORAGE_KEY = 'admin-auth-session';

function getStoredAdminSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<AuthUser>;
    if (parsed.id && parsed.email && parsed.role === 'admin') {
      return parsed as AuthUser;
    }
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  }

  return null;
}

function setStoredAdminSession(user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredAdminSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

const emptyGroupStats = (): GroupStats => ({
  total: 0,
  attending: 0,
  declined: 0,
  guestTotal: 0,
  adultTotal: 0,
  childTotal: 0,
  organizedTransport: 0,
  ownTransport: 0,
});

function toRsvpData(row: {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  attending: boolean;
  guest_count: number;
  language?: 'mk' | 'hr' | null;
  transport?: 'organized' | 'own' | null;
  additional_guests?: AdditionalGuest[] | null;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}): RsvpData {
  const inferredLanguage = row.language ?? (row.email.startsWith('hr-') ? 'hr' : 'mk');

  return {
    ...row,
    attending: row.attending ? 1 : 0,
    language: inferredLanguage,
    transport: row.transport ?? inferTransport(row.dietary_notes),
    additional_guests: Array.isArray(row.additional_guests) && row.additional_guests.length > 0
      ? row.additional_guests
      : parseAdditionalGuests(row.message),
  };
}

function inferTransport(notes: string | null): 'organized' | 'own' | null {
  const normalized = notes?.toLowerCase() ?? '';
  if (normalized.includes('сопствен') || normalized.includes('vlastiti') || normalized.includes('own')) return 'own';
  if (normalized.includes('организиран') || normalized.includes('organiziran') || normalized.includes('organized')) return 'organized';
  return null;
}

function parseAdditionalGuests(message: string | null): AdditionalGuest[] {
  if (!message) return [];

  return message
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map((line) => ({
      fullName: line.replace(/\s*\((Дете|Dijete)\)\s*$/i, ''),
      isChild: /\((Дете|Dijete)\)/i.test(line),
    }));
}

async function getAllRsvps() {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toRsvpData);
}

export const api = {
  async submitRsvp(data: RsvpFormData) {
    const { data: inserted, error } = await supabase
      .from('rsvps')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone ?? null,
        attending: data.attending,
        guest_count: data.guest_count,
        language: data.language,
        transport: data.attending ? data.transport ?? null : null,
        additional_guests: data.attending ? data.additional_guests ?? [] : [],
        dietary_notes: data.dietary_notes ?? null,
        message: data.message ?? null,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, updated: false, id: inserted.id };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASSWORD) {
      const user: AuthUser = {
        id: 'hardcoded-admin',
        email: HARDCODED_ADMIN_EMAIL,
        role: 'admin',
      };

      setStoredAdminSession(user);
      return { user };
    }

    throw new Error('Invalid credentials');
  },

  async logout() {
    clearStoredAdminSession();
  },

  async me() {
    const user = getStoredAdminSession();

    if (!user) {
      throw new Error('Not authenticated');
    }

    return { user };
  },

  async getStats(): Promise<Stats> {
    const rsvps = await getAllRsvps();
    const groups = {
      mk: emptyGroupStats(),
      hr: emptyGroupStats(),
    };

    rsvps.forEach((rsvp) => {
      const group = groups[rsvp.language];
      group.total += 1;

      if (rsvp.attending === 1) {
        const childTotal = rsvp.additional_guests.filter((guest) => guest.isChild).length;
        group.attending += 1;
        group.guestTotal += rsvp.guest_count;
        group.childTotal += childTotal;
        group.adultTotal += rsvp.guest_count - childTotal;
        if (rsvp.transport === 'organized') group.organizedTransport += rsvp.guest_count;
        if (rsvp.transport === 'own') group.ownTransport += rsvp.guest_count;
      } else {
        group.declined += 1;
      }
    });

    return {
      total: rsvps.length,
      attending: rsvps.filter((rsvp) => rsvp.attending === 1).length,
      notAttending: rsvps.filter((rsvp) => rsvp.attending === 0).length,
      guestTotal: rsvps
        .filter((rsvp) => rsvp.attending === 1)
        .reduce((sum, rsvp) => sum + rsvp.guest_count, 0),
      mk: groups.mk,
      hr: groups.hr,
    };
  },

  async getRsvps(search = '', filter = 'all') {
    let rsvps = await getAllRsvps();

    if (filter === 'attending') {
      rsvps = rsvps.filter((rsvp) => rsvp.attending === 1);
    }

    if (filter === 'declined') {
      rsvps = rsvps.filter((rsvp) => rsvp.attending === 0);
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      rsvps = rsvps.filter((rsvp) =>
        [rsvp.full_name, rsvp.email, rsvp.phone ?? '']
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      );
    }

    return { rsvps };
  },

  async updateRsvp(id: number, data: RsvpFormData) {
    const { data: updated, error } = await supabase
      .from('rsvps')
      .update({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone ?? null,
        attending: data.attending,
        guest_count: data.guest_count,
        language: data.language,
        transport: data.attending ? data.transport ?? null : null,
        additional_guests: data.attending ? data.additional_guests ?? [] : [],
        dietary_notes: data.dietary_notes ?? null,
        message: data.message ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { rsvp: toRsvpData(updated) };
  },

  async deleteRsvp(id: number) {
    const { error } = await supabase.from('rsvps').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },
};
