'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  FileText,
  Sparkles,
  MessageSquare,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Upload,
  Zap,
  GraduationCap,
  FolderOpen,
  ChartNoAxesColumn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark, BrandWordmark } from '@/components/BrandLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Language } from '@/lib/i18n/translations';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: FileText,
    title: 'AI Summary',
    description:
      'Create a structured study outline from extracted document text when an AI provider is connected.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description:
      'Generate source-based practice questions, then submit answers for server-side scoring. Requires an AI provider connection.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Layers,
    title: 'Smart Flashcards',
    description:
      'Review question-and-answer cards from your materials and record how well you recalled each concept.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    description:
      'Retrieve relevant passages from processed documents and ask a connected AI to explain them with source references.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: FolderOpen,
    title: 'Material Library',
    description: 'Keep processed PDFs in a private library, search titles, inspect extracted text, and remove materials you no longer need.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Study Analytics',
    description: 'Review real material totals, quiz results, average scores, and recent activity from your account.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
];

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Material',
    description: 'Upload PDF documents of your study materials to get started.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Text Is Extracted',
    description: 'StudyMate extracts selectable text and organizes it into passages for learning tools.',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'Generate Study Tools',
    description: 'Generate study tools with a configured AI provider, or review your extracted material.',
  },
  {
    step: '04',
    icon: GraduationCap,
    title: 'Learn & Track Progress',
    description: 'Study effectively and track your understanding across all materials.',
  },
];

const faqs = [
  {
    q: 'What file formats are supported?',
    a: 'Currently, StudyMate AI supports PDF documents. We are working on adding support for more formats including DOCX, PPTX, and plain text.',
  },
  {
    q: 'How does the AI Tutor work?',
    a: 'The tutor retrieves text passages from your processed materials and uses the configured AI provider to answer with source references. If no relevant passage is found, it says so. An AI provider must be configured for answers.',
  },
  {
    q: 'Is my data secure?',
    a: 'Materials and study records are scoped to your account. When AI features are enabled, relevant excerpts are sent to the AI provider configured by the application operator to generate a response.',
  },
  {
    q: 'Can I use StudyMate AI for any subject?',
    a: 'Absolutely! StudyMate AI works with any text-based study material, whether it\'s science, humanities, business, law, or any other field.',
  },
  {
    q: 'How accurate are the AI-generated quizzes?',
    a: 'Questions are generated from processed excerpts when an AI provider is configured. Correct answers stay server-side until submission, and scores are calculated by the server.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-10" />
            <BrandWordmark className="text-xl" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              {t.nav.features}
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              {t.nav.howItWorks}
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              {t.nav.faq}
            </a>
            
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <ThemeSwitcher />
              
              {/* Language Switcher */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-sm text-muted-foreground hover:text-foreground focus:outline-none border-none cursor-pointer"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="id">🇮🇩 ID</option>
              </select>

              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t.nav.signIn}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">{t.nav.getStarted}</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle & Switchers */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitcher />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm text-muted-foreground focus:outline-none border-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="id">ID</option>
            </select>
            <button
              className="text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.features}
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.howItWorks}
              </a>
              <a
                href="#faq"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.faq}
              </a>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{t.nav.getStarted}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <Sparkles className="h-4 w-4" />
              {t.hero.badge}
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              {t.hero.title1}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/auth/register">
                <Button size="xl" className="group gap-2">
                  {t.hero.cta1}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="xl">
                  {t.hero.cta2}
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="relative rounded-2xl border border-border/50 bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl bg-card p-6 sm:p-8">
                {/* Mock Dashboard Preview */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  <span className="ml-4 text-xs text-muted-foreground">StudyMate AI Dashboard</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Materials</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">—</p>
                    <p className="text-xs text-muted-foreground">PDFs uploaded</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium text-foreground">Quizzes</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary">—</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">Avg Score</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">—</p>
                    <p className="text-xs text-muted-foreground">Quiz performance</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t.features.title1}{' '}
              <span className="text-primary">{t.features.title2}</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.features.subtitle}
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-card-hover sm:p-8"
              >
                <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How It <span className="text-secondary">Works</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in minutes with our simple four-step process.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-primary">
                  Step {step.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-secondary/20 p-8 text-center sm:p-16"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-secondary/20 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ready to Transform Your Learning?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Build a more effective study routine with tools designed around your materials.
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button size="xl" className="group gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions about StudyMate AI.
            </p>
          </motion.div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/30"
                >
                  <span className="pr-4 font-medium text-foreground">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-b-xl border-x border-b border-border bg-card px-5 pb-5"
                  >
                    <p className="text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <BrandMark className="h-8" />
              <BrandWordmark className="text-lg" />
            </div>
            <div className="flex gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} StudyMate AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
