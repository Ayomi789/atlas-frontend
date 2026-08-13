import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  Users,
  Activity,
  ArrowRight,
  Upload,
  Bot,
  Clock,
  ChevronRight,
  FolderPlus,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatRelative } from '../lib/utils';

const activityIcons: Record<string, typeof Activity> = {
  document_ready: Upload,
  document_failed: FileText,
  document_deleted: FileText,
  member_invitation: Users,
  chat_question: MessageSquare,
  workspace_updated: Activity,
};

const docColors = [
  'bg-[#f1f8ee] text-[#4c7e38]',
  'bg-[#f3efff] text-[#7657c7]',
  'bg-[#fff4e7] text-[#bd7119]',
  'bg-[#eaf6fb] text-[#277998]',
  'bg-[#e7eee6] text-[#294637]',
];

export function Dashboard() {
  const {
    currentUser,
    currentWorkspace,
    workspaceDocs,
    workspaceChats,
    workspaceMembers,
   teamActivity,
  } = useStore();


    const location = useLocation();

      useEffect(() => {
        if (location.hash === '#activity') {
          const id = window.setTimeout(() => {
            document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
          return () => window.clearTimeout(id);
        }
      }, [location.hash]);

  const totalQuestions = workspaceChats.reduce(
    (s, c) => s + c.messages.filter((m) => m.role === 'user').length,
    0
  );
  const readyDocs = workspaceDocs.filter((d) => d.status === 'ready').length;
  const firstName = currentUser?.name.split(' ')[0] || 'there';

  const weekday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const docNames = workspaceDocs.slice(0, 2).map((d) => d.name);
  const suggestions = [
    docNames[0] ? `Summarize ${docNames[0]}` : 'What documents do I have access to?',
    docNames[0] ? `What are the key points in ${docNames[0]}?` : 'Upload a document to get started',
    docNames[1] ? `What does ${docNames[1]} cover?` : 'What can you help me with?',
    'What was discussed in my most recent conversation?',
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="mb-2 text-sm text-[#787a73]">{weekday}</p>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[31px] font-semibold tracking-[-.045em] text-[#22231f] sm:text-[36px]"
          >
            Good morning, {firstName}.
          </motion.h1>
          <p className="mt-2 text-[15px] text-[#74766f]">
            Here's what's happening in {currentWorkspace?.name || 'your workspace'}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/documents">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </Link>
          <Link to="/app/chat">
            <Button size="sm">
              <Bot className="h-4 w-4" /> Ask Atlas
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            value: String(workspaceDocs.length),
            label: 'Documents',
            detail: `${readyDocs} indexed`,
          },
          {
            value: String(totalQuestions),
            label: 'Questions answered',
            detail: `${workspaceChats.length} conversations`,
          },
          {
            value: String(workspaceMembers.length),
            label: 'Active members',
            detail: 'Across your workspace',
          },
        ].map((m, i) => (
          <motion.article
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[#e7e7e2] bg-white px-5 py-[18px] shadow-[0_1px_2px_rgba(22,30,24,.025)]"
          >
            <p className="text-[25px] font-semibold tracking-[-.045em] text-[#22231f]">{m.value}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#555851]">{m.label}</p>
              <span className="text-[11px] text-[#93958e]">{m.detail}</span>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-2 grid gap-7 xl:grid-cols-[minmax(0,1fr)_315px]">
        <div className="rounded-xl border border-[#e7e7e2] bg-white p-5 shadow-[0_1px_2px_rgba(22,30,24,.025)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-.025em] text-[#22231f]">
                Your knowledge base
              </h2>
              <p className="mt-1 text-[13px] text-[#7a7c75]">
                {workspaceDocs.length} documents · {readyDocs} ready for retrieval
              </p>
            </div>
            <Link
              to="/app/documents"
              className="hidden items-center gap-1.5 text-sm font-medium text-[#385847] hover:underline sm:flex"
            >
              <FolderPlus size={16} /> Manage docs
            </Link>
          </div>

          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#979990]" />
            <Link to="/app/search">
              <div className="w-full cursor-text rounded-lg border border-[#e4e5df] bg-[#fcfcfb] py-2.5 pl-9 pr-3 text-sm text-[#999b94]">
                Search documents…
              </div>
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#ecece8]">
            {workspaceDocs.slice(0, 5).map((doc, i) => (
              <div key={doc.id} className="flex items-center gap-3 py-3.5 first:pt-1.5">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${docColors[i % docColors.length]}`}
                >
                  {doc.name
                    .split(/[\s._-]/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#22231f]">{doc.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#85877f]">
                    {doc.type.toUpperCase()} · {doc.chunkCount} chunks
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <Badge color={doc.status === 'ready' ? 'emerald' : 'amber'}>{doc.status}</Badge>
                  <p className="mt-1 text-[11px] text-[#999b94]">{formatRelative(doc.uploadedAt)}</p>
                </div>
                <Link
                  to="/app/documents"
                  className="rounded p-1.5 text-[#9a9b95] hover:bg-[#f1f1ee]"
                >
                  <MoreHorizontal size={18} />
                </Link>
              </div>
            ))}
            {workspaceDocs.length === 0 && (
              <p className="py-8 text-center text-sm text-[#85877f]">
                No documents yet. Upload your first file.
              </p>
            )}
          </div>

          <Link
            to="/app/documents"
            className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#385847] hover:underline"
          >
            View all documents <ChevronRight size={16} />
          </Link>

          <div className="mt-8 border-t border-[#ecece8] pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#555851]">Try asking</h3>
              <Link
                to="/app/chat"
                className="flex items-center gap-1 text-xs font-medium text-[#385847] hover:underline"
              >
                Open chat <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((q) => (
                <Link
                  key={q}
                  to={`/app/chat?q=${encodeURIComponent(q)}`}
                  className="rounded-lg border border-[#e7e7e2] bg-[#fcfcfb] p-3 text-left text-sm text-[#555851] transition hover:border-[#d8e3d8] hover:bg-[#f4f8f2]"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-7">
          <div className="rounded-xl border border-[#d8e3d8] bg-[#f4f8f2] p-5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dfeedd] text-[#416a42]">
              <Bot size={17} />
            </span>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-.035em] text-[#22231f]">
              Ask your workspace
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#667064]">
              Get clear answers grounded in your team's documents — with sources and confidence.
            </p>
            <Link to="/app/chat">
              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#294637] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#1d362a]">
                <Bot size={16} /> Ask Atlas
              </button>
            </Link>
          </div>

          <div id="activity">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold tracking-[-.025em] text-[#22231f]">
                Recent activity
              </h2>
              <Clock className="h-4 w-4 text-[#96978f]" />
            </div>
            <div className="space-y-4">
              {teamActivity.slice(0, 8).map((a) => {
                const Icon = activityIcons[a.type] || Activity;
                return (
                  <div key={a.id} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9e5dc] text-[#676354]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="-mt-0.5 text-[12px] leading-5 text-[#70726b]">
                      {a.message}
                      <br />
                      <span className="text-[11px] text-[#a0a199]">
                        {formatRelative(a.createdAt)}
                      </span>
                    </p>
                  </div>
                );
              })}
              {teamActivity.length === 0 && (
                <p className="py-6 text-center text-sm text-[#85877f]">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
