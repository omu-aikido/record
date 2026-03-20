<template>
  <div v-if="hasError" class="bg-base p-4 flex min-h-screen items-center justify-center" data-testid="error-boundary">
    <div class="max-w-lg w-full text-center">
      <img src="/500%20InternalServerError.png" alt="500 Internal Server Error" class="mb-8 mx-auto h-auto w-full" />
      <p class="text-subtext mb-8">予期せぬエラーが発生しました。しばらく時間を置いてから再度お試しください。</p>
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-500/10 border-red-500 rounded-lg border"
        data-testid="error-content">
        <p class="text-sm text-red-500 font-mono text-left break-words">
          {{ errorMessage }}
        </p>
      </div>

      <div class="gap-3 flex flex-col">
        <button
          class="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 w-full cursor-pointer border-none transition-colors"
          data-testid="reload-btn"
          @click="handleReload">
          ページを再読み込み
        </button>
        <button
          class="px-6 py-3 bg-overlay1 text font-medium rounded-lg hover:bg-overlay0 w-full cursor-pointer border-none transition-colors"
          data-testid="home-btn"
          @click="handleGoHome">
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';

const router = useRouter();

const hasError = ref(false);
const errorMessage = ref('');

const handleReload = () => {
  window.location.reload();
};

const handleGoHome = () => {
  hasError.value = false;
  errorMessage.value = '';
  router.push('/');
};

// エラーキャプチャハンドラー
const handleError = (err: Error, _instance: unknown, info: string) => {
  console.error('ErrorBoundary caught an error:', err, info);
  hasError.value = true;
  errorMessage.value = err.message || '不明なエラーが発生しました';

  // エラーを伝播させない
  return false;
};

onErrorCaptured(handleError);

// グローバルエラーハンドラー
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error handler:', event.error);
  hasError.value = true;
  errorMessage.value = event.error?.message || '不明なエラーが発生しました';
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  hasError.value = true;
  errorMessage.value = event.reason instanceof Error ? event.reason.message : 'Promiseが拒否されました';
};

// グローバルエラーハンドラーの登録
onMounted(() => {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});

// クリーンアップ
onUnmounted(() => {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>
