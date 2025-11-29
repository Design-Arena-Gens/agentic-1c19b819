/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useMemo, useState } from "react";
import { GenerationResponse, AffiliatePlatform } from "../lib/types";

type FormState = {
  productUrl: string;
  targetLanguage: string;
  targetRegion: string;
  seoKeywords: string;
  persona: string;
  tone: string;
  minimumWordCount: number;
  includeImages: boolean;
  additionalNotes: string;
};

const affiliatePlatforms: Record<AffiliatePlatform, string> = {
  amazon: "Amazon",
  mercadoLivre: "Mercado Livre",
  shopee: "Shopee",
  magalu: "Magalu",
  clickbank: "Clickbank",
  hotmart: "Hotmart",
  eduzz: "Eduzz",
  kiwify: "Kiwify",
  braip: "Braip",
};

type AffiliateInputs = Partial<
  Record<AffiliatePlatform, { baseUrl: string; tag: string }>
>;

const defaultForm: FormState = {
  productUrl: "",
  targetLanguage: "pt-BR",
  targetRegion: "Brazil",
  seoKeywords: "melhor preço\nreview completo\nvale a pena",
  persona: "Especialista em reviews transparentes focados em conversão",
  tone: "Conversacional, confiável e técnico na medida certa",
  minimumWordCount: 1800,
  includeImages: true,
  additionalNotes:
    "Adapte para Google Discover e destaque diferenciais locais quando houver.",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [affiliates, setAffiliates] = useState<AffiliateInputs>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const keywordList = useMemo(
    () =>
      form.seoKeywords
        .split(/\n|,/)
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [form.seoKeywords]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl: form.productUrl,
          targetLanguage: form.targetLanguage,
          targetRegion: form.targetRegion,
          seoKeywords: keywordList,
          persona: form.persona,
          tone: form.tone,
          minimumWordCount: form.minimumWordCount,
          includeImages: form.includeImages,
          affiliateConfig: affiliates,
          additionalNotes: form.additionalNotes,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Generation failed. Please review your inputs."
        );
      }

      const data: GenerationResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-sky-400">
              Agentic Publisher Toolkit
            </p>
            <h1 className="mt-1 text-3xl font-semibold lg:text-4xl">
              Geo-SEO Review Article Generator
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Transform any product URL into a Google Discover-ready review with
              structured SEO, localized insights, spell checking, and affiliate
              monetization baked in.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200 shadow-lg shadow-sky-500/10">
            <p className="font-semibold text-sky-400">Integrations</p>
            <p>ChatGPT · Nano Banana · Multi-Affiliate · Spellcheck</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-sky-500/5">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                htmlFor="productUrl"
                className="text-sm font-medium text-slate-200"
              >
                Product source URL
              </label>
              <input
                id="productUrl"
                required
                value={form.productUrl}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    productUrl: event.target.value,
                  }))
                }
                placeholder="https://www.amazon.com/... or https://www.magazineluiza.com.br/..."
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none ring-sky-400/40 transition focus:border-sky-500 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200">
                  Target language
                </label>
                <input
                  value={form.targetLanguage}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      targetLanguage: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                  placeholder="pt-BR"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200">
                  Target GEO / Region
                </label>
                <input
                  value={form.targetRegion}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      targetRegion: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                  placeholder="Brazil"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-200">
                Core SEO keywords (comma or line separated)
              </label>
              <textarea
                value={form.seoKeywords}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    seoKeywords: event.target.value,
                  }))
                }
                rows={3}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200">
                  Persona
                </label>
                <input
                  value={form.persona}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      persona: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200">
                  Tone
                </label>
                <input
                  value={form.tone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tone: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-200">
                Minimum word count
              </label>
              <input
                type="number"
                min={400}
                max={4000}
                value={form.minimumWordCount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumWordCount: Number(event.target.value),
                  }))
                }
                className="w-32 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
              />
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-200">
                  Generate Nano Banana visuals
                </p>
                <p className="text-xs text-slate-400">
                  Requires `NANO_BANANA_API_KEY`; prompts are ultra-specific to
                  each section for Discover-ready imagery.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={form.includeImages}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      includeImages: !prev.includeImages,
                    }))
                  }
                />
                <div className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-sky-500" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-200">
                Additional editorial notes
              </label>
              <textarea
                value={form.additionalNotes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    additionalNotes: event.target.value,
                  }))
                }
                rows={3}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
              />
            </div>

            <fieldset className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/70 p-4">
              <legend className="px-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                Affiliate parameters
              </legend>
              <p className="mb-4 text-xs text-slate-400">
                Insert your affiliate deeplink base URL and unique tag for each
                network. URLs receive `ref` and `target` query parameters.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(affiliatePlatforms).map(([key, label]) => (
                  <div key={key} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm font-semibold text-slate-200">
                      {label}
                    </p>
                    <input
                      className="mt-2 w-full rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                      placeholder="Affiliate base URL"
                      value={affiliates[key as AffiliatePlatform]?.baseUrl ?? ""}
                      onChange={(event) =>
                        setAffiliates((prev) => ({
                          ...prev,
                          [key]: {
                            baseUrl: event.target.value,
                            tag: prev[key as AffiliatePlatform]?.tag ?? "",
                          },
                        }))
                      }
                    />
                    <input
                      className="mt-2 w-full rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40"
                      placeholder="Affiliate tag / id"
                      value={affiliates[key as AffiliatePlatform]?.tag ?? ""}
                      onChange={(event) =>
                        setAffiliates((prev) => ({
                          ...prev,
                          [key]: {
                            baseUrl:
                              prev[key as AffiliatePlatform]?.baseUrl ?? "",
                            tag: event.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            <button
              disabled={loading}
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading ? "Generating article..." : "Generate review article"}
            </button>

            {error && (
              <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="flex h-fit flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-6 shadow-inner shadow-sky-500/5">
          <h2 className="text-lg font-semibold text-slate-100">Output</h2>
          {!result && !loading && (
            <p className="text-sm text-slate-400">
              Fill the form and hit generate to produce a review article enriched
              with affiliate placements, local SEO cues, and Discover-ready
              assets. Output will appear here.
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              <span className="inline-block h-3 w-3 animate-ping rounded-full bg-sky-400" />
              Drafting article via ChatGPT, running spellcheck and GEO pass...
            </div>
          )}

          {result && <GeneratedArticlePreview data={result} />}
        </section>
      </main>
    </div>
  );
}

type PreviewProps = {
  data: GenerationResponse;
};

function GeneratedArticlePreview({ data }: PreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const copyPayload = [
      data.article.title,
      data.article.metaDescription,
      "",
      ...data.article.sections.map(
        (section) => `## ${section.heading}\n${section.body}`
      ),
      "",
      "FAQs",
      ...data.article.faqs.map((faq) => `### ${faq.heading}\n${faq.body}`),
      "",
      data.article.callToAction,
    ].join("\n");

    await navigator.clipboard.writeText(copyPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Product Intel
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {data.product.title || "Produto"}
          </h3>
          <p className="mt-2 text-xs text-slate-300">
            {data.product.description}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="rounded-md border border-sky-400/60 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/20"
        >
          {copied ? "Copiado!" : "Copiar Markdown"}
        </button>
      </div>

      <div className="grid gap-3">
        <article className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm leading-relaxed text-slate-200">
          <h4 className="text-xl font-bold text-sky-200">
            {data.article.title}
          </h4>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
            Slug: {data.article.slug}
          </p>
          <p className="mt-3 text-slate-300">{data.article.excerpt}</p>
          <p className="mt-3 text-xs text-slate-400">
            Meta description: {data.article.metaDescription}
          </p>
          <div className="mt-4 space-y-4">
            {data.article.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-lg border border-white/5 bg-slate-950/40 p-3"
              >
                <h5 className="text-base font-semibold text-sky-300">
                  {section.heading}
                </h5>
                <p className="mt-2 whitespace-pre-wrap text-slate-200">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
            <p className="text-sm font-semibold text-emerald-200">
              Call to Action
            </p>
            <p className="text-sm text-emerald-100">
              {data.article.callToAction}
            </p>
          </div>
        </article>

        {data.article.affiliateBlocks?.length > 0 && (
          <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 text-sm text-purple-50">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-200">
              Affiliate placements
            </p>
            <ul className="mt-3 space-y-2">
              {data.article.affiliateBlocks.map((block) => (
                <li
                  key={`${block.platform}-${block.link}`}
                  className="rounded-lg border border-purple-400/50 bg-purple-900/30 p-3"
                >
                  <p className="text-sm font-semibold capitalize">
                    {block.platform}
                  </p>
                  <p className="text-xs text-purple-200">{block.context}</p>
                  <a
                    href={block.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-sky-200 underline"
                  >
                    {block.link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.nanoBananaImages && data.nanoBananaImages.length > 0 && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-50">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Nano Banana renders
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {data.nanoBananaImages.map((image) => (
                <figure
                  key={image.imageUrl}
                  className="overflow-hidden rounded-lg border border-amber-500/20 bg-black/40"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="h-40 w-full object-cover"
                  />
                  <figcaption className="p-2 text-[11px] text-amber-200">
                    {image.prompt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            GEO / SEO checklist
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {data.geoHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {data.spellingAdjustments.length > 0 && (
          <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-50">
            <p className="text-xs uppercase tracking-[0.3em] text-green-200">
              Spellcheck adjustments
            </p>
            <ul className="mt-2 space-y-1">
              {data.spellingAdjustments.map((item) => (
                <li key={item} className="text-xs">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.article.faqs.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              FAQs
            </p>
            <div className="mt-3 space-y-3">
              {data.article.faqs.map((faq) => (
                <div key={faq.heading}>
                  <p className="font-semibold text-slate-100">
                    {faq.heading}
                  </p>
                  <p className="mt-1 text-slate-300">{faq.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
