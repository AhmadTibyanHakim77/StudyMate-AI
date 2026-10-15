'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialOption { id: string; title: string }
interface SourceReference { materialId: string; title: string; chunkIndex: number }
interface TutorMessage { id: string; role: string; content: string; sources: SourceReference[]; createdAt: string }
interface ConversationItem { id: string; title: string | null; materialTitle: string | null; updatedAt: string }
interface ActiveConversation { id: string; title: string | null; materialTitle: string | null; messages: TutorMessage[] }

export function TutorWorkspace({ materials, conversations, activeConversation, initialMaterialId }: { materials: MaterialOption[]; conversations: ConversationItem[]; activeConversation?: ActiveConversation; initialMaterialId?: string }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [conversationId, setConversationId] = useState(activeConversation?.id ?? '');
  const [messages, setMessages] = useState<TutorMessage[]>(activeConversation?.messages ?? []);
  const [materialId, setMaterialId] = useState(activeConversation?.messages.length ? activeConversation.materialTitle ? initialMaterialId ?? '' : '' : initialMaterialId ?? '');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function startNewConversation() {
    setConversationId('');
    setMessages([]);
    setQuestion('');
    setError('');
    router.push('/dashboard/tutor');
  }

  async function sendQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || question.trim().length < 5) return;
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    const submittedQuestion = question.trim();
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: submittedQuestion, ...(materialId ? { materialId } : {}), ...(conversationId ? { conversationId } : {}) }),
      });
      const result = await response.json().catch(() => null) as { message?: string; conversationId?: string; answer?: string; sources?: SourceReference[] } | null;
      if (!response.ok || !result?.conversationId || !result.answer) {
        setError(result?.message ?? 'The tutor could not answer this question.');
        return;
      }
      setConversationId(result.conversationId);
      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: 'user', content: submittedQuestion, sources: [], createdAt: new Date().toISOString() },
        { id: `assistant-${Date.now()}`, role: 'assistant', content: result.answer as string, sources: result.sources ?? [], createdAt: new Date().toISOString() },
      ]);
      setQuestion('');
      router.replace(`/dashboard/tutor/${result.conversationId}`);
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="min-w-0 space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-primary">GROUNDED STUDY HELP</p><h1 className="mt-1 text-3xl font-semibold">AI Tutor</h1><p className="mt-2 text-sm text-muted-foreground">Ask questions grounded in your processed materials.</p></div><Button type="button" variant="outline" onClick={startNewConversation} className="gap-2"><Plus className="h-4 w-4" />New conversation</Button></header>
        <div className="flex flex-wrap items-end gap-3 border-y border-border py-4"><div className="min-w-56 flex-1 space-y-2"><label htmlFor="tutor-material" className="text-sm font-medium">Search scope</label><select id="tutor-material" value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={loading || Boolean(conversationId)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All my processed materials</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.title}</option>)}</select></div><p className="max-w-md text-xs text-muted-foreground">Retrieval is limited to documents you own. Document text is treated as source data, not system instructions.</p></div>
        {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div aria-live="polite" className="min-h-56 space-y-5 border-b border-border pb-5">
          {messages.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center text-center"><MessageSquare className="h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Start with a question</p><p className="mt-1 max-w-md text-sm text-muted-foreground">Choose a material or search across your library. Answers are based on retrieved text and include source references.</p></div> : messages.map((message) => <article key={message.id} className={message.role === 'user' ? 'ml-auto max-w-2xl border border-border bg-card p-4' : 'max-w-3xl border-l-2 border-primary pl-4 py-1'}><p className="text-xs font-semibold uppercase text-muted-foreground">{message.role === 'user' ? 'You' : 'Tutor'}</p><p className="mt-2 whitespace-pre-wrap leading-7">{message.content}</p>{message.sources.length > 0 && <div className="mt-4 space-y-1"><p className="text-xs font-semibold text-muted-foreground">Sources</p>{message.sources.map((source, index) => <Link key={`${source.materialId}-${source.chunkIndex}-${index}`} href={`/dashboard/materials/${source.materialId}`} className="block text-xs text-primary hover:underline">[{index + 1}] {source.title} · excerpt {source.chunkIndex + 1}</Link>)}</div>}</article>)}
        </div>
        <form onSubmit={sendQuestion} className="space-y-3" aria-busy={loading}><label htmlFor="tutor-question" className="text-sm font-medium">Your question</label><textarea id="tutor-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={2000} minLength={5} rows={3} required disabled={loading} placeholder="Ask about a concept in your materials…" className="w-full resize-y rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /><div className="flex justify-end"><Button type="submit" disabled={loading || question.trim().length < 5} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{loading ? 'Thinking…' : 'Send question'}</Button></div></form>
      </section>
      <aside className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><h2 className="font-semibold">Recent conversations</h2>{conversations.length ? <ul className="mt-3 divide-y divide-border border-y border-border">{conversations.map((conversation) => <li key={conversation.id} className="py-3"><Link href={`/dashboard/tutor/${conversation.id}`} className="block truncate text-sm font-medium hover:text-primary">{conversation.title || 'Study conversation'}</Link><p className="mt-1 truncate text-xs text-muted-foreground">{conversation.materialTitle ?? 'All materials'} · {new Date(conversation.updatedAt).toLocaleDateString()}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">Saved conversations will appear here.</p>}</aside>
    </div>
  );
}
