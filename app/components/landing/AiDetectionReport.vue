<template>
  <div
    class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 font-sans"
  >
    <div class="flex flex-col md:flex-row gap-6 justify-between items-start">
      <div class="flex-1">
        <h2
          class="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight"
        >
          91% detected as AI
        </h2>
        <p class="text-sm text-gray-800 leading-relaxed font-medium">
          The percentage indicates the combined amount of likely AI-generated
          text as well as likely AI-generated text that was also likely
          AI-paraphrased.
        </p>
      </div>

      <div
        class="flex-1 bg-[#D9EAF7] rounded-xl p-5 text-sm text-gray-900 w-full"
      >
        <p class="font-bold mb-3 text-[13px]">Caution: Review required.</p>
        <p class="leading-relaxed">
          It is essential to understand the limitations of AI detection before
          making decisions about a student's work. We encourage you to learn
          more about Turnitin's AI detection capabilities before using the tool.
        </p>
      </div>
    </div>

    <hr class="my-6 border-gray-200" />

    <div class="space-y-6">
      <div class="flex items-start gap-4">
        <div
          class="mt-1 bg-teal-200 text-black rounded-full w-7 h-7 flex items-center justify-center shrink-0"
        >
          <UIcon name="i-heroicons-sparkles-solid" class="w-4 h-4" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900">
            <span class="mr-1">11</span> AI-generated only 91%
          </p>
          <p class="text-sm text-gray-600 mt-1 leading-relaxed">
            Likely AI-generated text from a large-language model.
          </p>
        </div>
      </div>

      <div class="flex items-start gap-4">
        <div
          class="mt-1 bg-purple-200 text-black rounded-full w-7 h-7 flex items-center justify-center shrink-0"
        >
          <UIcon
            name="i-heroicons-arrow-path-rounded-square-solid"
            class="w-4 h-4"
          />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900">
            <span class="mr-1">0</span> AI-generated text that was
            AI-paraphrased 0%
          </p>
          <p class="text-sm text-gray-600 mt-1 leading-relaxed">
            Likely AI-generated text that was likely revised using an
            AI-paraphrase tool or word spinner.
          </p>
        </div>
      </div>
    </div>

    <hr class="my-6 border-gray-200" />

    <div>
      <p class="text-xs font-bold text-gray-900 mb-1">Disclaimer</p>
      <p class="text-xs text-gray-600 leading-relaxed">
        Our AI writing assessment is designed to help educators identify text
        that might be prepared by a generative AI tool. Our AI writing
        assessment may not always be accurate (i.e., our AI models may produce
        either false positive results or false negative results), so it should
        not be used as the sole basis for adverse actions against a student. It
        takes further scrutiny and human judgment in conjunction with an
        organization's application of its specific academic policies to
        determine whether any academic misconduct has occurred.
      </p>
    </div>
  </div>
</template>
