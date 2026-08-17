
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronDown,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn, formatRelative } from '../../lib/utils';
import { Modal } from '../ui/Modal';

export function TopBar() {
  const {
    currentUser,
    currentWorkspace,
    state,
    setWorkspace,
    logout,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useStore();
  const navigate = useNavigate();
  const [wsOpen, setWsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  
  const userWorkspaces = state.workspaces;

  const notify = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2600);
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('kh-mobile-nav', { detail: { open: mobileNav } }));
  }, [mobileNav]);

  useEffect(() => {
    const close = () => setMobileNav(false);
    window.addEventListener('kh-mobile-nav-close', close);
    return () => window.removeEventListener('kh-mobile-nav-close', close);
  }, []);

  useEffect(() => {
  const openHelp = () => setHelpOpen(true);
  window.addEventListener('kh-open-help', openHelp);
  return () => window.removeEventListener('kh-open-help', openHelp);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#e8e8e3] bg-[#fafaf8]/90 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center px-5 lg:px-8">
          <button
            className="mr-3 rounded-lg p-2 text-[#74766f] hover:bg-[#eeeeea] lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle menu"
          >
            {mobileNav ? <X size={21} /> : <Menu size={21} />}
          </button>

          <Link to="/app" className="flex items-center gap-2.5 font-semibold tracking-[-.03em]">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#243e31] text-white">
              <BookOpen size={17} />
            </span>
            <span className="text-[18px] text-[#20211f]">Atlas</span>
          </Link>

          <div className="ml-5 hidden h-5 w-px bg-[#deded9] sm:block" />

          <div className="relative ml-5 hidden sm:block">
            <button
              onClick={() => setWsOpen(!wsOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-[#5f615b] hover:text-[#294637]"
            >
              {currentWorkspace?.name || 'Workspace'}
              <ChevronDown size={15} className={cn('transition', wsOpen && 'rotate-180')} />
            </button>
            {wsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setWsOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[#e7e7e2] bg-white shadow-lg">
                  {userWorkspaces.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setWorkspace(w.id);
                        setWsOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[#f4f8f2]',
                        w.id === currentWorkspace?.id && 'bg-[#e7eee6] font-medium text-[#294637]'
                      )}
                    >
                      <span
                        className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white"
                        style={{ background: w.color }}
                      >
                        {w.name.charAt(0)}
                      </span>
                      {w.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-[#70736c] hover:bg-[#eeeeea]"
                title="Notifications"
              >
                <Bell size={19} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#bd2020] px-1 text-[10px] font-bold text-white">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-[#e7e7e2] bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#ecece8] px-4 py-3">
                      <h3 className="text-sm font-semibold text-[#22231f]">Notifications</h3>
                      <div className="flex items-center gap-3">
                        {unreadNotificationCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsRead()}
                            className="text-xs font-medium text-[#385847] hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => clearAllNotifications()}
                            className="text-xs font-medium text-[#96978f] hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-[#96978f]">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.read && markNotificationRead(n.id)}
                            className={cn(
                              'flex w-full flex-col gap-0.5 border-b border-[#f2f2ef] px-4 py-3 text-left last:border-0 hover:bg-[#f7f7f5]',
                              !n.read && 'bg-[#f4f8f2]'
                            )}
                          >
                            <span className="text-sm text-[#22231f]">{n.message}</span>
                            <span className="text-xs text-[#96978f]">{formatRelative(n.createdAt)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setHelpOpen(true)}
              className="hidden rounded-lg p-2 text-[#70736c] hover:bg-[#eeeeea] sm:block"
              title="Help"
            >
              <HelpCircle size={19} />
            </button>
            <span className="hidden h-6 w-px bg-[#deded9] sm:block" />

            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-[#eeeeea]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9e9d4] text-[10px] font-bold text-[#43633c]">
                  {currentUser?.avatar || 'U'}
                </span>
                <ChevronDown className="hidden text-[#74766f] sm:block" size={15} />
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#e7e7e2] bg-white shadow-lg">
                    <div className="border-b border-[#ecece8] px-3 py-2.5">
                      <p className="text-sm font-medium text-[#22231f]">{currentUser?.name}</p>
                      <p className="truncate text-[11px] text-[#85877f]">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        navigate('/app/settings');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#555851] hover:bg-[#f4f8f2]"
                    >
                      <Settings size={15} /> Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#b91c1c] hover:bg-[#fef2f2]"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div
          className="fixed inset-0 z-30 bg-[#182019]/25 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#263c30] px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          {notice}
        </div>
      )}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help center" wide>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f4f8f2] text-[#385847]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#22231f]">Uploading documents</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#74766f]">
                Drop in a PDF, TXT, DOCX, or Markdown file (up to 10MB) from the Documents page.
                Each file is automatically split into chunks and embedded so it can be searched and
                cited in chat answers.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e7eee6] text-[#294637]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#22231f]">Asking questions</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#74766f]">
                Answers in the chat are grounded only in documents uploaded to your current
                workspace. Each answer shows its source chunks and a confidence score based on
                retrieval similarity.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-[#e7e7e2] bg-[#fcfcfb] p-3.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fff4e7] text-[#bd7119]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#22231f]">Team & roles</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#74766f]">
                Invite teammates from the Team page. Owners and admins can manage members and change
                roles; members can upload and chat; viewers get read-only access.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#96978f]">
            Still stuck?{' '}
            <a href="mailto:support@knowhub.app" className="font-medium text-[#385847] hover:underline">
              support@knowhub.app
            </a>
          </p>
        </div>
      </Modal>
    </>
  );
}
