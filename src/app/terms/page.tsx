import type { Metadata } from "next";
import Link from "next/link";
import { Fish, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HookLine Terms of Service — rules for using the app.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-blue-600/15 flex items-center justify-center">
          <Fish size={16} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
          <p className="text-xs text-slate-600">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="space-y-8 text-slate-400 text-sm leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Agreement</h2>
          <p>By creating an account or using HookLine (&quot;the App&quot;), you agree to these Terms. If you don&apos;t agree, don&apos;t use the App. We may update these Terms at any time — continued use after changes means you accept them.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Your account</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>You must be 13 or older to use HookLine</li>
            <li>You&apos;re responsible for keeping your account credentials secure</li>
            <li>One account per person — don&apos;t create fake accounts</li>
            <li>You&apos;re responsible for all activity under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Your content</h2>
          <p className="mb-3">You own content you post (catches, photos, journal entries, comments). By posting, you grant HookLine a non-exclusive, royalty-free license to display and store your content to operate the App.</p>
          <p>You agree not to post content that is:</p>
          <ul className="space-y-1.5 list-disc list-inside mt-2">
            <li>Illegal, harmful, threatening, or harassing</li>
            <li>Spam, fake, or misleading</li>
            <li>Someone else&apos;s copyrighted material without permission</li>
            <li>Sexually explicit or violent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Acceptable use</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Don&apos;t scrape or automate requests to the App</li>
            <li>Don&apos;t attempt to access other users&apos; accounts</li>
            <li>Don&apos;t abuse the reporting system</li>
            <li>Don&apos;t post inaccurate fishing spot information intentionally</li>
            <li>Follow applicable fishing regulations in your area</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Pro subscriptions</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Pro is billed monthly ($9.99) or annually ($79.99) via Stripe</li>
            <li>You can cancel anytime — access continues until the end of your billing period</li>
            <li>No refunds for partial billing periods unless required by law</li>
            <li>We may change Pro pricing with 30 days notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Disclaimers</h2>
          <p className="mb-3">HookLine is provided &quot;as is.&quot; We make no guarantees about spot accuracy, fishing conditions, or solunar predictions. Always follow local fishing regulations — HookLine is not a substitute for official regulation information.</p>
          <p>We&apos;re not responsible for any injury, loss, or damage that occurs while fishing at locations discovered through HookLine.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Termination</h2>
          <p>We may suspend or delete accounts that violate these Terms. You may delete your account at any time from your profile settings.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Governing law</h2>
          <p>These Terms are governed by the laws of the State of Utah, United States.</p>
        </section>

        <div className="pt-4 border-t border-white/6 text-xs text-slate-600 flex gap-4">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <span>Questions? Contact us through the App.</span>
        </div>
      </div>
    </div>
  );
}
