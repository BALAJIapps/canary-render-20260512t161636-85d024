import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { canaryLead } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_NAME", message: "Name is required" } },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_EMAIL", message: "Valid email is required" } },
        { status: 400 }
      );
    }

    const [lead] = await db
      .insert(canaryLead)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company ? String(company).trim() : null,
        message: message ? String(message).trim() : null,
      })
      .returning();

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: { code: "INSERT_FAILED", message: "Failed to save lead" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { id: lead.id } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(JSON.stringify({ level: "error", route: "POST /api/canary-leads", message }));
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await db
      .select()
      .from(canaryLead)
      .orderBy(desc(canaryLead.createdAt))
      .limit(20);

    return NextResponse.json({ ok: true, data: leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(JSON.stringify({ level: "error", route: "GET /api/canary-leads", message }));
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
