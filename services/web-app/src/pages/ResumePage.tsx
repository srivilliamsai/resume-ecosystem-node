import { useEffect, useMemo, useState } from "react";

import { resumeApi } from "@/api";
import type { ResumeResponse } from "@/api/types";
import { ResumePanel } from "@/components/resume/ResumePanel";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { useAuthStore } from "@/store/auth";
import { copyLink } from "@/utils/copyLink";
import { cn } from "@/utils/cn";

export function ResumePage() {
  const token = useAuthStore((state) => state.token);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadResume = () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    resumeApi
      .current(token)
      .then((data) => {
        setResume(data ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load resume"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResume();
  }, [token]);

  const current = resume?.currentVersion;

  useEffect(() => {
    if (!current) {
      setShareUrl(null);
      return;
    }
    const link = new URL(window.location.origin);
    link.pathname = "/resume";
    link.searchParams.set("version", current.id);
    setShareUrl(link.toString());
  }, [current?.id]);

  const hasResume = Boolean(current);

  const heroSubtitle = useMemo(() => {
    if (!current) {
      return "Rebuild your resume to publish the first polished snapshot. Every verified activity instantly becomes part of your story.";
    }

    return `Score ${current.score} · Synced automatically after each rebuild.`;
  }, [current]);

  const handleRebuild = async () => {
    if (!token) return;
    setResumeBusy(true);
    setError(null);
    setToast(null);
    try {
      const rebuilt = await resumeApi.rebuild(token);
      setResume(rebuilt ?? null);
      setToast("Resume rebuilt with the latest verified activities.");
    } catch (rebuildError) {
      setError(rebuildError instanceof Error ? rebuildError.message : "Failed to rebuild resume");
    } finally {
      setResumeBusy(false);
    }
  };

  const handleRenderPdf = async () => {
    if (!token || !current) return;
    setPdfBusy(true);
    setError(null);
    setToast(null);

    try {
      const blob = await resumeApi.renderPdf(token, current.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "resume.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
      setToast("PDF downloaded. Share it anywhere.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to render PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    setToast(null);
    const success = await copyLink(shareUrl);
    if (success) {
      setToast("Shareable resume link copied to clipboard.");
    } else {
      setError("Copy failed. Please copy the URL manually.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-10 py-12 text-white shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="relative flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              {hasResume ? "Live resume" : "Getting started"}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {hasResume ? "Your resume is synced with every verification." : "Rebuild to publish your first resume."}
            </h1>
          </div>
          <p className="max-w-2xl text-base text-slate-300">{heroSubtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRebuild}
              disabled={resumeBusy}
              className={cn(
                "rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft transition duration-200 ease-soft hover:-translate-y-[1px] hover:bg-slate-100 active:translate-y-0",
                resumeBusy && "pointer-events-none opacity-70"
              )}
            >
              {resumeBusy ? "Rebuilding…" : hasResume ? "Rebuild resume" : "Build resume"}
            </button>
            <button
              type="button"
              onClick={handleRenderPdf}
              disabled={!current || pdfBusy}
              className={cn(
                "rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white/90 transition duration-200 ease-soft hover:-translate-y-[1px] hover:bg-white/10 active:translate-y-0",
                (!current || pdfBusy) && "pointer-events-none opacity-60"
              )}
            >
              {pdfBusy ? "Rendering…" : "Render PDF"}
            </button>
            {shareUrl ? (
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white/90 transition duration-200 ease-soft hover:-translate-y-[1px] hover:bg-white/10 active:translate-y-0"
              >
                Copy share link
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {toast ? (
        <CardWrapper className="border-emerald-200 bg-emerald-50/80 text-emerald-700">
          <p className="text-sm font-medium">{toast}</p>
        </CardWrapper>
      ) : null}

      {error ? (
        <CardWrapper className="border-rose-200 bg-rose-50/80 text-rose-700">
          <p className="text-sm font-medium">{error}</p>
        </CardWrapper>
      ) : null}

      {loading ? (
        <CardWrapper className="space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </CardWrapper>
      ) : !current ? (
        <CardWrapper className="space-y-3 text-sm text-slate-600">
          <h3 className="text-lg font-semibold text-slate-900">No resume published yet</h3>
          <p>Rebuild after verifying your first activity to publish the initial version automatically.</p>
        </CardWrapper>
      ) : (
        <ResumePanel version={current} />
      )}
    </div>
  );
}
