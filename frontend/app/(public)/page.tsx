"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#about",        label: "About" },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1B2A4F]">

      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .delay-1 { animation-delay: 0.10s; }
        .delay-2 { animation-delay: 0.20s; }
        .delay-3 { animation-delay: 0.30s; }
        .delay-4 { animation-delay: 0.40s; }
        .float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-200" : "bg-transparent"
      }`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#1B2A4F] rounded flex items-center justify-center text-white text-xs font-bold">
                R
              </div>
              <span className="text-base font-bold tracking-tight">ReClaim</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#4A5568] hover:text-[#1B2A4F] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="text-sm font-semibold text-[#E85D4A] hover:text-[#d04a38] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[#1B2A4F] text-white px-4 py-2 rounded hover:bg-[#2D4A7A] transition-colors"
              >
                Get started
              </Link>
            </nav>

            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {open ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="block text-sm font-medium text-[#4A5568] hover:text-[#1B2A4F]">
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Link href="/login" onClick={() => setOpen(false)}
                  className="block text-center text-sm font-semibold text-[#E85D4A] border border-[#E85D4A] px-4 py-2 rounded">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="block text-center text-sm font-semibold bg-[#1B2A4F] text-white px-4 py-2 rounded">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-12">

            <div className="flex-1 max-w-xl">
              <div className="inline-block px-3 py-1 bg-[#1B2A4F]/5 text-[#1B2A4F] text-xs font-semibold rounded mb-4">
                Community-powered lost & found
              </div>
              <h1 className="fade-up delay-1 text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Lost or found something?
              </h1>
              <p className="fade-up delay-2 mt-4 text-lg text-[#4A5568] leading-relaxed">
                ReClaim connects people with what they've lost. Report an item, browse found belongings, 
                and reunite with what matters — no hassle, no fuss.
              </p>
              <div className="fade-up delay-3 mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#E85D4A] text-white px-5 py-2.5 rounded font-semibold hover:bg-[#d04a38] transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M12 4v16m8-8H4"/>
                  </svg>
                  Report a lost item
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-[#1B2A4F] px-5 py-2.5 rounded font-semibold border border-gray-300 hover:bg-[#F8F5F0] transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  Browse found items
                </Link>
              </div>
            </div>

            <div className="fade-up delay-4 flex-1 mt-10 md:mt-0">
              <div className="relative">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#1B2A4F] to-[#2D4A7A] rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 float">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <p className="text-white/80 text-sm font-medium">Searching for something?</p>
                      <p className="text-white/50 text-xs mt-1">Thousands of items reported weekly</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-[#E85D4A] rounded-lg -z-10" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-2 text-[#4A5568] max-w-md mx-auto">
              Three simple steps to get your belongings back.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Report it",
                desc: "Tell us what you lost or found — describe it, add a photo, and pin the location. Takes two minutes.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                ),
              },
              {
                num: "02",
                title: "We cross-check",
                desc: "Our system automatically matches lost reports with found items. No endless scrolling needed.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Reunite",
                desc: "Get notified on a match, verify ownership, and pick up your item. Simple and secure.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="border border-gray-200 rounded-lg p-6 hover:border-[#1B2A4F]/20 transition-colors">
                <div className="w-10 h-10 bg-[#1B2A4F]/5 rounded-lg flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-[#E85D4A] tracking-wider">{step.num}</span>
                <h3 className="text-lg font-bold mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why ReClaim?</h2>
            <div className="mt-6 space-y-4 text-[#4A5568] text-sm leading-relaxed">
              <p>
                Every day, thousands of items get lost — phones, wallets, keys, bags, you name it. 
                Most never make it back to their owners, not because people don't want to return them, 
                but because there's no easy way to connect finder with owner.
              </p>
              <p>
                ReClaim is that bridge. We're a no-nonsense lost & found platform built for real people. 
                Report what you've lost, post what you've found, and let our system do the matching.
              </p>
              <p>
                No subscriptions. No ads. Just a straightforward tool that works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="bg-[#1B2A4F] rounded-lg p-8 md:p-12 text-center text-white">
            <h2 className="text-xl md:text-2xl font-bold">Ready to reunite what's lost?</h2>
            <p className="mt-2 text-white/70 text-sm max-w-md mx-auto">
              Join the community. It takes less than a minute to get started.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#E85D4A] text-white px-5 py-2.5 rounded font-semibold hover:bg-[#d04a38] transition-colors text-sm"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded font-semibold hover:bg-white/20 transition-colors text-sm"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1B2A4F] rounded flex items-center justify-center text-white text-[10px] font-bold">
              R
            </div>
            <span className="text-sm font-semibold">ReClaim</span>
          </div>
          <p className="text-xs text-[#4A5568]">&copy; 2026 ReClaim. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
