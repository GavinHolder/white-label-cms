/**
 * POST /api/admin/updates/verify — verify GitHub config settings before saving.
 * Runs 4 independent checks: PAT validity, repo access, workflow existence, upstream version URL.
 * SUPER_ADMIN only.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const GITHUB_API = "https://api.github.com";

function githubHeaders(pat: string): HeadersInit {
  return {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

interface CheckResult {
  ok: boolean;
  detail: string;
}

async function checkPat(pat: string): Promise<CheckResult> {
  if (!pat) {
    return { ok: false, detail: "No PAT provided." };
  }
  try {
    const res = await fetch(`${GITHUB_API}/user`, { headers: githubHeaders(pat) });
    if (!res.ok) {
      return { ok: false, detail: `GitHub returned ${res.status} — PAT may be invalid or expired.` };
    }
    const data = await res.json() as { login?: string };
    const login = data.login ?? "(unknown)";
    return { ok: true, detail: `Authenticated as ${login}.` };
  } catch (err) {
    return { ok: false, detail: `Request failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function checkRepo(pat: string, owner: string, name: string): Promise<CheckResult> {
  if (!owner || !name) {
    return { ok: false, detail: "Repo owner or name not provided." };
  }
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, { headers: githubHeaders(pat) });
    if (res.status === 404) {
      return { ok: false, detail: `Repository ${owner}/${name} not found or not accessible with this PAT.` };
    }
    if (!res.ok) {
      return { ok: false, detail: `GitHub returned ${res.status} for repo lookup.` };
    }
    return { ok: true, detail: `Repository ${owner}/${name} is accessible.` };
  } catch (err) {
    return { ok: false, detail: `Request failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function checkWorkflow(pat: string, owner: string, name: string, workflowId: string): Promise<CheckResult> {
  if (!owner || !name || !workflowId) {
    return { ok: false, detail: "Repo owner, name, or workflow ID not provided." };
  }
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${name}/actions/workflows/${workflowId}`,
      { headers: githubHeaders(pat) }
    );
    if (res.status === 404) {
      return { ok: false, detail: `Workflow "${workflowId}" not found in ${owner}/${name}.` };
    }
    if (!res.ok) {
      return { ok: false, detail: `GitHub returned ${res.status} for workflow lookup.` };
    }
    const data = await res.json() as { name?: string; state?: string };
    const label = data.name ? `"${data.name}"` : workflowId;
    return { ok: true, detail: `Workflow ${label} found (state: ${data.state ?? "unknown"}).` };
  } catch (err) {
    return { ok: false, detail: `Request failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function checkUpstream(upstreamVersionUrl: string): Promise<CheckResult> {
  if (!upstreamVersionUrl) {
    return { ok: false, detail: "No upstream version URL provided." };
  }
  try {
    const res = await fetch(upstreamVersionUrl);
    if (!res.ok) {
      return { ok: false, detail: `URL returned ${res.status}.` };
    }
    const data = await res.json() as Record<string, unknown>;
    if (!("version" in data) || !data.version) {
      return { ok: false, detail: "Response is valid JSON but has no \"version\" field." };
    }
    return { ok: true, detail: `Upstream version: ${String(data.version)}.` };
  } catch (err) {
    return { ok: false, detail: `Request failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, UserRole.SUPER_ADMIN);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    githubPat?: string;
    githubRepoOwner?: string;
    githubRepoName?: string;
    githubWorkflowId?: string;
    upstreamVersionUrl?: string;
  };

  // If no PAT in body (user has saved PAT, didn't retype it), load from DB
  let pat = body.githubPat ?? "";
  if (!pat) {
    const row = await prisma.systemSettings.findUnique({ where: { key: "github_pat" } });
    pat = row?.value ?? "";
  }

  const owner = body.githubRepoOwner ?? "";
  const name = body.githubRepoName ?? "";
  const workflowId = body.githubWorkflowId ?? "";
  const upstreamVersionUrl = body.upstreamVersionUrl ?? "";

  // Run all 4 checks in parallel — each is independent
  const [pat_, repo, workflow, upstream] = await Promise.all([
    checkPat(pat),
    checkRepo(pat, owner, name),
    checkWorkflow(pat, owner, name, workflowId),
    checkUpstream(upstreamVersionUrl),
  ]);

  return NextResponse.json({
    success: true,
    results: {
      pat: pat_,
      repo,
      workflow,
      upstream,
    },
  });
}
