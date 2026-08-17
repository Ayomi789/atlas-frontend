import { useRef, useState } from 'react';
import { UserPlus, Shield, Trash2, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { formatDate } from '../lib/utils';
import type { Role } from '../types';

const roleColor: Record<Role, 'amber' | 'indigo' | 'cyan' | 'slate'> = {
  owner: 'amber',
  admin: 'indigo',
  member: 'cyan',
  viewer: 'slate',
};

function RoleSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: Role;
  onChange: (role: Role) => void;
  options: Role[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen((o) => !o);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#e4e5df] bg-white px-3 py-1.5 text-xs capitalize text-[#555851] transition hover:border-[#d8e3d8] focus:outline-none focus:ring-2 focus:ring-[#dce9dd]"
      >
        {value}
        <ChevronDown className={cn('h-3.5 w-3.5 text-[#96978f] transition', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            className="fixed z-50 min-w-[110px] overflow-hidden rounded-lg border border-[#e7e7e2] bg-white shadow-lg"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-xs capitalize transition',
                  opt === value ? 'bg-[#e7eee6] text-[#294637]' : 'text-[#555851] hover:bg-[#f7f7f5]'
                )}
              >
                {opt}
                {opt === value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Team() {
  const {
    workspaceMembers,
    currentRole,
    inviteMember,
    updateMemberRole,
    removeMember,
    currentUser,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [error, setError] = useState('');

  const canManage = currentRole === 'owner' || currentRole === 'admin';

  const handleInvite = async () => {
    setError('');
    const res = await inviteMember(email.trim(), role);
    if (!res.ok) setError(res.error || 'Failed');
    else {
      setOpen(false);
      setEmail('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.04em] text-[#22231f]">Team</h1>
          <p className="mt-1 text-sm text-[#74766f]">Manage members and role-based access</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite member
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(['owner', 'admin', 'member', 'viewer'] as Role[]).map((r) => (
          <Card key={r} className="p-4">
            <div className="text-[25px] font-semibold tracking-[-.045em] text-[#22231f]">
              {workspaceMembers.filter((m) => m.role === r).length}
            </div>
            <div className="text-sm capitalize text-[#74766f]">{r}s</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ecece8] text-left text-xs uppercase tracking-wider text-[#96978f]">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaceMembers.map((m) => (
                <tr key={m.id} className="border-b border-[#f3f3f0] hover:bg-[#fafaf8]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d9e9d4] text-xs font-bold text-[#43633c]">
                        {m.user.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-[#22231f]">
                          {m.user.name}
                          {m.user.id === currentUser?.id && (
                            <span className="font-normal text-[#96978f]"> (you)</span>
                          )}
                        </div>
                        <div className="text-xs text-[#96978f]">{m.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {canManage && m.role !== 'owner' ? (
                      <RoleSelect
                        value={m.role}
                        onChange={(role) => updateMemberRole(m.id, role)}
                        options={['admin', 'member', 'viewer']}
                        className="w-28"
                      />
                    ) : (
                      <Badge color={roleColor[m.role]}>
                        <Shield className="h-3 w-3" /> {m.role}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#74766f]">{formatDate(m.joinedAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {canManage && m.role !== 'owner' && m.user.id !== currentUser?.id && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="rounded-lg p-1.5 text-[#96978f] hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-semibold text-[#22231f]">Role permissions</h3>
        <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {[
            { role: 'Owner', perms: 'Full control, billing, delete workspace' },
            { role: 'Admin', perms: 'Manage members, docs, settings' },
            { role: 'Member', perms: 'Upload docs, chat, search' },
            { role: 'Viewer', perms: 'Read-only chat & search' },
          ].map((r) => (
            <div key={r.role} className="rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3">
              <div className="mb-1 font-medium text-[#555851]">{r.role}</div>
              <div className="text-[#96978f]">{r.perms}</div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Invite member">
        <div className="space-y-4">
          <p className="text-xs text-[#96978f]">User must already have an Atlas account.</p>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#555851]">Role</label>
            <RoleSelect value={role} onChange={setRole} options={['admin', 'member', 'viewer']} className="w-full" />
          </div>
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
