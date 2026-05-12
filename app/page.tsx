"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock, Inbox, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/canary-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data?.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setForm({ name: "", email: "", company: "", message: "" });
      if (leadsLoaded) fetchLeads();
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  async function fetchLeads() {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/canary-leads");
      const data = await res.json();
      if (data.ok) {
        setLeads(data.data);
        setLeadsLoaded(true);
      }
    } catch {
      // silent — panel stays hidden
    } finally {
      setLeadsLoading(false);
    }
  }

  return (
    <div className="lp-page">
      {/* Nav */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="flex items-center gap-3">
            <div className="lp-logo-icon">
              <Inbox className="h-4 w-4" />
            </div>
            <span className="lp-logo-name">LeadPipe</span>
            <Badge variant="outline" className="lp-badge-canary">Canary</Badge>
          </div>
          <button
            className="lp-nav-btn"
            onClick={() => { if (!leadsLoaded) fetchLeads(); else setLeadsLoaded(false); }}
          >
            {leadsLoaded ? "Hide leads" : "View leads"}
          </button>
        </div>
      </header>

      <main className="lp-main">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
          {/* Left — headline + form */}
          <div>
            <div className="lp-pill">
              <span className="lp-pill-dot" />
              <span className="lp-pill-text">Live Render canary</span>
            </div>
            <h1 className="lp-h1">
              Qualify ops leads<br />
              <span className="lp-h1-muted">before they go cold.</span>
            </h1>
            <p className="lp-subtitle">
              Fill in the form and your inquiry lands instantly in the pipeline. No email threads, no missed follow-ups.
            </p>

            {/* Form */}
            {status === "success" ? (
              <div className="lp-success-box">
                <CheckCircle2 className="h-5 w-5 lp-success-icon" />
                <div>
                  <p className="lp-success-title">Lead received</p>
                  <p className="lp-success-body">We&rsquo;ll be in touch within one business day. Click &ldquo;View leads&rdquo; to see your entry.</p>
                  <button className="lp-success-link" onClick={() => setStatus("idle")}>Submit another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="lp-label">Full name <span className="lp-label-required">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Alex Rivera"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      className="lp-input-style"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="lp-label">Work email <span className="lp-label-required">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="alex@company.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      className="lp-input-style"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company" className="lp-label">Company</Label>
                  <div className="relative">
                    <Building2 className="lp-company-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="company"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="lp-input-style pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="message" className="lp-label">What are you looking to solve?</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your ops challenge in a sentence or two..."
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="lp-input-style resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="lp-error-msg">{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="lp-submit-btn"
                >
                  <Send className="h-4 w-4" />
                  {status === "loading" ? "Submitting..." : "Submit inquiry"}
                </Button>
              </form>
            )}
          </div>

          {/* Right — what happens next / trust signals */}
          <div className="flex flex-col gap-4">
            <Card className="lp-card">
              <CardHeader className="pb-3">
                <CardTitle className="lp-card-section-label">What happens next</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {[
                  { icon: <Send className="h-4 w-4" />, step: "Your inquiry is captured", detail: "Lands in the pipeline the moment you hit submit." },
                  { icon: <Clock className="h-4 w-4" />, step: "Reviewed within 24 h", detail: "An ops specialist reviews your challenge same business day." },
                  { icon: <CheckCircle2 className="h-4 w-4" />, step: "Scoped & scheduled", detail: "We send a calendar link with a tailored agenda." },
                ].map(({ icon, step, detail }, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="lp-next-step-icon">{icon}</div>
                    <div>
                      <p className="lp-next-step-title">{step}</p>
                      <p className="lp-next-step-detail">{detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lp-card">
              <CardContent className="pt-4">
                <blockquote className="lp-quote">
                  &ldquo;We went from a 3-day sales cycle on inbound ops leads to same-day qualification. The form is the whole funnel.&rdquo;
                </blockquote>
                <p className="lp-quote-attr">&mdash; Director of Revenue Ops, Series B SaaS</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent leads panel */}
        {(leadsLoaded || leadsLoading) && (
          <div className="mt-16">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="lp-section-title">Recent leads</h2>
              {leadsLoading && <span className="lp-td-time">Loading...</span>}
              {leadsLoaded && !leadsLoading && (
                <span className="lp-td-time">{leads.length} entr{leads.length === 1 ? "y" : "ies"}</span>
              )}
            </div>
            {leadsLoaded && leads.length === 0 && (
              <p className="lp-next-step-detail">No leads yet. Submit the form above to get started.</p>
            )}
            {leadsLoaded && leads.length > 0 && (
              <div style={{ border: "1px solid var(--lp-border)", borderRadius: 8, overflow: "hidden" }}>
                <table className="lp-leads-table">
                  <thead>
                    <tr>
                      {["Name", "Email", "Company", "When"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? "1px solid var(--lp-border-subtle)" : undefined }}>
                        <td className="lp-td-name">{lead.name}</td>
                        <td className="lp-td-email">{lead.email}</td>
                        <td className="lp-td-company">{lead.company ?? <span className="lp-td-empty">&mdash;</span>}</td>
                        <td className="lp-td-time">{timeAgo(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="lp-footer">
        <p className="lp-footer-text">LeadPipe &middot; built on Baljia &middot; Neon &middot; Next.js</p>
      </footer>
    </div>
  );
}
