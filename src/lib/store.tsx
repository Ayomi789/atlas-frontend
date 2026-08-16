import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Activity,
  AppNotification,
  AppState,
  AuthSession,
  ChatMessage,
  ChatSession,
  Document,
  Member,
  Role,
  User,
  Workspace,
} from '../types';
import { api, ApiError, clearToken, getToken, setToken } from './api';
import { mapDocument, mapMember, mapUser, mapWorkspace, resolveMimeType } from './mappers';

export interface SearchResultItem {
  id: string;
  content: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  score: number;
}

const ACTIVITIES_KEY = 'atlas_activities';
const CURRENT_WS_KEY = 'atlas_current_workspace';
const DOC_TAGS_KEY = 'atlas_doc_tags';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // fallback only, if the token can't be decoded

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
} // matches backend default JWT_EXPIRES_IN

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch {
    return [];
  }
}

function loadDocTags(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(DOC_TAGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function emptyState(): AppState {
  return {
    users: [],
    workspaces: [],
    members: [],
    documents: [],
    chunks: [],
    chats: [],
    activities: loadActivities(),
    notifications: [],
    session: null,
    currentWorkspaceId: localStorage.getItem(CURRENT_WS_KEY),
  };
}

interface StoreContextValue {
  state: AppState;
  initializing: boolean;
  currentUser: User | null;
  currentWorkspace: Workspace | null;
  currentRole: Role | null;
  workspaceDocs: Document[];
  workspaceMembers: (Member & { user: User })[];
  workspaceChats: ChatSession[];
  workspaceActivities: Activity[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ ok: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ ok: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setWorkspace: (id: string) => void;
  createWorkspace: (name: string, description: string) => Promise<Workspace | null>;
  updateWorkspace: (name: string, description: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (name: string) => Promise<{ ok: boolean; error?: string }>;
  uploadDocument: (file: File, textContent: string, tags?: string[]) => Promise<Document>;
  deleteDocument: (id: string) => void;
  askQuestion: (chatId: string | null, question: string) => Promise<ChatSession>;
  createChat: () => ChatSession;
  deleteChat: (id: string) => void;
  runWorkspaceSearch: (query: string) => Promise<{ keyword: SearchResultItem[]; semantic: SearchResultItem[] }>;
  inviteMember: (email: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  updateMemberRole: (memberId: string, role: Role) => void;
  removeMember: (memberId: string) => void;
  addActivity: (type: Activity['type'], message: string, meta?: Record<string, string>) => void;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetDemo: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  teamActivity: AppNotification[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [initializing, setInitializing] = useState(true);
  const [teamActivity, setTeamActivity] = useState<AppNotification[]>([]);
  const docTagsRef = useRef<Record<string, string[]>>(loadDocTags());

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(state.activities));
  }, [state.activities]);

  useEffect(() => {
    if (state.currentWorkspaceId) localStorage.setItem(CURRENT_WS_KEY, state.currentWorkspaceId);
  }, [state.currentWorkspaceId]);

  const currentUser = state.session?.user ?? null;
  const currentWorkspace =
    state.workspaces.find((w) => w.id === state.currentWorkspaceId) ?? null;

  const currentRole = useMemo(() => {
    if (!currentUser || !currentWorkspace) return null;
    return (
      state.members.find(
        (m) => m.userId === currentUser.id && m.workspaceId === currentWorkspace.id
      )?.role ?? null
    );
  }, [currentUser, currentWorkspace, state.members]);

  const workspaceDocs = useMemo(
    () =>
      state.documents
        .filter((d) => d.workspaceId === state.currentWorkspaceId)
        .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)),
    [state.documents, state.currentWorkspaceId]
  );

  const workspaceMembers = useMemo(() => {
    return state.members
      .filter((m) => m.workspaceId === state.currentWorkspaceId)
      .map((m) => {
        const user = state.users.find((u) => u.id === m.userId)!;
        return { ...m, user };
      })
      .filter((m) => m.user);
  }, [state.members, state.users, state.currentWorkspaceId]);

  const workspaceChats = useMemo(
    () =>
      state.chats
        .filter((c) => c.workspaceId === state.currentWorkspaceId)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [state.chats, state.currentWorkspaceId]
  );

  const workspaceActivities = useMemo(
      () =>
        state.activities
          .filter((a) => a.workspaceId === state.currentWorkspaceId)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      [state.activities, state.currentWorkspaceId]
    );

  const unreadNotificationCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  function addActivity(type: Activity['type'], message: string, meta?: Record<string, string>) {
    setState((s) => {
      if (!s.session || !s.currentWorkspaceId) return s;
      const activity: Activity = {
        id: uid('act'),
        workspaceId: s.currentWorkspaceId,
        userId: s.session.user.id,
        userName: s.session.user.name,
        type,
        message,
        createdAt: new Date().toISOString(),
        meta,
      };
      return { ...s, activities: [activity, ...s.activities].slice(0, 300) };
    });
  }

  // ---------------- data loading ----------------

  async function loadMembers(workspaceId: string) {
    try {
      const members = await api.get<Parameters<typeof mapMember>[0][]>(
        `/api/workspaces/${workspaceId}/members`
      );
      const mapped = members.map(mapMember);
      setState((s) => {
        const otherMembers = s.members.filter((m) => m.workspaceId !== workspaceId);
        const otherUsers = s.users.filter((u) => !mapped.some((m) => m.user.id === u.id));
        return {
          ...s,
          members: [...otherMembers, ...mapped.map(({ user: _user, ...m }) => m)],
          users: [...otherUsers, ...mapped.map((m) => m.user)],
        };
      });
    } catch {
      /* non-fatal: member list is best-effort */
    }
  }

  async function loadDocuments(workspaceId: string) {
    try {
      const docs = await api.get<Parameters<typeof mapDocument>[0][]>(
        `/api/documents/workspace/${workspaceId}`
      );
      const mapped = docs.map((d) => mapDocument(d, docTagsRef.current[d.id] || []));
      setState((s) => ({
        ...s,
        documents: [...s.documents.filter((d) => d.workspaceId !== workspaceId), ...mapped],
      }));
    } catch {
      /* non-fatal */
    }
  }

  async function loadChats(workspaceId: string, userId: string) {
    try {
      const list = await api.get<{ id: string }[]>('/api/conversations');
      const detailed = await Promise.all(
        list.map((c) =>
          api
            .get<{
              id: string;
              title: string;
              createdAt: string;
              updatedAt: string;
              messages: { id: string; role: string; content: string; createdAt: string }[];
            }>(`/api/conversations/${c.id}`)
            .catch(() => null)
        )
      );
      const mapped: ChatSession[] = detailed
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => ({
          id: c.id,
          workspaceId,
          title: c.title,
          messages: c.messages.map((m) => ({
            id: m.id,
            role: m.role as ChatMessage['role'],
            content: m.content,
            createdAt: m.createdAt,
          })),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          userId,
        }));
      setState((s) => ({
        ...s,
        chats: [
          ...s.chats.filter((c) => c.workspaceId !== workspaceId || c.id.startsWith('draft-')),
          ...mapped,
        ],
      }));
    } catch {
      /* non-fatal */
    }
  }

  async function loadTeamActivity(workspaceId: string) {
    try {
      const list = await api.get<AppNotification[]>(`/api/workspaces/${workspaceId}/activity`);
      setTeamActivity(list);
    } catch {
      /* non-fatal */
    }
  }

  async function loadWorkspaceData(workspaceId: string, userId: string) {
    await Promise.all([
      loadMembers(workspaceId),
      loadDocuments(workspaceId),
      loadChats(workspaceId, userId),
      loadTeamActivity(workspaceId),
    ]);
  }

  async function loadNotifications() {
    try {
      const list = await api.get<AppNotification[]>('/api/notifications');
      setState((s) => ({ ...s, notifications: list }));
    } catch {
      /* non-fatal */
    }
  }

  async function markNotificationRead(id: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {
      /* best effort; UI already reflects the change */
    }
  }

  async function markAllNotificationsRead() {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    try {
      await api.patch('/api/notifications/read-all');
    } catch {
      /* best effort */
    }
  }

  async function hydrateWorkspaces(userId: string) {
    try {
      const list = await api.get<Parameters<typeof mapWorkspace>[0][]>('/api/workspaces');
      let workspaces = list.map(mapWorkspace);

      if (workspaces.length === 0) {
        const created = await api.post<Parameters<typeof mapWorkspace>[0]>('/api/workspaces', {
          name: 'My Workspace',
          description: 'Your personal knowledge hub',
        });
        workspaces = [mapWorkspace(created)];
      }

      const preferred = localStorage.getItem(CURRENT_WS_KEY);
      const target = workspaces.find((w) => w.id === preferred)?.id ?? workspaces[0]?.id ?? null;

      setState((s) => ({ ...s, workspaces, currentWorkspaceId: target }));

      if (target) await loadWorkspaceData(target, userId);
    } catch {
      /* leave workspaces empty; UI will show empty state */
    }
  }

  // ---------------- auth ----------------

  async function login(email: string, password: string) {
    try {
      const data = await api.post<{ token: string; user: Parameters<typeof mapUser>[0] }>(
        '/api/auth/login',
        { email, password }
      );
      setToken(data.token);
      const mappedUser = mapUser(data.user);
      const session: AuthSession = {
        user: mappedUser,
        token: data.token,
        expiresAt: decodeJwtExpiry(data.token) ?? Date.now() + TOKEN_TTL_MS,
      };
      setState((s) => ({
        ...s,
        session,
        users: [mappedUser, ...s.users.filter((u) => u.id !== mappedUser.id)],
      }));
      await hydrateWorkspaces(mappedUser.id);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Login failed' };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      await api.post('/api/auth/register', { name, email, password });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Registration failed' };
    }
  }

  async function verifyEmail(token: string) {
    try {
      await api.post('/api/auth/verify-email', { token });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Verification failed' };
    }
  }

  async function resendVerification(email: string) {
    try {
      await api.post('/api/auth/resend-verification', { email });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Something went wrong' };
    }
  }

  async function forgotPassword(email: string) {
    try {
      await api.post('/api/auth/forgot-password', { email });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Something went wrong' };
    }
  }

  async function resetPassword(token: string, password: string) {
    try {
      await api.post('/api/auth/reset-password', { token, password });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Reset failed' };
    }
  }

  function logout() {
    clearToken();
    localStorage.removeItem(CURRENT_WS_KEY);
    setState(emptyState);
  }

  function setWorkspace(id: string) {
    setState((s) => ({ ...s, currentWorkspaceId: id }));
    if (currentUser) void loadWorkspaceData(id, currentUser.id);
  }

  async function createWorkspace(name: string, description: string): Promise<Workspace | null> {
    try {
      const created = await api.post<Parameters<typeof mapWorkspace>[0]>('/api/workspaces', {
        name,
        description,
      });
      const mapped = mapWorkspace(created);
      setState((s) => ({
        ...s,
        workspaces: [mapped, ...s.workspaces],
        currentWorkspaceId: mapped.id,
      }));
      if (currentUser) await loadWorkspaceData(mapped.id, currentUser.id);
      return mapped;
    } catch {
      return null;
    }
  }

  async function updateProfile(name: string) {
    try {
      const updated = await api.patch<{ id: string; name: string; email: string; avatar: string | null }>(
        '/api/auth/me',
        { name }
      );
      setState((s) => ({
        ...s,
        session: s.session ? { ...s.session, user: { ...s.session.user, name: updated.name } } : s.session,
        users: s.users.map((u) => (u.id === updated.id ? { ...u, name: updated.name } : u)),
      }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Failed to update profile' };
    }
  }

  async function updateWorkspace(name: string, description: string) {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) return { ok: false, error: 'No active workspace' };
    try {
      const updated = await api.patch<Parameters<typeof mapWorkspace>[0]>(
        `/api/workspaces/${workspaceId}`,
        { name, description }
      );
      const mapped = mapWorkspace(updated);
      setState((s) => ({
        ...s,
        workspaces: s.workspaces.map((w) =>
          w.id === mapped.id ? { ...mapped, ownerId: w.ownerId || mapped.ownerId } : w
        ),
      }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Failed to update workspace' };
    }
  }

  // ---------------- documents ----------------

  async function uploadDocument(file: File, _textContent: string, tags: string[] = []) {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) throw new Error('No active workspace');

    const storageKey = `${workspaceId}/${uid('doc')}-${file.name}`;
    const mimeType = resolveMimeType(file);

    const created = await api.post<Parameters<typeof mapDocument>[0]>('/api/documents', {
      name: file.name,
      storageKey,
      mimeType,
      size: file.size,
      workspaceId,
    });

    let doc = mapDocument(created, tags);
    setState((s) => ({ ...s, documents: [doc, ...s.documents] }));
    addActivity('upload', `uploaded ${file.name}`);

    try {
      const uploaded = await api.upload<Parameters<typeof mapDocument>[0]>(
        `/api/documents/${created.id}/upload`,
        file
      );
      doc = mapDocument(uploaded, tags);
      if (tags.length) {
        docTagsRef.current[doc.id] = tags;
        localStorage.setItem(DOC_TAGS_KEY, JSON.stringify(docTagsRef.current));
      }
      setState((s) => ({ ...s, documents: s.documents.map((d) => (d.id === doc.id ? doc : d)) }));
    } catch (e) {
      console.error('Document processing failed:', e instanceof ApiError ? e.message : e);
      setState((s) => ({
        ...s,
        documents: s.documents.map((d) => (d.id === created.id ? { ...d, status: 'error' } : d)),
      }));
    }

    return doc;
  }

  async function deleteDocument(id: string) {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }));
    delete docTagsRef.current[id];
    localStorage.setItem(DOC_TAGS_KEY, JSON.stringify(docTagsRef.current));
    try {
      await api.delete(`/api/documents/${id}`);
      addActivity('delete', 'deleted a document');
    } catch {
      /* already removed locally; best effort */
    }
  }

  // ---------------- chat ----------------

  function createChat(): ChatSession {
    const chat: ChatSession = {
      id: uid('draft'),
      workspaceId: state.currentWorkspaceId || '',
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser?.id || '',
    };
    setState((s) => ({ ...s, chats: [chat, ...s.chats] }));
    return chat;
  }

