<script setup lang="ts">
const router = useRouter()
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

const reportFileData = computed(() => {
  if (!page.value?.report_preview?.file_data) {
    return undefined
  }

  return {
    fileName: page.value.report_preview.file_data.file_name,
    fileSize: page.value.report_preview.file_data.file_size,
    pages: page.value.report_preview.file_data.pages,
    wordCount: page.value.report_preview.file_data.word_count
  }
})

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/saas-light.png'
})

const trust = `
::badge
**Được tin tưởng bởi 50,000+ người dùng**
::
`

const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) router.replace('/dashboard')
})
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description" :links="page.hero.links">
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

      <div class="mt-8 w-full max-w-3xl mx-auto">
        <UCard variant="subtle" class="backdrop-blur border border-default">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <UIcon name="i-lucide-zap" class="w-5 h-5 text-primary" />
              </div>

              <div>
                <p class="font-semibold">
                  Xử lý nhanh
                </p>
                <p class="text-sm text-muted">
                  Kết quả trong khoảng 2–5 phút
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <UIcon name="i-lucide-badge-dollar-sign" class="w-5 h-5 text-primary" />
              </div>

              <div>
                <p class="font-semibold">
                  Giá cạnh tranh
                </p>
                <p class="text-sm text-muted">
                  Chỉ trả tiền theo số credit sử dụng
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-primary" />
              </div>

              <div>
                <p class="font-semibold">
                  Riêng tư & bảo mật
                </p>
                <p class="text-sm text-muted">
                  File của bạn được xử lý an toàn
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UPageHero>

    <UPageSection :title="page.process.title" :description="page.process.description">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="(step, index) in page.process.steps" :key="index" class="text-center">
          <div class="flex justify-center mb-4">
            <UIcon :name="step.icon" class="w-12 h-12 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ step.title }}</h3>
          <p class="text-muted">{{ step.description }}</p>
          <div class="mt-4 text-2xl font-bold text-primary">{{ index + 1 }}</div>
        </div>
      </div>
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection :title="page.report_preview.title" :description="page.report_preview.description">
      <ReportOutput :ai-score="page.report_preview.ai_score" :similarity-score="page.report_preview.similarity_score"
        :file-data="reportFileData" :footer-text="page.report_preview.footnote" />
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection :title="page.comparison.title" :description="page.comparison.description">
      <UPageGrid>
        <UPageCard v-for="feature in page.comparison.features" :key="feature.title" variant="subtle"
          :title="feature.title" :description="feature.description">
          <template #header>
            <UIcon :name="feature.icon" class="w-8 h-8 text-primary mx-auto" />
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <!-- <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection> -->

    <USeparator class="mx-auto w-48" />
    <UPageSection id="testimonials" :headline="page.testimonials.headline" :title="page.testimonials.title"
      :description="page.testimonials.description">
      <UPageColumns class="xl:columns-4">
        <UPageCard v-for="(testimonial, index) in page.testimonials.items" :key="index" variant="subtle"
          :description="testimonial.quote"
          :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }">
          <template #footer>
            <UUser v-bind="testimonial.user" size="lg" />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator class="mx-auto w-48" />
    <UPageSection :title="page.faq.title" :description="page.faq.description">
      <UAccordion :items="page.faq.items" :unmount-on-hide="false" :default-value="['0']" type="multiple"
        class="max-w-3xl mx-auto" :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted'
        }" />
    </UPageSection>

    <USeparator />

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden">
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
