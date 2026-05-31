<script setup lang="ts">
definePageMeta({
  middleware: "to-dashboard",
});

const { data: page } = await useAsyncData("index", () =>
  queryCollection("index").first(),
);

const title = page.value?.seo?.title || page.value?.title;
const description = page.value?.seo?.description || page.value?.description;

const reportFileData = computed(() => {
  if (!page.value?.report_preview?.file_data) {
    return undefined;
  }

  return {
    fileName: page.value.report_preview.file_data.file_name,
    fileSize: page.value.report_preview.file_data.file_size,
    pages: page.value.report_preview.file_data.pages,
    wordCount: page.value.report_preview.file_data.word_count,
  };
});

useSeoMeta({
  titleTemplate: "",
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: "https://ui.nuxt.com/assets/templates/nuxt/saas-light.png",
});

const componentMap = {
  ai_detection: resolveComponent("LandingAiDetectionReport"),
  originality_report: resolveComponent("LandingOriginalityReport"),
  overall_similarity: resolveComponent("LandingOverallSimilarity"),
};
</script>
<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
    >
      <template #top>
        <HeroBackground />
      </template>

      <template #title>
        <!-- <MDC :value="trust" unwrap="p"/> -->
        <MDC :value="page.title" unwrap="p" />
      </template>

      <template #description>
        <MDC :value="page.description" unwrap="p" />
      </template>

      <LandingAiDetectionReport />
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <component :is="componentMap[section.component]" />
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection
      :title="page.comparison.title"
      :description="page.comparison.description"
    >
      <UPageGrid>
        <UPageCard
          spotlight
          v-for="feature in page.comparison.features"
          :key="feature.title"
          variant="subtle"
          :title="feature.title"
          :description="feature.description"
        >
          <template #header>
            <UIcon :name="feature.icon" class="w-8 h-8 text-primary mx-auto" />
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{
            description:
              'before:content-[open-quote] after:content-[close-quote]',
          }"
        >
          <template #footer>
            <UUser v-bind="testimonial.user" size="lg" />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection :title="page.faq.title" :description="page.faq.description">
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted',
        }"
      />
    </UPageSection>

    <USeparator />

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden">
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
