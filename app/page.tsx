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
      // refresh leads panel
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
    <div className="min-h-screen" style={{ background: "#08090a", color: "#f7f8f8", fontFamily: "Inter Variable, Inter, -apple-system, system-ui, sans-serif", fontFeatureSettings: "'cv01', 'ss03'" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0f1011" }} className="sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div style={{ background: "#5e6ad2", borderRadius: 6 }} className="flex h-7 w-7 items-center justify-center">
              <Inbox className="h-4 w-4" style={{ color: "#fff" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 510, letterSpacing: "-0.165px", color: "#f7f8f8" }}>LeadPipe</span>
            <Badge variant="outline" style={{ fontSize: 10, fontWeight: 510, border: "1px solid rgba(255,255,255,0.08)", color: "#8a8f98", background: "rgba(255,255,255,0.03)", borderRadius: 4, padding: "1px 6px" }}>Canary</Badge>
          </div>
          <button
            onClick={() => { if (!leadsLoaded) fetchLeads(); else setLeadsLoaded(false); }}
            style={{ fontSize: 13, fontWeight: 510, color: "#8a8f98", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
          >
            {leadsLoaded ? "Hide leads" : "View leads"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
          {/* Left — headline + form */}
          <div>
            <div className="mb-2" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 9999, padding: "3px 10px 3px 6px" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#5e6ad2" }} />
              <span style={{ fontSize: 12, fontWeight: 510, color: "#7170ff", letterSpacing: 0 }}>Live Render canary</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 510, lineHeight: 1.05, letterSpacing: "-0.88px", color: "#f7f8f8", marginTop: 16, marginBottom: 12 }}>
              Qualify ops leads<br />
              <span style={{ color: "#8a8f98" }}>before they go cold.</span>
            </h1>
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.6, color: "#8a8f98", letterSpacing: "-0.165px", maxWidth: 420, marginBottom: 36 }}>
              Fill in the form and your inquiry lands instantly in the pipeline. No email threads, no missed follow-ups.
            </p>

            {/* Form */}
            {status === "success" ? (
              <div style={{ background: "rgba(39,166,68,0.08)", border: "1px solid rgba(39,166,68,0.2)", borderRadius: 8, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 className="h-5 w-5 mt-0.5" style={{ color: "#27a644", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 510, color: "#f7f8f8", marginBottom: 4 }}>Lead received</p>
                  <p style={{ fontSize: 13, color: "#8a8f98" }}>We&rsquo;ll be in touch within one business day. Click &ldquo;View leads&rdquo; to see your entry.</p>
                  <button onClick={() => setStatus("idle")} style={{ marginTop: 12, fontSize: 13, fontWeight: 510, color: "#7170ff", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Submit another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" style={{ fontSize: 13, fontWeight: 510, color: "#d0d6e0" }}>Full name <span style={{ color: "#5e6ad2" }}>*</span></Label>
                    <Input
                      id="name"
                      placeholder="Alex Rivera"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#f7f8f8", borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" style={{ fontSize: 13, fontWeight: 510, color: "#d0d6e0" }}>Work email <span style={{ color: "#5e6ad2" }}>*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="alex@company.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#f7f8f8", borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company" style={{ fontSize: 13, fontWeight: 510, color: "#d0d6e0" }}>Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#62666d" }} />
                    <Input
                      id="company"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#f7f8f8", borderRadius: 6, fontSize: 14, paddingLeft: 36 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="message" style={{ fontSize: 13, fontWeight: 510, color: "#d0d6e0" }}>What are you looking to solve?</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your ops challenge in a sentence or two..."
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#f7f8f8", borderRadius: 6, fontSize: 14, resize: "none" }}
                  />
                </div>

                {status === "error" && (
                  <p style={{ fontSize: 13, color: "#f87171", marginTop: -4 }}>{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  style={{ background: "#5e6ad2", color: "#fff", borderRadius: 6, fontWeight: 510, fontSize: 14, padding: "9px 18px", border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}
                >
                  <Send className="h-4 w-4" />
                  {status === "loading" ? "Submitting..." : "Submit inquiry"}
                </Button>
              </form>
            )}
          </div>

          {/* Right — what happens next / trust signals */}
          <div className="flex flex-col gap-4">
            <Card style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
              <CardHeader className="pb-3">
                <CardTitle style={{ fontSize: 13, fontWeight: 510, color: "#8a8f98", textTransform: "uppercase", letterSpacing: "0.06em" }}>What happens next</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {[
                  { icon: <Send className="h-4 w-4" />, step: "Your inquiry is captured", detail: "Lands in the pipeline the moment you hit submit." },
                  { icon: <Clock className="h-4 w-4" />, step: "Reviewed within 24 h", detail: "An ops specialist reviews your challenge same business day." },
                  { icon: <CheckCircle2 className="h-4 w-4" />, step: "Scoped & scheduled", detail: "We send a calendar link with a tailored agenda." },
                ].map(({ icon, step, detail }, i) => (
                  <div key={i} className="flex gap-3">
                    <div style={{ color: "#5e6ad2", flexShrink: 0, marginTop: 1 }}>{icon}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 510, color: "#d0d6e0" }}>{step}</p>
                      <p style={{ fontSize: 12, color: "#62666d", lineHeight: 1.5, marginTop: 2 }}>{detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
              <CardContent className="pt-4">
                <blockquote style={{ fontSize: 13, lineHeight: 1.65, color: "#8a8f98", fontStyle: "italic", borderLeft: "2px solid #5e6ad2", paddingLeft: 12 }}>
                  &ldquo;We went from a 3-day sales cycle on inbound ops leads to same-day qualification. The form is the whole funnel.&rdquo;
                </blockquote>
                <p style={{ fontSize: 12, fontWeight: 510, color: "#62666d", marginTop: 10 }}>— Director of Revenue Ops, Series B SaaS</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent leads panel */}
        {(leadsLoaded || leadsLoading) && (
          <div className="mt-16">
            <div className="mb-4 flex items-center gap-3">
              <h2 style={{ fontSize: 15, fontWeight: 510, color: "#f7f8f8", letterSpacing: "-0.165px" }}>Recent leads</h2>
              {leadsLoading && <span style={{ fontSize: 12, color: "#62666d" }}>Loading...</span>}
              {leadsLoaded && !leadsLoading && (
                <span style={{ fontSize: 12, color: "#62666d" }}>{leads.length} entr{leads.length === 1 ? "y" : "ies"}</span>
              )}
            </div>
            {leadsLoaded && leads.length === 0 && (
              <p style={{ fontSize: 13, color: "#62666d" }}>No leads yet. Submit the form above to get started.</p>
            )}
            {leadsLoaded && leads.length > 0 && (
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Name", "Email", "Company", "When"].map(h => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 510, color: "#62666d", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                        <td style={{ padding: "10px 14px", color: "#d0d6e0", fontWeight: 510 }}>{lead.name}</td>
                        <td style={{ padding: "10px 14px", color: "#8a8f98" }}>{lead.email}</td>
                        <td style={{ padding: "10px 14px", color: "#8a8f98" }}>{lead.company ?? <span style={{ color: "#62666d" }}>—</span>}</td>
                        <td style={{ padding: "10px 14px", color: "#62666d" }}>{timeAgo(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 80, padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#62666d" }}>LeadPipe · built on Baljia · Neon · Next.js</p>
      </footer>
    </div>
  );
}
