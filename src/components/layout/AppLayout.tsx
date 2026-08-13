import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const { currentUser, initializing } = useStore();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] text-sm text-[#74766f]">
        Loading…
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#20211f]">
      <TopBar />
      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-[1090px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
