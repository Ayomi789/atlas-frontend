// import { useState } from 'react';
// import { Link, Navigate, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';
// import { useStore } from '../lib/store';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';

// export function Register() {
//   const { register, currentUser } = useStore();
//   const navigate = useNavigate();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   if (currentUser) return <Navigate to="/app" replace />;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     const res = await register(name.trim(), email.trim(), password);
//     setLoading(false);
//     if (!res.ok) setError(res.error || 'Registration failed');
//     else navigate('/app');
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="relative w-full max-w-md"
//       >
//         <div className="mb-8 text-center">
//           <Link to="/" className="mb-6 inline-flex items-center gap-2.5 font-semibold tracking-[-.03em]">
//             <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#243e31] text-white">
//               <BookOpen size={18} />
//             </span>
//             <span className="text-xl text-[#20211f]">Atlas</span>
//           </Link>
//           <h1 className="text-[26px] font-semibold tracking-[-.035em] text-[#22231f]">Create your hub</h1>
//           <p className="mt-1 text-sm text-[#74766f]">Start building your team knowledge base</p>
//         </div>

//         <div className="rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <Input
//               label="Full name"
//               placeholder="Alex Rivera"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               icon={<User className="h-4 w-4" />}
//               required
//             />
//             <Input
//               label="Email"
//               type="email"
//               placeholder="you@company.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               icon={<Mail className="h-4 w-4" />}
//               required
//             />
//             <Input
//               label="Password"
//               type="password"
//               placeholder="Min. 6 characters"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               icon={<Lock className="h-4 w-4" />}
//               required
//               minLength={6}
//             />
//             {error && (
//               <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
//                 {error}
//               </div>
//             )}
//             <Button type="submit" className="w-full" loading={loading}>
//               Create account <ArrowRight className="h-4 w-4" />
//             </Button>
//           </form>
//         </div>

//         <p className="mt-6 text-center text-sm text-[#74766f]">
//           Already have an account?{' '}
//           <Link to="/login" className="font-medium text-[#385847] hover:underline">
//             Sign in
//           </Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, User, ArrowRight, MailCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Register() {
  const { register, resendVerification, currentUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resent, setResent] = useState(false);

  if (currentUser) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Registration failed');
    else setRegistered(true);
  };

  const handleResend = async () => {
    setResent(false);
    await resendVerification(email.trim());
    setResent(true);
  };

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#e7eee6] text-[#294637]">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-.03em] text-[#22231f]">Check your email</h1>
          <p className="mt-2 text-sm text-[#74766f]">
            We sent a verification link to <span className="font-medium text-[#22231f]">{email}</span>. Click
            it to activate your account, then sign in.
          </p>
          <div className="mt-6 rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
            <p className="text-xs text-[#96978f]">Didn't get it? Check spam, or</p>
            <Button variant="outline" className="mt-3 w-full" onClick={handleResend}>
              {resent ? 'Sent again!' : 'Resend verification email'}
            </Button>
          </div>
          <p className="mt-6 text-sm text-[#74766f]">
            <Link to="/login" className="font-medium text-[#385847] hover:underline">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-[26px] font-semibold tracking-[-.035em] text-[#22231f]">Create your hub</h1>
          <p className="mt-1 text-sm text-[#74766f]">Start building your team knowledge base</p>
        </div>

        <div className="rounded-2xl border border-[#e7e7e2] bg-white p-6 shadow-[0_8px_30px_rgba(22,30,24,.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
            />
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#74766f]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#385847] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}