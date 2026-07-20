import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (email === 'sanja@amin.com' && password === 'sanja') {
      localStorage.setItem('admin-auth', 'true');
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid email or password');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-ivory to-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart className="w-8 h-8 text-gold fill-gold/30 mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-charcoal">
            {t('admin.loginTitle')}
          </h1>
          <p className="text-muted text-sm mt-2">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-gold/15 shadow-lg"
        >
          <div className="mb-5">
            <label className="block text-sm text-muted mb-1.5">
              {t('admin.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold/25 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/15 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-muted mb-1.5">
              {t('admin.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold/25 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/15 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white text-sm uppercase rounded-full disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            {loading ? t('admin.signingIn') : t('admin.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
