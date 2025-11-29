import { NextResponse } from "next/server";
import { z } from "zod";
import pLimit from "p-limit";
import { scrapeProductSnapshot } from "../../../lib/product-scraper";
import { getOpenAIClient } from "../../../lib/openai";
import {
  GenerationRequest,
  GenerationResponse,
  GeneratedArticle,
  AffiliateLinkConfig,
} from "../../../lib/types";
import { spellcheckSections, runSpellcheck } from "../../../lib/spellcheck";
import { generateNanoBananaImages } from "../../../lib/nano-banana";

const requestSchema = z.object({
  productUrl: z.string().url(),
  targetLanguage: z.string().min(2),
  targetRegion: z.string().min(2),
  seoKeywords: z.array(z.string().min(2)).min(1),
  persona: z.string().min(2),
  tone: z.string().min(2),
  minimumWordCount: z.number().min(400).max(4000),
  includeImages: z.boolean().default(true),
  affiliateConfig: z
    .record(
      z.string(),
      z.object({
        baseUrl: z.string().url(),
        tag: z.string().min(1),
      })
    )
    .default({}),
  additionalNotes: z.string().optional(),
});

function buildAffiliateLinks(
  affiliateConfig: AffiliateLinkConfig,
  productUrl: string
) {
  const links: Record<string, string> = {};
  for (const [platform, config] of Object.entries(affiliateConfig)) {
    if (!config) continue;
    const url = new URL(config.baseUrl);
    url.searchParams.set("ref", config.tag);
    url.searchParams.set("target", productUrl);
    links[platform] = url.toString();
  }
  return links;
}

async function assembleArticle(
  productUrl: string,
  payload: GenerationRequest,
  productData: Awaited<ReturnType<typeof scrapeProductSnapshot>>
): Promise<GeneratedArticle> {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert affiliate SEO editor crafting long-form product review articles optimized for Google Discover and local search intent. Always return valid JSON.",
      },
      {
        role: "user",
        content: JSON.stringify({
          instructions: {
            targetLanguage: payload.targetLanguage,
            targetRegion: payload.targetRegion,
            persona: payload.persona,
            tone: payload.tone,
            minimumWordCount: payload.minimumWordCount,
            seoKeywords: payload.seoKeywords,
            includeImages: payload.includeImages,
            additionalNotes: payload.additionalNotes ?? "",
            affiliateLinks: buildAffiliateLinks(
              payload.affiliateConfig,
              productUrl
            ),
          },
          product: productData,
        }),
      },
    ],
  });

  const content =
    response.choices[0]?.message?.content?.trim() ??
    '{"title":"","slug":"","metaDescription":"","excerpt":"","sections":[],"callToAction":"","faqs":[],"affiliateBlocks":[],"imagePrompts":[]}';

  let parsed: GeneratedArticle;
  try {
    parsed = JSON.parse(content) as GeneratedArticle;
  } catch (error) {
    console.error("Failed to parse article response from model", error);
    throw new Error("Failed to parse article response from model");
  }

  parsed.sections = Array.isArray(parsed.sections) ? parsed.sections : [];
  parsed.faqs = Array.isArray(parsed.faqs) ? parsed.faqs : [];
  parsed.affiliateBlocks = Array.isArray(parsed.affiliateBlocks)
    ? parsed.affiliateBlocks
    : [];
  parsed.imagePrompts = Array.isArray(parsed.imagePrompts)
    ? parsed.imagePrompts
    : [];
  parsed.callToAction = parsed.callToAction ?? "";
  parsed.metaDescription = parsed.metaDescription ?? "";
  parsed.excerpt = parsed.excerpt ?? "";
  parsed.title = parsed.title ?? "";
  parsed.slug = parsed.slug ?? "";

  return parsed;
}

export async function POST(req: Request) {
  try {
    const input = requestSchema.parse(await req.json());
    const productData = await scrapeProductSnapshot(input.productUrl);
    const article = await assembleArticle(
      input.productUrl,
      input,
      productData
    );

    const sectionBodies = article.sections.map((section) => section.body);
    const {
      corrected: correctedSections,
      adjustments: sectionAdjustments,
    } = await spellcheckSections(sectionBodies, input.targetLanguage);

    const correctedFaqs = article.faqs.length
      ? await spellcheckSections(
          article.faqs.map((faq) => `${faq.heading}\n${faq.body}`),
          input.targetLanguage
        )
      : { corrected: [] as string[], adjustments: [] as string[] };

    article.sections = article.sections.map((section, index) => ({
      ...section,
      body: correctedSections[index] ?? section.body,
    }));

    article.faqs = article.faqs.map((faq, index) => {
      const corrected = correctedFaqs.corrected[index] ?? "";
      const [heading, ...bodyParts] = corrected.split("\n");
      return {
        heading: heading || faq.heading,
        body: bodyParts.join("\n") || faq.body,
      };
    });

    const geoHighlights = [
      `Optimized for ${input.targetRegion} audience`,
      `Keywords: ${input.seoKeywords.join(", ")}`,
    ];

    if (input.additionalNotes) geoHighlights.push(input.additionalNotes);

    let generatedImages: { imageUrl: string; prompt: string }[] = [];

    if (input.includeImages && article.imagePrompts?.length) {
      const limiter = pLimit(2);
      try {
        generatedImages = await Promise.all(
          article.imagePrompts.map((prompt) =>
            limiter(() =>
              generateNanoBananaImages([prompt]).then((res) => res[0])
            )
          )
        );
      } catch (imageError) {
        console.warn("Nano Banana image generation skipped:", imageError);
      }
    }

    const titleCheck = await runSpellcheck(article.title, input.targetLanguage);
    article.title = titleCheck.corrected.trim();

    const metaCheck = await runSpellcheck(
      article.metaDescription,
      input.targetLanguage
    );
    article.metaDescription = metaCheck.corrected.trim();

    const excerptCheck = await runSpellcheck(
      article.excerpt,
      input.targetLanguage
    );
    article.excerpt = excerptCheck.corrected.trim();

    const ctaCheck = await runSpellcheck(
      article.callToAction,
      input.targetLanguage
    );
    article.callToAction = ctaCheck.corrected.trim();

    const responsePayload: GenerationResponse = {
      product: productData,
      article: {
        ...article,
      },
      spellingAdjustments: [
        ...sectionAdjustments,
        ...correctedFaqs.adjustments,
        ...titleCheck.adjustments,
        ...metaCheck.adjustments,
        ...excerptCheck.adjustments,
        ...ctaCheck.adjustments,
      ],
      geoHighlights,
      nanoBananaImages: generatedImages.length ? generatedImages : undefined,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? error.flatten()
            : (error as Error).message,
      },
      { status: 400 }
    );
  }
}
