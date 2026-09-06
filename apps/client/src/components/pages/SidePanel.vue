<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <button type="button" class="w-8 h-8 m-4" aria-label="メニューを開く">
        <div class="i-lucide:menu" />
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="backdrop" />
      <DialogContent class="drawer">
        <DialogTitle class="sr-only">サイドメニュー</DialogTitle>
        <DialogDescription class="sr-only">メニューを開いてページを移動できます</DialogDescription>

        <div class="drawer-header mt-4 mr-4 flex justify-end">
          <DialogClose as-child>
            <button type="button" class="close-btn" aria-label="メニューを閉じる">
              <div class="i-lucide:panel-right-close" />
            </button>
          </DialogClose>
        </div>

        <div class="mx-5">
          <Show when="signed-in">
            <nav class="mt-6 gap-5 flex flex-col">
              <RouterLink to="/" class="flex-inline gap-2 text items-center" @click="close">
                <div class="i-lucide:layout-dashboard" />
                トップ
              </RouterLink>
              <RouterLink to="/record" class="flex-inline gap-2 text items-center" @click="close">
                <div class="i-lucide:clipboard-list" />
                活動記録
              </RouterLink>
              <RouterLink to="/account" class="flex-inline gap-2 text items-center" @click="close">
                <UserAvatar alt="User Avatar" rounded />
                アカウント設定
              </RouterLink>
              <hr />
              <a
                href="https://omu-aikido.com/calendar"
                class="flex-inline gap-2 text items-center"
                target="_blank"
                rel="noopener noreferrer"
                @click="close">
                <div class="i-lucide:calendar" />
                カレンダー ↗
              </a>
              <a
                href="https://omu-aikido.com/apps"
                class="flex-inline gap-2 text items-center"
                target="_blank"
                rel="noopener noreferrer"
                @click="close">
                <div class="i-lucide:tool-case" />
                便利ツール ↗
              </a>
            </nav>
          </Show>
        </div>

        <Show when="signed-in">
          <hr class="my-5 mx-2" />
          <SignOutButton>
            <button type="button" class="gap-2 mx-5 text flex w-full items-center">
              <div class="i-lucide:log-out" />
              ログアウト
            </button>
          </SignOutButton>
        </Show>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import { Show, SignOutButton, UserAvatar } from "@clerk/vue";

const isOpen = ref(false);

const close = () => {
  isOpen.value = false;
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 100;
  animation: backdrop-enter 300ms ease-out;
}

.backdrop[data-state="closed"] {
  animation: backdrop-leave 200ms ease-in;
}

@keyframes backdrop-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes backdrop-leave {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.drawer {
  position: fixed;
  height: 100%;
  width: 100%;
  max-width: 20rem;
  z-index: 101;
  --at-apply: top-0 right-0 bg-base opacity-90;
  animation: drawer-enter 300ms ease-out;
}

.drawer[data-state="closed"] {
  animation: drawer-leave 200ms ease-in;
}

@keyframes drawer-enter {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes drawer-leave {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
