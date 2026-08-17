import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  Users,
  Settings,
  BarChart3,
  Plus,
  Clock3,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const primaryNav = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/search', label: 'Search', icon: Search },
  { to: '/app/chat', label: 'Ask Atlas', icon: Bot },
];

const workspaceNav = [
  { to: '/app/documents', label: 'Documents', icon: FileText },
  { to: '/app/team', label: 'Members', icon: Users },
  { to: '/app/admin', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { state, currentUser, currentWorkspace, setWorkspace, createWorkspace } = useStore();
  const userWorkspaces = state.workspaces;
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { open: boolean };
      setMobileOpen(detail.open);
    };
    window.addEventListener('kh-mobile-nav', handler);
    return () => window.removeEventListener('kh-mobile-nav', handler);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    window.dispatchEvent(new Event('kh-mobile-nav-close'));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createWorkspace(name.trim(), desc.trim());
    setName('');
    setDesc('');
    setCreateOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-[#e7eee6] text-[#294637]' : 'text-[#666962] hover:bg-[#f0f0ec]'
    );

  const navBody = (
    <>
      <nav className="space-y-1">
        {primaryNav.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.end}
            onClick={closeMobile}
            className={linkClass}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {userWorkspaces.length > 1 && (
          <>
            <p className="px-3 pb-2 pt-7 text-[11px] font-bold uppercase tracking-[.12em] text-[#96978f]">
              Switch workspace
            </p>
            {userWorkspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setWorkspace(w.id);
                  closeMobile();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition',
                  w.id === currentWorkspace?.id
                    ? 'bg-[#e7eee6] text-[#294637]'
                    : 'text-[#666962] hover:bg-[#f0f0ec]'
                )}
              >
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[9px] font-bold text-white"
                  style={{ background: w.color }}
                >
                  {w.name.charAt(0)}
                </span>
                <span className="truncate">{w.name}</span>
              </button>
            ))}
          </>
        )}

        <p className="px-3 pb-2 pt-7 text-[11px] font-bold uppercase tracking-[.12em] text-[#96978f]">
          Workspace
        </p>

        {workspaceNav.map((item) => (
          <NavLink key={item.to + item.label} to={item.to} onClick={closeMobile} className={linkClass}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        <Link
            to="/app#activity"
            onClick={closeMobile}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#666962] transition hover:bg-[#f0f0ec]"
        >
          <Clock3 size={18} /> Activity
        </Link>

        <button
          onClick={() => {
            closeMobile();
            window.dispatchEvent(new Event('kh-open-help'));
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#666962] transition hover:bg-[#f0f0ec]"
        >
          <HelpCircle size={18} /> Help center
        </button>

        <button
          onClick={() => setCreateOpen(true)}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#385847] hover:bg-[#f0f0ec]"
        >
          <Plus size={18} /> New workspace
        </button>
      </nav>

      <div className="mt-auto pt-6">
        <NavLink
          to="/app/settings"
          onClick={closeMobile}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
              isActive ? 'bg-[#e7eee6] text-[#294637]' : 'text-[#70736c] hover:bg-[#efefeb]'
            )
          }
        >
          <Settings size={18} /> Settings
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <aside className="fixed inset-x-0 top-[70px] z-40 max-h-[calc(100vh-70px)] overflow-y-auto border-b border-[#e8e8e3] bg-[#fafaf8] p-5 shadow-lg lg:hidden">
          <div className="flex min-h-[40vh] flex-col">{navBody}</div>
        </aside>
      )}

      <aside className="hidden w-[236px] shrink-0 border-r border-[#e8e8e3] lg:sticky lg:top-[70px] lg:flex lg:h-[calc(100vh-70px)] lg:flex-col lg:p-5">
        {navBody}
      </aside>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create workspace">
        <div className="space-y-4">
          <Input
            label="Workspace name"
            placeholder="Acme Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Team knowledge base"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
