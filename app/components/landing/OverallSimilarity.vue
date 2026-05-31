<template>
  <div
    class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 font-sans max-w-4xl mx-auto"
  >
    <h2
      class="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight"
    >
      29% Overall Similarity
    </h2>
    <p class="text-sm text-gray-500 mb-10 font-medium">
      The combined total of all matches, including overlapping sources, for each
      database.
    </p>

    <div class="mb-10">
      <h3 class="text-[17px] font-bold text-gray-800 mb-5">
        Filtered from the Report
      </h3>
      <ul class="space-y-4">
        <li class="flex items-center text-gray-700 text-sm font-medium">
          <span class="w-1 h-1 rounded-full bg-gray-600 mr-4"></span>
          Bibliography
        </li>
        <li class="flex items-center text-gray-700 text-sm font-medium">
          <span class="w-1 h-1 rounded-full bg-gray-600 mr-4"></span>
          Quoted Text
        </li>
        <li class="flex items-center text-gray-700 text-sm font-medium">
          <span class="w-1 h-1 rounded-full bg-gray-600 mr-4"></span>
          Cited Text
        </li>
        <li class="flex items-center text-gray-700 text-sm font-medium">
          <span class="w-1 h-1 rounded-full bg-gray-600 mr-4"></span>
          Small Matches (less than 8 words)
        </li>
      </ul>
    </div>

    <hr class="my-8 border-gray-200" />

    <div>
      <h3 class="text-[17px] font-bold text-gray-800 mb-6">Top Sources</h3>
      <div class="space-y-5">
        <div class="flex items-center">
          <span class="w-16 text-gray-800 font-medium text-sm">15%</span>
          <UIcon
            name="i-heroicons-globe-alt-solid"
            class="w-5 h-5 text-gray-400 mr-4"
          />
          <span class="text-gray-700 text-sm font-medium"
            >Internet sources</span
          >
        </div>
        <div class="flex items-center">
          <span class="w-16 text-gray-800 font-medium text-sm">6%</span>
          <UIcon
            name="i-heroicons-book-open-solid"
            class="w-5 h-5 text-gray-400 mr-4"
          />
          <span class="text-gray-700 text-sm font-medium">Publications</span>
        </div>
        <div class="flex items-center">
          <span class="w-16 text-gray-800 font-medium text-sm">27%</span>
          <UIcon
            name="i-heroicons-user-solid"
            class="w-5 h-5 text-gray-400 mr-4"
          />
          <span class="text-gray-700 text-sm font-medium"
            >Submitted works (Student Papers)</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
