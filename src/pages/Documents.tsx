import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  FileCode,
  File as FileIcon,
  Trash2,
  Search,
  Eye,
  X,
  Layers,
  Tag,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatBytes, formatRelative, cn } from '../lib/utils';
import type { Document } from '../types';

const typeIcon = {
  pdf: FileText,
  docx: FileText,
  txt: FileIcon,
  md: FileCode,
  code: FileCode,
};

const typeColor = {
  pdf: 'rose' as const,
  docx: 'indigo' as const,
  txt: 'slate' as const,
  md: 'cyan' as const,
  code: 'amber' as const,
};

export function Documents() {
  const { workspaceDocs, uploadDocument, deleteDocument, state } = useStore();
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Document | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteName, setPasteName] = useState('notes.md');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteTags, setPasteTags] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = workspaceDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.tags.some((t) => t.includes(query.toLowerCase()))
  );

  const readFile = async (file: File) => {
    setUploading(true);
    try {
      let text = '';
      if (
        file.type.startsWith('text/') ||
        /\.(md|txt|csv|json|ts|tsx|js|py|markdown)$/i.test(file.name)
      ) {
        text = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await file.text().catch(() => '');
        if (!text || text.includes('%PDF')) {
          text = `# ${file.name}\n\n[PDF binary uploaded — ${formatBytes(file.size)}]\n\nThis demo extracts plain text when available. For production, use pdf-parse or unpdf on the server.\n\nFilename: ${file.name}\nSize: ${formatBytes(file.size)}\nUploaded as knowledge document. Add a .txt or .md export for full RAG coverage in this demo.`;
        }
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        text = `# ${file.name}\n\n[Word document uploaded — ${formatBytes(file.size)}]\n\nIn production, mammoth.js or a server worker extracts DOCX text. Paste the text content via "Paste text" for full searchability in this demo.`;
      } else {
        text = await file.text().catch(
          () => `Uploaded file: ${file.name}\nSize: ${formatBytes(file.size)}`
        );
      }
      await uploadDocument(file, text);
    } finally {
      setUploading(false);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      await readFile(file);
    }
  };

  const handlePasteUpload = async () => {
    if (!pasteContent.trim()) return;
    setUploading(true);
    const file = new File([pasteContent], pasteName || 'document.md', { type: 'text/markdown' });
    const tags = pasteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await uploadDocument(file, pasteContent, tags);
    setPasteOpen(false);
    setPasteContent('');
    setPasteName('notes.md');
    setPasteTags('');
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.04em] text-[#22231f]">Documents</h1>
          <p className="mt-1 text-sm text-[#74766f]">
            Upload, chunk, embed, and index team knowledge
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPasteOpen(true)}>
            Paste text
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
            <Upload className="h-4 w-4" /> Upload files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.markdown,.ts,.tsx,.js,.py,.json"
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all',
          dragging
            ? 'border-[#789483] bg-[#f4f8f2]'
            : 'border-[#e4e5df] bg-white hover:border-[#cfd8cf] hover:bg-[#fcfcfb]'
        )}
      >
        <Upload
          className={cn('mx-auto mb-3 h-8 w-8', dragging ? 'text-[#385847]' : 'text-[#96978f]')}
        />
        <p className="text-sm font-medium text-[#555851]">Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-[#96978f]">
          PDF, DOCX, TXT, Markdown, code · auto chunk + embed
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#979990]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter documents…"
          className="w-full rounded-lg border border-[#e4e5df] bg-white py-2.5 pl-10 pr-4 text-sm text-[#20211f] outline-none placeholder:text-[#999b94] focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doc, i) => {
          const Icon = typeIcon[doc.type] || FileIcon;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="flex h-full flex-col p-4" hover>
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#e7e7e2] bg-[#f4f8f2] text-[#385847]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-[#22231f]">{doc.name}</h3>
                    <p className="mt-0.5 text-xs text-[#96978f]">
                      {formatBytes(doc.size)} · {formatRelative(doc.uploadedAt)}
                    </p>
                  </div>
                  <Badge
                    color={
                      doc.status === 'ready'
                        ? 'emerald'
                        : doc.status === 'processing'
                          ? 'amber'
                          : 'rose'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <Badge color={typeColor[doc.type]}>{doc.type.toUpperCase()}</Badge>
                  <Badge color="slate">
                    <Layers className="h-3 w-3" /> {doc.chunkCount} chunks
                  </Badge>
                  {doc.tags.map((t) => (
                    <Badge key={t} color="violet">
                      <Tag className="h-2.5 w-2.5" /> {t}
                    </Badge>
                  ))}
                </div>

                <p className="mb-4 line-clamp-2 flex-1 text-xs text-[#74766f]">
                  {doc.content.slice(0, 120)}…
                </p>

                <div className="flex items-center justify-between border-t border-[#ecece8] pt-3">
                  <span className="text-[11px] text-[#96978f]">By {doc.uploadedBy || 'Unknown'}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPreview(doc)}
                      className="rounded-lg p-1.5 text-[#74766f] hover:bg-[#f0f0ec] hover:text-[#294637]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${doc.name}?`)) deleteDocument(doc.id);
                      }}
                      className="rounded-lg p-1.5 text-[#74766f] hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-[#96978f]">No documents match your filter</div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name || ''} wide>
        {preview && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge color="emerald">{preview.status}</Badge>
              <Badge color="slate">{preview.chunkCount} chunks</Badge>
              <Badge color="indigo">{formatBytes(preview.size)}</Badge>
            </div>
            <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-[#e7e7e2] bg-[#fafaf8] p-4 font-mono text-xs leading-relaxed text-[#555851]">
              {preview.content}
            </pre>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                <X className="h-4 w-4" /> Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={pasteOpen} onClose={() => setPasteOpen(false)} title="Paste document text" wide>
        <div className="space-y-3">
          <input
            value={pasteName}
            onChange={(e) => setPasteName(e.target.value)}
            placeholder="filename.md"
            className="w-full rounded-lg border border-[#e4e5df] bg-[#fcfcfb] px-3 py-2 text-sm outline-none focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
          />
          <input
            value={pasteTags}
            onChange={(e) => setPasteTags(e.target.value)}
            placeholder="tags (comma-separated)"
            className="w-full rounded-lg border border-[#e4e5df] bg-[#fcfcfb] px-3 py-2 text-sm outline-none focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
          />
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste SOP, meeting notes, policy text…"
            rows={12}
            className="w-full resize-y rounded-lg border border-[#e4e5df] bg-[#fcfcfb] px-3 py-2 font-mono text-sm outline-none focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handlePasteUpload()} loading={uploading}>
              Process & index
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
