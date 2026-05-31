<template>
  <div
    class="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100 font-sans max-w-3xl mx-auto"
  >
    <div class="mb-5">
      <h3 class="text-xl text-gray-700 font-medium">QTCL-GUCCI.docx</h3>
    </div>

    <div
      class="mb-4 text-[11px] font-bold text-[#E33539] tracking-[0.1em] uppercase border-b border-[#E33539] pb-2 inline-block w-full"
    >
      ORIGINALITY REPORT
    </div>

    <div class="grid grid-cols-4 gap-4 mb-8 pt-4">
      <div class="text-center flex flex-col items-center">
        <div class="flex items-start justify-center">
          <span class="text-6xl font-light text-[#E33539] leading-none">4</span>
          <span class="text-2xl text-[#E33539] leading-none mt-1">%</span>
        </div>
        <p class="text-[10px] text-gray-500 tracking-[0.1em] mt-3 uppercase">
          SIMILARITY INDEX
        </p>
      </div>
      <div class="text-center flex flex-col items-center">
        <div class="flex items-start justify-center">
          <span class="text-4xl font-light text-gray-700 leading-none mt-2"
            >3</span
          >
          <span class="text-lg text-gray-700 leading-none mt-2">%</span>
        </div>
        <p class="text-[10px] text-gray-500 tracking-[0.1em] mt-4 uppercase">
          INTERNET SOURCES
        </p>
      </div>
      <div class="text-center flex flex-col items-center">
        <div class="flex items-start justify-center">
          <span class="text-4xl font-light text-gray-700 leading-none mt-2"
            >10</span
          >
          <span class="text-lg text-gray-700 leading-none mt-2">%</span>
        </div>
        <p class="text-[10px] text-gray-500 tracking-[0.1em] mt-4 uppercase">
          PUBLICATIONS
        </p>
      </div>
      <div class="text-center flex flex-col items-center">
        <div class="flex items-start justify-center">
          <span class="text-4xl font-light text-gray-700 leading-none mt-2"
            >5</span
          >
          <span class="text-lg text-gray-700 leading-none mt-2">%</span>
        </div>
        <p class="text-[10px] text-gray-500 tracking-[0.1em] mt-4 uppercase">
          STUDENT PAPERS
        </p>
      </div>
    </div>

    <div
      class="mb-2 text-[11px] font-bold text-[#E33539] tracking-[0.1em] uppercase border-b border-[#E33539] pb-2 inline-block w-full mt-4"
    >
      PRIMARY SOURCES
    </div>

    <div class="space-y-0 mt-2">
      <!-- Item 1 -->
      <div class="flex items-start py-5 border-b border-gray-200">
        <div
          class="w-10 h-10 bg-[#E33539] text-white flex items-center justify-center text-lg font-medium mr-5 shrink-0"
        >
          1
        </div>
        <div class="flex-1 mt-0.5">
          <p
            class="text-[17px] text-[#E33539] mb-1 hover:underline cursor-pointer"
          >
            dulieu.tailieuhoctap.vn
          </p>
          <p class="text-xs text-gray-400 font-medium">Internet Source</p>
        </div>
        <div class="flex items-start ml-4">
          <span class="text-4xl font-light text-gray-700 leading-none">2</span>
          <span class="text-lg text-gray-700 leading-none">%</span>
        </div>
      </div>

      <!-- Item 2 -->
      <div class="flex items-start py-5 border-b border-gray-200">
        <div
          class="w-10 h-10 bg-[#CF14AC] text-white flex items-center justify-center text-lg font-medium mr-5 shrink-0"
        >
          2
        </div>
        <div class="flex-1 mt-0.5">
          <p
            class="text-[17px] text-[#CF14AC] mb-1 hover:underline cursor-pointer"
          >
            www.ctu.edu.vn
          </p>
          <p class="text-xs text-gray-400 font-medium">Internet Source</p>
        </div>
        <div class="flex items-start ml-4">
          <span class="text-4xl font-light text-gray-700 leading-none">1</span>
          <span class="text-lg text-gray-700 leading-none">%</span>
        </div>
      </div>

      <!-- Item 3 -->
      <div class="flex items-start py-5 border-b border-gray-200">
        <div
          class="w-10 h-10 bg-[#7627BD] text-white flex items-center justify-center text-lg font-medium mr-5 shrink-0"
        >
          3
        </div>
        <div class="flex-1 mt-0.5">
          <p
            class="text-[17px] text-[#7627BD] mb-1 hover:underline cursor-pointer"
          >
            Submitted to National Economics University
          </p>
          <p class="text-xs text-gray-400 font-medium">Student Paper</p>
        </div>
        <div class="flex items-start ml-4">
          <span class="text-4xl font-light text-gray-700 leading-none">1</span>
          <span class="text-lg text-gray-700 leading-none">%</span>
        </div>
      </div>

      <!-- Item 4 -->
      <div class="flex items-start py-5 border-b border-gray-200">
        <div
          class="w-10 h-10 bg-[#16A09C] text-white flex items-center justify-center text-lg font-medium mr-5 shrink-0"
        >
          4
        </div>
        <div class="flex-1 mt-0.5">
          <p
            class="text-[17px] text-[#16A09C] mb-1 hover:underline cursor-pointer"
          >
            Banking Academy
          </p>
          <p class="text-xs text-gray-400 font-medium">Publication</p>
        </div>
        <div class="flex items-start ml-4">
          <span class="text-4xl font-light text-gray-700 leading-none">1</span>
          <span class="text-lg text-gray-700 leading-none">%</span>
        </div>
      </div>
    </div>

    <div
      class="mt-16 flex flex-col sm:flex-row justify-between text-xs text-gray-500 font-medium"
    >
      <div class="grid grid-cols-2 gap-x-12 gap-y-3">
        <span class="text-gray-400">Exclude quotes</span>
        <span>On</span>
        <span class="text-gray-400">Exclude bibliography</span>
        <span>On</span>
      </div>
      <div class="flex gap-12 mt-4 sm:mt-0">
        <span class="text-gray-400">Exclude matches</span>
        <span>&lt; 1%</span>
      </div>
    </div>
  </div>
</template>
