import { clerkPlugin } from "@clerk/vue";
import { createApp } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

// oxlint-disable import/no-unassigned-import
import "./assets/main.css";
import "virtual:uno.css";

import App from "./App.vue";
import { isIgnoredBrowserInternalError } from "./lib/browserInternalError";
import router from "./router";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (PUBLISHABLE_KEY === null || PUBLISHABLE_KEY === undefined) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required");
}

const app = createApp(App);

app.config.errorHandler = (error, _instance, info) => {
  if (isIgnoredBrowserInternalError(error)) {
    return;
  }

  console.error("Vue app error:", error, info);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY });
app.use(VueQueryPlugin, { queryClient });

app.use(router);
app.mount("#app");
