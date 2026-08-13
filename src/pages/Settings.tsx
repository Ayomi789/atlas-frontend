import { useState } from 'react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { RefreshCw, Shield, Database, Key, Sparkles } from 'lucide-react';

export function Settings() {
  const { currentUser, currentWorkspace, currentRole, resetDemo, state, updateWorkspace } = useStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(currentWorkspace?.description || '');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    const res = await updateWorkspace(wsName.trim(), wsDesc.trim());
    setSaving(false);
    if (!res.ok) {
      setSaveError(res.error || 'Failed to save');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await resetDemo();
    setRefreshing(false);
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-.04em] text-[#22231f]">Settings</h1>
        <p className="mt-1 text-sm text-[#74766f]">Workspace preferences and account</p>
      </div>

      <Card className="space-y-4 p-5">
        <div className="mb-1 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#385847]" />
          <h2 className="font-semibold text-[#22231f]">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d9e9d4] text-lg font-bold text-[#43633c]">
            {currentUser?.avatar}
          </div>
          <div>
            <div className="font-medium text-[#22231f]">{currentUser?.name}</div>
            <div className="text-sm text-[#74766f]">{currentUser?.email}</div>
            <Badge color="indigo" className="mt-1">
              {currentRole}
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Input label="Display name" defaultValue={currentUser?.name} />
          <Input label="Email" defaultValue={currentUser?.email} disabled />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#277998]" />
          <h2 className="font-semibold text-[#22231f]">Workspace</h2>
        </div>
        <Input label="Name" value={wsName} onChange={(e) => setWsName(e.target.value)} />
        <Input label="Description" value={wsDesc} onChange={(e) => setWsDesc(e.target.value)} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#74766f]">Workspace ID</span>
          <code className="rounded-lg bg-[#f3f3f0] px-2 py-1 text-xs text-[#555851]">
            {currentWorkspace?.id}
          </code>
        </div>
        <div className="flex items-center justify-end gap-3">
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-[#bd7119]" />
          <h2 className="font-semibold text-[#22231f]">Auth & security</h2>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-[#ecece8] py-2">
            <span className="text-[#74766f]">Access token</span>
            <code className="max-w-[200px] truncate text-xs text-[#385847]">
              {state.session?.token.slice(0, 28)}…
            </code>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#74766f]">Token expiry</span>
            <span className="text-[#555851]">
              {state.session ? new Date(state.session.expiresAt).toLocaleString() : '—'}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#96978f]">
          A signed JWT is issued on login and sent as a Bearer token on every request. There's no
          refresh-token flow yet — once this expires, you'll need to log in again.
        </p>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#7657c7]" />
          <h2 className="font-semibold text-[#22231f]">AI pipeline</h2>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            { k: 'Embeddings', v: 'Google Gemini' },
            { k: 'Vector store', v: 'Postgres + pgvector (Supabase)' },
            { k: 'Chunk size', v: '~1000 chars, no overlap' },
            { k: 'Retrieval', v: 'Cosine similarity (pgvector)' },
          ].map((row) => (
            <div key={row.k} className="rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3">
              <div className="mb-0.5 text-xs text-[#96978f]">{row.k}</div>
              <div className="text-[#555851]">{row.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[#22231f]">Refresh workspace data</h2>
            <p className="mt-1 text-xs text-[#96978f]">
              Re-fetch documents, chats, and members from the server
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw className="h-4 w-4" /> {refreshed ? 'Refreshed!' : 'Refresh'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
