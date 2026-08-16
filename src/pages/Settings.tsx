import { useState } from 'react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { RefreshCw, Shield, Database, Key, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';



export function Settings() {
  const { currentUser, currentWorkspace, currentRole, resetDemo, state, updateWorkspace, updateProfile, deleteAccount } = useStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(currentWorkspace?.description || '');
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSaving(true);
    const res = await updateProfile(profileName.trim());
    setProfileSaving(false);
    if (!res.ok) {
      setProfileError(res.error || 'Failed to save');
      return;
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };
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

  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleting(true);
    const res = await deleteAccount();
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(res.error || 'Failed to delete account');
      return;
    }
    navigate('/login');
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
          <Input
            label="Display name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <Input label="Email" defaultValue={currentUser?.email} disabled />
        </div>
        <div className="flex items-center justify-end gap-3">
          {profileError && <span className="text-xs text-red-600">{profileError}</span>}
          <Button
            size="sm"
            onClick={handleSaveProfile}
            disabled={profileSaving || profileName.trim() === currentUser?.name}
          >
            {profileSaving ? 'Saving…' : profileSaved ? 'Saved!' : 'Save changes'}
          </Button>
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

      <Card className="border-red-200 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-red-700">Delete account</h2>
            <p className="mt-1 text-xs text-[#96978f]">
              Permanently delete your account and everything tied to it. This can't be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete my account
          </Button>
        </div>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirmText('');
          setDeleteError('');
        }}
        title="Delete your account"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#74766f]">
            This permanently deletes your account, your conversations, and any workspace you're
            the sole member of. If you own a workspace with other members, you'll need to
            transfer ownership or remove them first.
          </p>
          <div>
            <label className="text-xs font-medium text-[#74766f]">
              Type <span className="font-semibold text-red-700">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e4e5df] px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              placeholder="DELETE"
            />
          </div>
          {deleteError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              loading={deleting}
            >
              Permanently delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
