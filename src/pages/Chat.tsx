import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  Bot,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatRelative } from '../lib/utils';
import type { ChatSession } from '../types';

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-[#4c7e38]' : pct >= 55 ? 'bg-[#bd7119]' : 'bg-[#b91c1c]';
  const badge = pct >= 80 ? 'emerald' : pct >= 55 ? 'amber' : 'rose';
  return (
    <div className="flex items-center gap-2">
      <Badge color={badge as 'emerald'}>{pct}% confidence</Badge>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#ecece8]">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#22231f]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function Chat() {
  const { workspaceChats, workspaceDocs, askQuestion, createChat, deleteChat } = useStore();
  const [params, setParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(workspaceChats[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCite, setExpandedCite] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 640);
  const bottomRef = useRef<HTMLDivElement>(null);
  const askedRef = useRef(false);

  const activeChat: ChatSession | undefined =
    workspaceChats.find((c) => c.id === activeId) ?? workspaceChats[0];

  useEffect(() => {
    if (activeChat && activeChat.id !== activeId) setActiveId(activeChat.id);
  }, [activeChat, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length, loading]);

  useEffect(() => {
    const q = params.get('q');
    if (q && !askedRef.current) {
      askedRef.current = true;
      setParams({});
      void handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (override?: string) => {
    const q = (override ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);
    try {
      const chat = await askQuestion(activeId, q);
      setActiveId(chat.id);
    } finally {
      setLoading(false);
    }
  };

 const handleNew = () => {
  const chat = createChat();
  setActiveId(chat.id);
  if (window.innerWidth < 640) setSidebarOpen(false);
};

  return (
      <div className="-mx-5 flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-xl border border-[#e7e7e2] bg-white shadow-[0_1px_2px_rgba(22,30,24,.025)] sm:-mx-0 lg:h-[calc(100vh-9rem)]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#182019]/30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            'flex-col border-r border-[#ecece8] bg-[#fcfcfb] transition-all',
            sidebarOpen
              ? 'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[80vw] shadow-xl sm:static sm:z-auto sm:w-60 sm:max-w-none sm:shadow-none'
              : 'hidden sm:flex sm:w-0 sm:overflow-hidden'
          )}
      >
        <div className="border-b border-[#ecece8] p-3">
          <Button size="sm" className="w-full" onClick={handleNew}>
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {workspaceChats.map((c) => (
        
          <button
            key={c.id}
            onClick={() => {
              setActiveId(c.id);
              if (window.innerWidth < 640) setSidebarOpen(false);
            }}
            className={cn(
                'group flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition',
                c.id === activeId
                  ? 'bg-[#e7eee6] text-[#294637]'
                  : 'text-[#666962] hover:bg-[#f0f0ec]'
              )}
            >
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.title}</div>
                <div className="text-[10px] text-[#96978f]">{formatRelative(c.updatedAt)}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c.id);
                  if (activeId === c.id) setActiveId(null);
                }}
                className="p-1 text-[#96978f] opacity-0 hover:text-rose-600 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[#ecece8] px-4 py-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg bg-[#f0f0ec] p-1.5 text-[#555851] hover:bg-[#e4e4de]"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
        <button
          onClick={handleNew}
          className="rounded-lg bg-[#f0f0ec] p-1.5 text-[#555851] hover:bg-[#e4e4de] sm:hidden"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold tracking-[-.02em] text-[#22231f]">
            {activeChat?.title || 'Ask Atlas'}
          </h1>
          <p className="hidden text-xs text-[#96978f] sm:block">Answers grounded in your workspace documents only</p>
        </div>
        <Badge color="indigo" className="hidden shrink-0 sm:inline-flex">RAG · local embeddings</Badge>
    </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
          {(!activeChat || activeChat.messages.length === 0) && !loading && (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#dfeedd] text-[#416a42]">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-[-.03em] text-[#22231f]">
                Ask your knowledge base
              </h2>
              <p className="mb-6 max-w-md text-sm text-[#74766f]">
                I'll retrieve relevant chunks from your documents and answer with citations. I won't
                invent facts that aren't in them.
              </p>
              <div className="flex max-w-lg flex-wrap justify-center gap-2">
                {(workspaceDocs.length > 0
                  ? [
                      `Summarize ${workspaceDocs[0].name}`,
                      workspaceDocs[1]
                        ? `Compare ${workspaceDocs[0].name} and ${workspaceDocs[1].name}`
                        : `What's covered in ${workspaceDocs[0].name}?`,
                      'What documents do I have access to?',
                    ]
                  : ['Upload a document to get started']
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-[#e4e5df] bg-[#fcfcfb] px-3 py-1.5 text-xs text-[#555851] transition hover:border-[#d8e3d8] hover:bg-[#f4f8f2]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {activeChat?.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dfeedd] text-[#416a42]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={cn('max-w-[85%] space-y-2 sm:max-w-[75%]')}>
                  <div
                    className={cn(
                      'whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-br-md bg-[#e7eee6] text-[#294637]'
                        : 'rounded-2xl rounded-tl-md border border-[#e7e7e2] bg-[#fcfcfb] text-[#555851]'
                    )}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {renderMarkdownLite(line)}
                      </span>
                    ))}
                  </div>

                  {msg.role === 'assistant' && msg.confidence != null && (
                    <ConfidenceBar value={msg.confidence} />
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#96978f]">
                        Sources
                      </p>
                      {msg.citations.map((c) => (
                        <div
                          key={c.chunkId}
                          className="overflow-hidden rounded-xl border border-[#e7e7e2] bg-white"
                        >
                          <button
                            onClick={() =>
                              setExpandedCite(expandedCite === c.chunkId ? null : c.chunkId)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#fafaf8]"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 text-[#385847]" />
                            <span className="flex-1 truncate text-xs text-[#555851]">
                              {c.documentName}
                              {c.page != null && (
                                <span className="text-[#96978f]"> · p.{c.page}</span>
                              )}
                            </span>
                            <Badge color="slate">{Math.round(c.score * 100)}%</Badge>
                            {expandedCite === c.chunkId ? (
                              <ChevronUp className="h-3 w-3 text-[#96978f]" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-[#96978f]" />
                            )}
                          </button>
                          {expandedCite === c.chunkId && (
                            <div className="border-t border-[#ecece8] px-3 pb-3 pt-2 text-xs leading-relaxed text-[#74766f]">
                              {c.excerpt}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#dfeedd] text-[#416a42]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-md border border-[#e7e7e2] bg-[#fcfcfb] px-4 py-3 text-sm text-[#74766f]">
                Retrieving chunks & generating answer…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[#ecece8] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="mx-auto flex max-w-3xl gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents…"
              className="flex-1 rounded-lg border border-[#e4e5df] bg-[#fcfcfb] px-4 py-3 text-sm text-[#20211f] outline-none placeholder:text-[#999b94] focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
