'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Loader2, Search, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface MaterialListItem {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  status: string;
  pageCount: number | null;
  createdAt: string;
}

function formatFileSize(size: number | null): string {
  if (!size) return 'Unknown size';
  return size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function MaterialLibrary({ initialMaterials, maxFileSizeMb }: { initialMaterials: MaterialListItem[]; maxFileSizeMb: number }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function uploadMaterial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || !file) return;
    requestInFlight.current = true;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      data.set('title', title.trim() || file.name.replace(/\.pdf$/i, ''));
      const response = await fetch('/api/materials', { method: 'POST', body: data });
      const result = await response.json().catch(() => null) as { message?: string; material?: { id: string } } | null;
      if (!response.ok) {
        setError(result?.message ?? 'The material could not be uploaded.');
        return;
      }
      setMessage('PDF uploaded and processed successfully.');
      setFile(null);
      setTitle('');
      (event.currentTarget as HTMLFormElement).reset();
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }

  async function searchMaterials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`/api/materials?search=${encodeURIComponent(search)}`);
      const result = await response.json() as { materials?: MaterialListItem[] };
      if (!response.ok) throw new Error('Search is unavailable.');
      setMaterials(result.materials ?? []);
    } catch {
      setError('Search is temporarily unavailable.');
    }
  }

  async function deleteMaterial(material: MaterialListItem) {
    if (!window.confirm(`Delete “${material.title}” and its stored file?`)) return;
    setError('');
    try {
      const response = await fetch(`/api/materials/${material.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? 'Material could not be deleted.');
      setMaterials((current) => current.filter((item) => item.id !== material.id));
      setMessage('Material deleted.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Material could not be deleted.');
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">STUDY LIBRARY</p><h1 className="mt-1 text-3xl font-semibold">My Materials</h1><p className="mt-2 text-sm text-muted-foreground">Private PDF materials, ready to study.</p></div>
        <span className="text-sm text-muted-foreground">{materials.length} shown</span>
      </header>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <form onSubmit={searchMaterials} className="flex gap-2">
            <label htmlFor="material-search" className="sr-only">Search materials</label>
            <Input id="material-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your materials" maxLength={100} />
            <Button type="submit" variant="outline" aria-label="Search materials"><Search className="h-4 w-4" /></Button>
          </form>

          {message && <p role="status" className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm">{message}</p>}
          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          {materials.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center border-y border-border px-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <h2 className="mt-3 font-medium">No materials found</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Upload a text-based PDF to create your first study material.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {materials.map((material) => (
                <li key={material.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/materials/${material.id}`} className="block truncate font-medium hover:text-primary">{material.title}</Link>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{material.fileName} · {formatFileSize(material.fileSize)} · {material.pageCount ? `${material.pageCount} pages · ` : ''}{new Date(material.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-sm px-2 py-1 text-xs capitalize ${material.status === 'completed' ? 'bg-green-600/10 text-green-700 dark:text-green-300' : material.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{material.status}</span>
                  <button type="button" onClick={() => void deleteMaterial(material)} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${material.title}`} title="Delete material"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <h2 className="font-semibold">Add a material</h2>
          <p className="mt-1 text-sm text-muted-foreground">PDF only · up to {maxFileSizeMb} MB</p>
          <form onSubmit={uploadMaterial} className="mt-5 space-y-4" aria-busy={loading}>
            <div className="space-y-2"><label htmlFor="material-title" className="text-sm font-medium">Title</label><Input id="material-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Biology, Chapter 4" maxLength={120} /></div>
            <div className="space-y-2"><label htmlFor="material-file" className="text-sm font-medium">PDF file</label><Input id="material-file" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required disabled={loading} className="file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium" /></div>
            {file && <p className="break-all text-xs text-muted-foreground">Selected: {file.name}</p>}
            <Button type="submit" disabled={loading || !file} className="w-full gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{loading ? 'Processing PDF…' : 'Upload PDF'}</Button>
          </form>
        </aside>
      </section>
    </div>
  );
}
