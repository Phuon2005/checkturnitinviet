import { defineCollection, z } from "@nuxt/content";

const variantEnum = z.enum([
  "solid",
  "outline",
  "subtle",
  "soft",
  "ghost",
  "link",
]);
const colorEnum = z.enum([
  "primary",
  "secondary",
  "neutral",
  "error",
  "warning",
  "success",
  "info",
]);
const sizeEnum = z.enum(["xs", "sm", "md", "lg", "xl"]);
const orientationEnum = z.enum(["vertical", "horizontal"]);

const createBaseSchema = () =>
  z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
  });

const createFeatureItemSchema = () =>
  createBaseSchema().extend({
    icon: z.string().nonempty().editor({ input: "icon" }),
  });

const createLinkSchema = () =>
  z.object({
    label: z.string().nonempty(),
    to: z.string().nonempty(),
    icon: z.string().optional().editor({ input: "icon" }),
    size: sizeEnum.optional(),
    trailing: z.boolean().optional(),
    target: z.string().optional(),
    color: colorEnum.optional(),
    variant: variantEnum.optional(),
  });

const createImageSchema = () =>
  z.object({
    src: z.string().nonempty().editor({ input: "media" }),
    alt: z.string().optional(),
    loading: z.enum(["lazy", "eager"]).optional(),
    srcset: z.string().optional(),
  });

export const collections = {
  index: defineCollection({
    source: "index.yml",
    type: "page",
    schema: z.object({
      hero: z.object({
        links: z.array(createLinkSchema()),
      }),
      report_preview: createBaseSchema().extend({
        ai_score: z.number(),
        similarity_score: z.number(),
        footnote: z.string().nonempty(),
        file_data: z.object({
          file_name: z.string().nonempty(),
          file_size: z.number(),
          pages: z.number(),
          word_count: z.number(),
        }),
      }),
      comparison: createBaseSchema().extend({
        competitors: z.string().nonempty(),
        features: z.array(createFeatureItemSchema()),
      }),
      sections: z.array(
        createBaseSchema().extend({
          id: z.string().nonempty(),
          orientation: orientationEnum.optional(),
          reverse: z.boolean().optional(),
          features: z.array(createFeatureItemSchema()),
          component: z.enum([
            "ai_detection",
            "originality_report",
            "overall_similarity",
          ]),
        }),
      ),
      testimonials: createBaseSchema().extend({
        headline: z.string().optional(),
        items: z.array(
          z.object({
            quote: z.string().nonempty(),
            user: z.object({
              name: z.string().nonempty(),
              description: z.string().nonempty(),
              to: z.string().nonempty(),
              target: z.string().nonempty(),
              avatar: createImageSchema(),
            }),
          }),
        ),
      }),
      faq: createBaseSchema().extend({
        items: z.array(
          z.object({
            label: z.string().nonempty(),
            content: z.string().nonempty(),
            icon: z.string().nonempty().editor({ input: "icon" }),
          }),
        ),
      }),
      cta: createBaseSchema().extend({
        links: z.array(createLinkSchema()),
      }),
    }),
  }),
};
