import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Database, FileText, ArrowRightLeft } from 'lucide-react';
import { useStore, type SearchResultItem } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export function SearchPage() {
  const { workspaceDocs, currentWorkspace, runWorkspaceSearch } = useStore();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [mode, setMode] = useState<'both' | 'keyword' | 'semantic'>('both');
  const [loading, setLoading] = useState(false);
  const [keywordResults, setKeywordResults] = useState<SearchResultItem[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchResultItem[]>([]);

  const suggestions = workspaceDocs.slice(0, 4).map((d) => d.name.replace(/\.[^.]+$/, ''));

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setSubmitted(q);
    setLoading(true);
    const { keyword, semantic } = await runWorkspaceSearch(q.trim());
    setKeywordResults(keyword);
    setSemanticResults(semantic);
    setLoading(false);
  };

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    void performSearch(query);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-.04em] text-[#22231f]">Search</h1>
        <p className="mt-1 text-sm text-[#74766f]">
          Compare traditional keyword search vs semantic vector search in{' '}
          <span className="font-medium text-[#555851]">{currentWorkspace?.name}</span>
        </p>
      </div>

      <form onSubmit={runSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#979990]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your workspace documents…"
            className="w-full rounded-lg border border-[#e4e5df] bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#999b94] focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
          />
        </div>
        <Button type="submit" className="sm:px-6" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </form>

      <div className="flex gap-2">
        {(['both', 'keyword', 'semantic'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition',
              mode === m
                ? 'border-[#d8e3d8] bg-[#e7eee6] text-[#294637]'
                : 'border-[#e4e5df] text-[#74766f] hover:bg-[#f0f0ec]'
            )}
          >
            {m === 'both' ? 'Side by side' : m}
          </button>
        ))}
      </div>

      {!submitted && (
        <Card className="p-8 text-center">
          <ArrowRightLeft className="mx-auto mb-3 h-8 w-8 text-[#c4c5bf]" />
          <p className="text-sm text-[#74766f]">
            Run a query to see how keyword matching differs from embedding similarity.
          </p>
          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    void performSearch(q);
                  }}
                  className="rounded-full border border-[#e4e5df] px-3 py-1.5 text-xs text-[#74766f] hover:border-[#d8e3d8] hover:bg-[#f4f8f2] hover:text-[#294637]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {submitted && (
        <div className={cn('grid gap-4', mode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1')}>
          {(mode === 'both' || mode === 'keyword') && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4e7] text-[#bd7119]">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#22231f]">Keyword search</h2>
                    <p className="text-[11px] text-[#96978f]">Postgres full-text search (ts_rank)</p>
                  </div>
                  <Badge color="amber" className="ml-auto">
                    {keywordResults.length} hits
                  </Badge>
                </div>
                <div className="space-y-2">
                  {keywordResults.map((r) => (
                    <div key={r.id} className="rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-[#bd7119]" />
                        <span className="flex-1 truncate text-sm font-medium text-[#22231f]">
                          {r.documentName}
                        </span>
                        <Badge color="slate">rank {r.score.toFixed(2)}</Badge>
                      </div>
                      <p className="text-xs text-[#96978f]">Chunk #{r.chunkIndex}</p>
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#74766f]">
                        {r.content}
                      </p>
                    </div>
                  ))}
                  {!loading && keywordResults.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#96978f]">No keyword matches</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {(mode === 'both' || mode === 'semantic') && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7eee6] text-[#294637]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#22231f]">Semantic search</h2>
                    <p className="text-[11px] text-[#96978f]">Cosine similarity on chunk embeddings</p>
                  </div>
                  <Badge color="indigo" className="ml-auto">
                    {semanticResults.length} hits
                  </Badge>
                </div>
                <div className="space-y-2">
                  {semanticResults.map((r) => (
                    <div key={r.id} className="rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-[#385847]" />
                        <span className="flex-1 truncate text-sm font-medium text-[#22231f]">
                          {r.documentName}
                        </span>
                        <Badge color="violet">{Math.round(r.score * 100)}%</Badge>
                      </div>
                      <p className="text-xs text-[#96978f]">Chunk #{r.chunkIndex}</p>
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#74766f]">
                        {r.content}
                      </p>
                    </div>
                  ))}
                  {!loading && semanticResults.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#96978f]">No semantic matches</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}