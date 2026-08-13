import type { DocType, Document as DocModel, Member, Role, User, Workspace } from '../types';

const PALETTE = ['#8b5cf6', '#294637', '#277998', '#bd7119', '#7657c7', '#4c7e38', '#b91c1c'];

export function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'workspace'
  );
}

export function initials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  );
}

export function docTypeFromFile(mimeType: string, name: string): DocType {
  if (mimeType === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    /\.docx?$/i.test(name)
  )
    return 'docx';
  if (mimeType === 'text/markdown' || /\.mdx?$/i.test(name)) return 'md';
  if (/\.(ts|tsx|js|jsx|py|json)$/i.test(name)) return 'code';
  return 'txt';
}

// Best-effort correction for browsers/files that report an empty or
// inconsistent MIME type — the backend only accepts a small allow-list.
export function resolveMimeType(file: File): string {
  if (file.type) {
    const allowed = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];
    if (allowed.includes(file.type)) return file.type;
  }
  if (/\.pdf$/i.test(file.name)) return 'application/pdf';
  if (/\.docx$/i.test(file.name))
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (/\.mdx?$/i.test(file.name)) return 'text/markdown';
  return 'text/plain';
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
}

export function mapUser(u: BackendUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar || initials(u.name),
    createdAt: u.createdAt || new Date().toISOString(),
  };
}

interface BackendWorkspace {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  members?: { userId: string; role: string }[];
}

export function mapWorkspace(w: BackendWorkspace): Workspace {
  const owner = w.members?.find((m) => m.role === 'owner');
  return {
    id: w.id,
    name: w.name,
    slug: slugify(w.name),
    description: w.description || '',
    ownerId: owner?.userId || '',
    createdAt: w.createdAt,
    color: colorFromId(w.id),
  };
}

interface BackendMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  user: BackendUser;
}

export function mapMember(m: BackendMember): Member & { user: User } {
  return {
    id: m.id,
    userId: m.userId,
    workspaceId: m.workspaceId,
    role: m.role as Role,
    joinedAt: new Date().toISOString(),
    user: mapUser(m.user),
  };
}

interface BackendDocument {
  id: string;
  workspaceId: string;
  name: string;
  mimeType: string;
  size: number;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  extractedText?: string | null;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
  _count?: { chunks: number };
}

const STATUS_MAP: Record<BackendDocument['status'], DocModel['status']> = {
  UPLOADING: 'processing',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'error',
};

export function mapDocument(d: BackendDocument, tags: string[] = []): DocModel {
  return {
    id: d.id,
    workspaceId: d.workspaceId,
    name: d.name,
    type: docTypeFromFile(d.mimeType, d.name),
    size: d.size,
    content: d.extractedText || '',
    uploadedBy: d.uploadedBy?.name || '',
    uploadedAt: d.createdAt,
    status: STATUS_MAP[d.status] ?? 'processing',
    chunkCount: d._count?.chunks ?? 0,
    tags,
  };
}