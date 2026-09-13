import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { handleStaticApiRequest } from "./lib/staticDemoFallback";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (typeof window === "undefined" || window.location.hostname.endsWith("github.io")) return;
  if (!(error instanceof TRPCClientError)) return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("app-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      async fetch(input, init) {
        const urlStr =
          typeof input === "string"
            ? input
            : input instanceof URL
            ? input.toString()
            : (input as Request).url;
        const method =
          init?.method ||
          (typeof input !== "string" && !(input instanceof URL)
            ? (input as Request).method
            : "GET");

        const isStaticHost =
          typeof window !== "undefined" &&
          (window.location.hostname.endsWith("github.io") ||
            window.location.protocol === "file:");

        if (isStaticHost && urlStr.includes("/api/trpc")) {
          try {
            const urlObj = new URL(urlStr, window.location.origin);
            const body = init?.body ? JSON.parse(init.body as string) : undefined;
            const fallbackResponse = handleStaticApiRequest(
              urlObj.pathname,
              method,
              body,
              urlObj.searchParams
            );
            if (fallbackResponse) return fallbackResponse;
          } catch (e) {
            console.warn("[Demo Mode] Fallback parsing:", e);
          }
        }

        try {
          const res = await globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });
          if (res.ok || res.status !== 404) {
            return res;
          }
        } catch {
          // Network failed or offline
        }

        if (urlStr.includes("/api/trpc")) {
          try {
            const urlObj = new URL(urlStr, window.location.origin);
            const body = init?.body ? JSON.parse(init.body as string) : undefined;
            const fallbackResponse = handleStaticApiRequest(
              urlObj.pathname,
              method,
              body,
              urlObj.searchParams
            );
            if (fallbackResponse) return fallbackResponse;
          } catch {}
        }

        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
