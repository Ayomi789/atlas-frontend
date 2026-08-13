import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, ArrowRight, MailCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function ForgotPassword() {
  const { forgotPassword } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email.trim());
    setLoading(false);
    setSent(true);
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
          <h1 className="text-[26px] font-semibold tracking-[-.035em] text-[#22231f]">Reset your password</h1>
          <p className="mt-1 text-sm text-[#74766f]">We'll email you a link to choose a new one</p>
        </div>

        <div className="rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#e7eee6] text-[#294637]">
                <MailCheck className="h-6 w-6" />
              </div>
              <p className="text-sm text-[#74766f]">
                If an account exists for <span className="font-medium text-[#22231f]">{email}</span>, a reset
                link is on its way.
              </p>
            </div>
          ) : (
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
              <Button type="submit" className="w-full" loading={loading}>
                Send reset link <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
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