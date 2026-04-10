"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContact } from "@/lib/actions/contact";

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "bug", label: "Bug Report" },
  { value: "spot", label: "Spot / Map Issue" },
  { value: "account", label: "Account Help" },
  { value: "other", label: "Other" },
];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const result = await submitContact(fd);

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Message sent!</h3>
        <p className="text-slate-400 text-sm">We typically respond within 24–48 hours, Monday–Friday.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
        <select
          name="category"
          required
          defaultValue=""
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors appearance-none"
        >
          <option value="" disabled className="bg-slate-900">Select a topic...</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Describe your issue or question in detail..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <><Loader2 size={15} className="animate-spin" /> Sending...</>
        ) : (
          <><Send size={15} /> Send Message</>
        )}
      </button>
    </form>
  );
}
