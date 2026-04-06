import type { Metadata } from "next";
import Link from "next/link";
import { Fish, ArrowLeft, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get help with HookLine — contact our support team or browse common questions.",
};

const FAQS = [
  {
    q: "How do I cancel or change my Pro subscription?",
    a: "Navigate to your Profile, then tap 'Manage Pro.' From there you can switch between monthly and annual billing, update your payment method, or cancel your subscription through our secure billing portal. Your Pro access remains active through the end of the current billing period.",
  },
  {
    q: "My Pro subscription is active in Stripe but the app still shows the free plan.",
    a: "This is typically resolved within 60 seconds as our system processes the subscription confirmation. Try refreshing the app. If the issue persists after a few minutes, contact us with your account email and we'll manually verify and activate your account.",
  },
  {
    q: "How do I report an inaccurate fishing spot?",
    a: "Open the spot detail page and use the Report button. Our moderation team reviews all reports and corrects or removes inaccurate information, usually within 24–48 hours.",
  },
  {
    q: "Can I export my catch history?",
    a: "Yes. Go to My Logbook and select Export CSV. This downloads your full catch history as a spreadsheet you can open in Excel or Google Sheets.",
  },
  {
    q: "How do I submit a new fishing spot to the map?",
    a: "Use the Submit a Spot option from the map page. New spots are reviewed by our team before going live to ensure quality and accuracy across the platform.",
  },
  {
    q: "Is my catch and location data private?",
    a: "You have full control over your privacy. Catches can be set to Public, Friends Only, or Private when logging. Location data is only used when you actively use map features — we do not track your location in the background.",
  },
  {
    q: "How do I delete my account and data?",
    a: "Send us a message using the form below with the subject 'Account Deletion.' We will permanently remove your account and all associated data within 30 days in accordance with our Privacy Policy.",
  },
  {
    q: "Is HookLine available as a mobile app?",
    a: "HookLine is optimized for mobile browsers and can be added to your home screen for a full app experience. Native iOS and Android apps are currently in development and will be available on the App Store and Google Play soon.",
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
      <p className="text-slate-500 text-sm mb-10">
        We read every message and typically respond within 24–48 hours, Monday–Friday.
      </p>

      {/* Contact form */}
      <div className="p-6 rounded-2xl border border-white/8 bg-white/2 mb-14">
        <h2 className="text-base font-semibold text-white mb-1">Send us a message</h2>
        <p className="text-xs text-slate-500 mb-6">Fill out the form below and we&apos;ll get back to you by email.</p>
        <ContactForm />
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <ShieldCheck size={16} className="text-slate-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
              <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none hover:bg-white/3 transition-colors">
                <span className="text-sm font-medium text-slate-200">{q}</span>
                <span className="text-slate-600 group-open:rotate-45 transition-transform duration-200 text-lg leading-none shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5 pt-1">
                <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/6 flex items-center gap-4 text-xs text-slate-600">
        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
        <Link href="/pro" className="hover:text-amber-400 transition-colors text-amber-700">HookLine Pro</Link>
      </div>
    </div>
  );
}
