<template>
  <button class="w-8 h-8 m-4" aria-label="メニューを開く" @click="open">
    <div class="i-lucide:menu" />
  </button>

  <Teleport to="body">
    <Transition
      enter-active-class="backdrop-enter"
      enter-from-class="backdrop-enter-from"
      enter-to-class="backdrop-enter-to"
      leave-active-class="backdrop-leave"
      leave-from-class="backdrop-enter-to"
      leave-to-class="backdrop-enter-from">
      <div v-if="isOpen" class="backdrop" aria-hidden="true" @click="close" />
    </Transition>

    <Transition
      enter-active-class="drawer-enter"
      enter-from-class="drawer-enter-from"
      enter-to-class="drawer-enter-to"
      leave-active-class="drawer-leave"
      leave-from-class="drawer-enter-to"
      leave-to-class="drawer-enter-from">
      <div v-if="isOpen" class="drawer" role="dialog" aria-modal="true" aria-label="サイドメニュー">
        <div class="drawer-header mt-4 mr-4 flex justify-end">
          <button class="close-btn" aria-label="メニューを閉じる" @click="close">
            <div class="i-lucide:panel-right-close" />
          </button>
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
                @click="close">
                <div class="i-lucide:calendar" />
                カレンダー ↗
              </a>
            </nav>
          </Show>
        </div>

        <Show when="signed-in">
          <hr class="my-5 mx-2" />
          <SignOutButton>
            <button class="gap-2 mx-5 text flex w-full items-center">
              <div class="i-lucide:log-out" />
              ログアウト
            </button>
          </SignOutButton>
        </Show>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, watch } from 'vue';
import { Show, SignOutButton, UserAvatar } from '@clerk/vue';

// State
const isOpen = ref(false);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

// Inert & Scroll Lock Logic
watch(isOpen, (value) => {
  const app = document.querySelector('#app');
  if (value) {
    // Open
    if (app) app.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
  } else {
    // Close
    if (app) app.removeAttribute('inert');
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.backdrop-enter {
  transition: opacity 300ms ease-out;
}

.backdrop-leave {
  transition: opacity 200ms ease-in;
}

.backdrop-enter-from {
  opacity: 0;
}

.backdrop-enter-to {
  opacity: 1;
}

.drawer {
  position: fixed;
  height: 100%;
  width: 100%;
  max-width: 20rem;
  z-index: 101;
  --at-apply: top-0 right-0 bg-base opacity-90;
}

.drawer-enter {
  transition: transform 300ms ease-out;
}

.drawer-leave {
  transition: transform 200ms ease-in;
}

.drawer-enter-from {
  transform: translateX(100%);
}

.drawer-enter-to {
  transform: translateX(0);
}
</style>
