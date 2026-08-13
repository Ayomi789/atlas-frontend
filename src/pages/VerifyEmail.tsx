import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';

export function VerifyEmail() {
  const { verifyEmail } = useStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setStatus('error');
      setError('This verification link is missing a token.');
      return;
    }
    (async () => {
      const res = await verifyEmail(token);
      if (res.ok) setStatus('success');
      else {
        setStatus('error');
        setError(res.error || 'This verification link is invalid or has expired.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5 font-semibold tracking-[-.03em]">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#243e31] text-white">
            <BookOpen size={18} />
          </span>
          <span className="text-xl text-[#20211f]">Atlas</span>
        </Link>

        <div className="rounded-2xl border border-[#e7e7e2] bg-white p-8 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#96978f]" />
              <p className="text-sm text-[#74766f]">Verifying your email…</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-[#385847]" />
              <h1 className="text-lg font-semibold text-[#22231f]">Email verified</h1>
              <p className="mt-1.5 text-sm text-[#74766f]">Your account is active. You can sign in now.</p>
              <Link to="/login">
                <Button className="mt-5 w-full">Continue to sign in</Button>
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-10 w-10 text-rose-500" />
              <h1 className="text-lg font-semibold text-[#22231f]">Verification failed</h1>
              <p className="mt-1.5 text-sm text-[#74766f]">{error}</p>
              <Link to="/register">
                <Button variant="outline" className="mt-5 w-full">Back to registration</Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}