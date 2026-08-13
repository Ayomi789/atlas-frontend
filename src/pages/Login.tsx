import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const { login, currentUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Login failed');
    else navigate('/app');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2.5 font-semibold tracking-[-.03em]">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#243e31] text-white">
              <BookOpen size={18} />
            </span>
            <span className="text-xl text-[#20211f]">Atlas</span>
          </Link>
          <h1 className="text-[26px] font-semibold tracking-[-.035em] text-[#22231f]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#74766f]">Sign in to your knowledge hub</p>
        </div>

        <div className="rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                required
              />
              <div className="mt-1.5 text-right">
                <Link to="/forgot-password" className="text-xs font-medium text-[#385847] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#74766f]">
          No account?{' '}
          <Link to="/register" className="font-medium text-[#385847] hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
