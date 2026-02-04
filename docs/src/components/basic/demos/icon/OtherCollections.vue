<template>
  <div class="flex flex-wrap gap-6 p-4 border rounded-lg bg-gray-50">
    <!-- Material Design Icons -->
    <div class="flex flex-col items-center gap-2">
      <SunnyIcon icon="mdi:account-circle" class="w-8 h-8 text-blue-600" />
      <span class="text-xs text-gray-500">MDI</span>
    </div>

    <!-- Remix Icon -->
    <div class="flex flex-col items-center gap-2">
      <SunnyIcon icon="ri:heart-3-line" class="w-8 h-8 text-red-500" />
      <span class="text-xs text-gray-500">Remix</span>
    </div>

    <!-- Carbon -->
    <div class="flex flex-col items-center gap-2">
      <SunnyIcon icon="carbon:settings" class="w-8 h-8 text-gray-700" />
      <span class="text-xs text-gray-500">Carbon</span>
    </div>

    <!-- Ant Design -->
    <div class="flex flex-col items-center gap-2">
      <SunnyIcon icon="ant-design:github-filled" class="w-8 h-8 text-black" />
      <span class="text-xs text-gray-500">Ant Design</span>
    </div>
    
    <!-- Emoji One -->
    <div class="flex flex-col items-center gap-2">
      <SunnyIcon icon="emojione:rocket" class="w-8 h-8" />
      <span class="text-xs text-gray-500">Emoji</span>
    </div>
  </div>
</template>
