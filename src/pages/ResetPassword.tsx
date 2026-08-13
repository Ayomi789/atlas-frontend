import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lock, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function ResetPassword() {
  const { resetPassword } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This reset link is missing a token.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Reset failed');
    else navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2.5 font-semibold tracking-[-.03em]">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#243e31] text-white">
              <BookOpen size={18} />
            </span>
            <span className="text-xl text-[#20211f]">Atlas</span>
          </Link>
          <h1 className="text-[26px] font-semibold tracking-[-.035em] text-[#22231f]">Choose a new password</h1>
        </div>

        <div className="rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
          {!token && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              This link is missing its token — open it directly from the email instead of navigating here manually.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Min. 8 characters"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
            />
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading} disabled={!token}>
              Reset password <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#74766f]">
          <Link to="/login" className="font-medium text-[#385847] hover:underline">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}