function deleteChat(id: string) {
    setState((s) => ({ ...s, chats: s.chats.filter((c) => c.id !== id) }));
    if (!id.startsWith('draft-')) {
      void api.delete(`/api/conversations/${id}`).catch(() => {});
    }
  }

  async function runWorkspaceSearch(
    query: string
  ): Promise<{ keyword: SearchResultItem[]; semantic: SearchResultItem[] }> {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) return { keyword: [], semantic: [] };
    try {
      const result = await api.get<{
        semantic: (Omit<SearchResultItem, 'score'> & { similarity: number })[];
        keyword: (Omit<SearchResultItem, 'score'> & { rank: number })[];
      }>(`/api/search?workspaceId=${encodeURIComponent(workspaceId)}&query=${encodeURIComponent(query)}`);

      return {
        semantic: result.semantic.map((r) => ({ ...r, score: r.similarity })),
        keyword: result.keyword.map((r) => ({ ...r, score: r.rank })),
      };
    } catch (e) {
      console.error('Search failed:', e instanceof ApiError ? e.message : e);
      return { keyword: [], semantic: [] };
    }
  }
  async function askQuestion(chatId: string | null, question: string): Promise<ChatSession> {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) throw new Error('No active workspace');

    const activeId = chatId ?? createChat().id;
    const isDraft = activeId.startsWith('draft-');

    const userMsg: ChatMessage = {
      id: uid('msg'),
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length === 0 ? question.slice(0, 48) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    }));
    addActivity('chat', `asked "${question.slice(0, 60)}${question.length > 60 ? '…' : ''}"`);

    const docs = state.documents;

    try {
      const result = await api.post<{
        conversationId: string;
        answer: string;
        sources: { id: string; content: string; documentId: string; similarity: number }[];
      }>('/api/chat', {
        workspaceId,
        question,
        conversationId: isDraft ? undefined : activeId,
      });

      const citations = result.sources.map((src) => ({
        documentId: src.documentId,
        documentName: docs.find((d) => d.id === src.documentId)?.name || 'Document',
        chunkId: src.id,
        excerpt: src.content.slice(0, 300),
        score: src.similarity,
      }));
      const confidence = result.sources.length
        ? result.sources.reduce((sum, s) => sum + s.similarity, 0) / result.sources.length
        : undefined;

      const assistantMsg: ChatMessage = {
        id: uid('msg'),
        role: 'assistant',
        content: result.answer,
        citations,
        confidence,
        createdAt: new Date().toISOString(),
      };

      let finalChat: ChatSession | null = null;
      setState((s) => {
        const existing = s.chats.find((c) => c.id === activeId);
        const merged: ChatSession = {
          id: result.conversationId,
          workspaceId,
          title: existing?.title || question.slice(0, 48),
          messages: [...(existing?.messages ?? [userMsg]), assistantMsg],
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: currentUser?.id || '',
        };
        finalChat = merged;
        return { ...s, chats: [merged, ...s.chats.filter((c) => c.id !== activeId)] };
      });
      return finalChat!;
    } catch (e) {
      const errMsg: ChatMessage = {
        id: uid('msg'),
        role: 'assistant',
        content:
          e instanceof ApiError ? e.message : 'Something went wrong answering that question.',
        createdAt: new Date().toISOString(),
      };
      let finalChat: ChatSession | null = null;
      setState((s) => ({
        ...s,
        chats: s.chats.map((c) => {
          if (c.id !== activeId) return c;
          const merged = { ...c, messages: [...c.messages, errMsg], updatedAt: new Date().toISOString() };
          finalChat = merged;
          return merged;
        }),
      }));
      if (finalChat) return finalChat;
      throw e;
    }
  }

  // ---------------- members ----------------

  async function inviteMember(email: string, role: Role) {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) return { ok: false, error: 'No active workspace' };
    try {
      const created = await api.post<Parameters<typeof mapMember>[0]>(
        `/api/workspaces/${workspaceId}/members`,
        { email, role }
      );
      const mapped = mapMember(created);
      setState((s) => ({
        ...s,
        members: [
          ...s.members,
          { id: mapped.id, userId: mapped.userId, workspaceId: mapped.workspaceId, role: mapped.role, joinedAt: mapped.joinedAt },
        ],
        users: s.users.some((u) => u.id === mapped.user.id) ? s.users : [...s.users, mapped.user],
      }));
      addActivity('member_join', `invited ${mapped.user.name} as ${role}`);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Failed to invite member' };
    }
  }

  async function updateMemberRole(memberId: string, role: Role) {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) return;
    setState((s) => ({ ...s, members: s.members.map((m) => (m.id === memberId ? { ...m, role } : m)) }));
    try {
      await api.patch(`/api/workspaces/${workspaceId}/members/${memberId}`, { role });
    } catch {
      /* best effort; UI already reflects the change */
    }
  }

  async function removeMember(memberId: string) {
    const workspaceId = state.currentWorkspaceId;
    if (!workspaceId) return;
    setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== memberId) }));
    try {
      await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
    } catch {
      /* best effort */
    }
  }

  async function deleteAccount() {
    try {
      await api.delete('/api/auth/me');
      clearToken();
      setState(emptyState);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Failed to delete account' };
    }
  }

  async function resetDemo() {
    if (state.currentWorkspaceId && currentUser) {
      await loadWorkspaceData(state.currentWorkspaceId, currentUser.id);
    }
  }

  // ---------------- boot: restore session from stored token ----------------

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    (async () => {
      try {
        const me = await api.get<Parameters<typeof mapUser>[0]>('/api/auth/me');
        const mappedUser = mapUser(me);

        const session: AuthSession = {
          user: mappedUser,
          token,
          expiresAt: decodeJwtExpiry(token) ?? Date.now() + TOKEN_TTL_MS,
        };
        setState((s) => ({
          ...s,
          session,
          users: [mappedUser, ...s.users.filter((u) => u.id !== mappedUser.id)],
        }));
        await hydrateWorkspaces(mappedUser.id);
      } catch {
        clearToken();
      } finally {
        setInitializing(false);
      }
    })();


// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.session) return;
    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session?.user.id]);

  const value: StoreContextValue = {
    state,
    initializing,
    currentUser,
    currentWorkspace,
    currentRole,
    workspaceDocs,
    workspaceMembers,
    workspaceChats,
    workspaceActivities,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    setWorkspace,
    createWorkspace,
    uploadDocument,
    updateWorkspace,
    updateProfile,
    deleteDocument,
    askQuestion,
    createChat,
    deleteChat,
    runWorkspaceSearch,
    inviteMember,
    updateMemberRole,
    removeMember,
    addActivity,
    notifications: state.notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemo,
    deleteAccount,
    teamActivity,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
