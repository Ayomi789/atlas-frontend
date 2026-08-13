export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type DocType = 'pdf' | 'docx' | 'txt' | 'md' | 'code';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  createdAt: string;
  color: string;
}

export interface Member {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  joinedAt: string;
  user?: User;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  page?: number;
  index: number;
  embedding: number[];
}

export interface Document {
  id: string;
  workspaceId: string;
  name: string;
  type: DocType;
  size: number;
  content: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  chunkCount: number;
  tags: string[];
}

export interface Citation {
  documentId: string;
  documentName: string;
  chunkId: string;
  excerpt: string;
  page?: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: number;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Activity {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  type: 'upload' | 'chat' | 'member_join' | 'search' | 'delete' | 'settings';
  message: string;
  createdAt: string;
  meta?: Record<string, string>;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface AppNotification {
  id: string;
  workspaceId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  users: User[];
  workspaces: Workspace[];
  members: Member[];
  documents: Document[];
  chunks: DocumentChunk[];
  chats: ChatSession[];
  activities: Activity[];
  notifications: AppNotification[];
  session: AuthSession | null;
  currentWorkspaceId: string | null;
}
