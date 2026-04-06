import Link from "next/link";
import { Fish, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-600">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-slate-400">

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Overview</h2>
          <p className="leading-relaxed">
            HookLine (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a fishing community app. This policy explains what data we collect, why we collect it, and how you control it. We don&apos;t sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">What we collect</h2>
          <ul className="space-y-2 list-none">
            {[
              ["Account info", "Email address, username, and optional profile details (home state, bio, avatar)."],
              ["Catch logs", "Species, weight, length, location (if you choose to attach a spot), bait, photos, and notes you enter."],
              ["Location data", "Only when you use map features or attach a spot to a catch. We do not track your location in the background."],
              ["Usage data", "Pages visited and features used, to understand how to improve the app."],
              ["Device info", "Browser type, operating system, and device model for debugging and compatibility."],
            ].map(([title, desc]) => (
              <li key={title as string} className="flex gap-3">
                <span className="text-blue-400 shrink-0 font-medium mt-0.5">{title}:</span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">How we use your data</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>To operate the app and deliver features you use</li>
            <li>To personalize your experience (spot recommendations, feed)</li>
            <li>To send notifications you opt into (new followers, comments)</li>
            <li>To process payments via Stripe for Pro subscriptions</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Data sharing</h2>
          <p className="leading-relaxed mb-3">We do not sell your personal data. We share data only with:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-300">Supabase</strong> — database and authentication provider</li>
            <li><strong className="text-slate-300">Stripe</strong> — payment processing (we never see your full card number)</li>
            <li><strong className="text-slate-300">Mapbox</strong> — map rendering</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Your catches & privacy</h2>
          <p className="leading-relaxed">
            Catches are public by default but you can set them to <strong className="text-slate-300">Friends only</strong> or <strong className="text-slate-300">Private</strong> when logging. Private catches are only visible to you. Friends-only catches are visible to mutual followers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Your rights</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Access and download your catch data (export CSV from your logbook)</li>
            <li>Edit or delete any catch, journal entry, or profile data</li>
            <li>Delete your account and all associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Data retention</h2>
          <p className="leading-relaxed">
            We retain your data as long as your account is active. When you delete your account, we delete your personal data within 30 days. Aggregated, anonymized analytics may be retained indefinitely.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Contact</h2>
          <p className="leading-relaxed">
            Questions or requests? Reach us at the contact in your app settings, or through your App Store listing.
          </p>
        </section>
      </div>
    </div>
  );
}
