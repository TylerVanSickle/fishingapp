import type { Metadata } from "next";
import Link from "next/link";
import { Fish, ArrowLeft, Mail, MessageSquare, Sparkles, ShieldCheck, Bug } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get help with HookLine — contact support or browse common questions.",
};

const FAQS = [
  {
    q: "How do I cancel my Pro subscription?",
    a: "Go to your Profile → Manage Pro → Manage in Stripe Portal. From there you can cancel, switch plans, or update your payment method. You keep Pro access until the end of your billing period.",
  },
  {
    q: "My is_pro didn't activate after subscribing.",
    a: "This is usually a webhook delay. Wait 60 seconds and refresh. If it still shows free, email us with your account email and we'll activate it manually.",
  },
  {
    q: "How do I delete my account?",
    a: "Email us at the address below with the subject 'Delete my account' and we'll remove all your data within 30 days per our privacy policy.",
  },
  {
    q: "A fishing spot has wrong information.",
    a: "Use the Report button on the spot page. Our team reviews reports and corrects or removes inaccurate spots.",
  },
  {
    q: "Can I export my catch data?",
    a: "Yes — go to My Logbook → Export CSV. This downloads all your catches as a spreadsheet.",
  },
  {
    q: "The app isn't loading or something looks broken.",
    a: "Try a hard refresh (Ctrl+Shift+R on desktop). If the issue persists, email us with what page you were on and what you saw.",
  },
  {
    q: "How do I get my spot added to the map?",
    a: "Use the Submit a Spot page from the map. Spots are reviewed and approved by our team before going live.",
  },
  {
    q: "Is HookLine available on iOS and Android?",
    a: "We're working on App Store and Google Play submissions. For now, you can add HookLine to your home screen from your browser for an app-like experience.",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue-600/15 flex items-center justify-center">
          <Fish size={16} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Contact & Support</h1>
      </div>
      <p className="text-slate-500 text-sm mb-10">We&apos;re a small team — we read every message.</p>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
        <a
          href="mailto:support@hooklineapp.com"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mail size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">General Support</p>
            <p className="text-xs text-slate-500 mt-0.5">support@hooklineapp.com</p>
          </div>
        </a>

        <a
          href="mailto:billing@hooklineapp.com"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Billing & Pro</p>
            <p className="text-xs text-slate-500 mt-0.5">billing@hooklineapp.com</p>
          </div>
        </a>

        <a
          href="mailto:bugs@hooklineapp.com"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bug size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bug Reports</p>
            <p className="text-xs text-slate-500 mt-0.5">bugs@hooklineapp.com</p>
          </div>
        </a>
      </div>

      {/* Response time */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/15 mb-12">
        <MessageSquare size={16} className="text-green-400 shrink-0" />
        <p className="text-sm text-slate-400">
          We typically respond within <strong className="text-white">24–48 hours</strong>, Monday–Friday.
        </p>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <ShieldCheck size={16} className="text-slate-500" /> Common Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-white/8 bg-white/2 overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none hover:bg-white/3 transition-colors">
                <span className="text-sm font-medium text-slate-200">{q}</span>
                <span className="text-slate-600 group-open:rotate-45 transition-transform text-lg shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-10 pt-6 border-t border-white/6 flex items-center gap-4 text-xs text-slate-600">
        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
        <Link href="/pro" className="hover:text-amber-400 transition-colors text-amber-700">HookLine Pro</Link>
      </div>
    </div>
  );
}
