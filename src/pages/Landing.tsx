import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Search,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Database,
  Brain,
  Users,
  Bot,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: FileText,
    title: 'Document intelligence',
    desc: 'Upload PDFs, DOCX, Markdown, and code. We chunk, embed, and index automatically.',
  },
  {
    icon: MessageSquare,
    title: 'RAG-powered chat',
    desc: 'Ask natural questions. Get answers grounded only in your docs — with citations.',
  },
  {
    icon: Search,
    title: 'Hybrid search',
    desc: 'Compare keyword search with semantic vector search side by side.',
  },
  {
    icon: Shield,
    title: 'Workspace security',
    desc: 'JWT auth, roles (owner/admin/member/viewer), and multi-tenant isolation.',
  },
  {
    icon: Users,
    title: 'Team workspaces',
    desc: 'Organizations, members, activity feeds, and shared knowledge bases.',
  },
  {
    icon: Brain,
    title: 'No hallucinations',
    desc: 'If it is not in your documents, Atlas says so — with confidence scores.',
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#20211f]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5 font-semibold tracking-[-.03em]">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#243e31] text-white">
            <BookOpen size={17} />
          </span>
          <span className="text-[18px]">Atlas</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-medium text-[#5f615b] hover:text-[#294637] sm:block">
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8e3d8] bg-[#f4f8f2] px-3 py-1 text-xs font-medium text-[#385847]">
            <Zap className="h-3 w-3" /> Notion + ChatGPT + Slack search, simplified
          </div>
          <h1 className="mx-auto max-w-3xl text-[36px] font-semibold leading-[1.12] tracking-[-.045em] text-[#22231f] sm:text-[48px]">
            Your team's knowledge,{' '}
            <span className="text-[#294637]">answered with citations</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-[#74766f]">
            Upload handbooks, policies, API docs, and meeting notes. Ask anything — get precise
            answers grounded only in your documents.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="min-w-[170px]">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="min-w-[170px]">
                Try live demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#96978f]">Demo: demo@knowhub.app / demo1234</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-14 max-w-3xl"
        >
          <div className="overflow-hidden rounded-2xl border border-[#e7e7e2] bg-white shadow-[0_8px_30px_rgba(22,30,24,.06)]">
            <div className="flex items-center gap-2 border-b border-[#ecece8] px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#e5b4b0]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#e8d5a8]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#b9d4b4]" />
              <span className="ml-3 text-xs text-[#96978f]">Ask Atlas · Acme Inc</span>
            </div>
            <div className="space-y-4 p-5 text-left">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#e7eee6] px-4 py-2.5 text-sm text-[#294637]">
                  How many annual leave days do contractors get?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dfeedd] text-[#416a42]">
                  <Bot size={16} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="rounded-2xl rounded-tl-md border border-[#e7e7e2] bg-[#fcfcfb] px-4 py-3 text-sm leading-relaxed text-[#555851]">
                    According to the <strong className="text-[#22231f]">HR Handbook 2026</strong>,
                    independent contractors receive{' '}
                    <strong className="text-[#294637]">10 annual leave days</strong> per calendar
                    year, prorated by start date.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#dcead4] bg-[#f1f8ee] px-2.5 py-1 text-[11px] font-medium text-[#4c7e38]">
                      <CheckCircle2 className="h-3 w-3" /> 92% confidence
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e5df] bg-[#f3f3f0] px-2.5 py-1 text-[11px] text-[#686a64]">
                      <FileText className="h-3 w-3" /> HR Handbook · p.1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-[28px] font-semibold tracking-[-.035em] text-[#22231f]">
            Built for how small teams actually work
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[#74766f]">
            Auth, multi-tenancy, file pipelines, embeddings, RAG, analytics, and polished UX.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-[#e7e7e2] bg-white p-5 shadow-[0_1px_2px_rgba(22,30,24,.025)]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#e7eee6] text-[#294637]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-semibold tracking-[-.02em] text-[#22231f]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#74766f]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-2xl border border-[#d8e3d8] bg-[#f4f8f2] p-8 sm:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-xl font-semibold leading-relaxed tracking-[-.03em] text-[#22231f]">
                "Instead of saying 'I know LangChain' — you'll actually have built something with
                RAG, vectors, and multi-tenant auth."
              </p>
              <p className="mt-3 text-sm text-[#74766f]">The portfolio project that stands out</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Database, label: 'Vector search' },
                { icon: Shield, label: 'JWT + RBAC' },
                { icon: Brain, label: 'RAG pipeline' },
                { icon: FileText, label: 'Doc ingestion' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 rounded-xl border border-[#d8e3d8] bg-white/70 p-3"
                >
                  <s.icon className="h-4 w-4 text-[#385847]" />
                  <span className="text-sm text-[#555851]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-[#e8e8e3]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-[#96978f] sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#294637]" />
            <span>Atlas — AI Knowledge Hub for Small Teams</span>
          </div>
          <div>Product by Abdulateef Salako</div>
        </div>
      </footer>
    </div>
  );
}
