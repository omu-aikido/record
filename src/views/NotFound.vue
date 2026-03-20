<template>
  <div class="bg-base p-4 flex min-h-screen items-center justify-center" data-testid="not-found-page">
    <div class="max-w-lg w-full text-center">
      <img src="/404%20NotFound.png" alt="404 Not Found" class="mb-8 mx-auto h-auto w-full" />
      <h1 class="heading-1 mb-4">ページが見つかりません</h1>
      <p class="text-subtext mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <RouterLink
        to="/"
        class="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 inline-block no-underline transition-colors">
        トップに戻る
      </RouterLink>
    </div>
  </div>
</template>
