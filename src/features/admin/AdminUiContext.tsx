"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { emailMatchesAdminList } from "@/lib/admin-auth";

const ADMIN_MODE_STORAGE_KEY = "cinemergence:admin-mode";
const ADMIN_MODE_EVENT = "cinemergence:admin-mode-change";

type AdminUiContextValue = {
  isSignedIn: boolean;
  userEmail: string | null;
  avatarSrc: string | null;
  isAdminEligible: boolean;
  isFormateurEligible: boolean;
  isIntervenantEligible: boolean;
  isAdminMode: boolean;
  setAdminMode: (next: boolean) => void;
  toggleAdminMode: () => void;
  refreshSessionChrome: () => void;
};

type SessionChrome = {
  avatarSrc: string | null;
  isFormateurEligible: boolean;
  isIntervenantEligible: boolean;
};

type SessionChromeResponse =
  | { signedIn: false }
  | ({ signedIn: true } & SessionChrome);

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

function readAdminModeSnapshot(isAdminEligible: boolean): boolean {
  if (!isAdminEligible || typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "true";
}

function subscribeAdminMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== ADMIN_MODE_STORAGE_KEY) return;
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ADMIN_MODE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ADMIN_MODE_EVENT, onStoreChange);
  };
}

function writeAdminMode(next: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_MODE_STORAGE_KEY, next ? "true" : "false");
  window.dispatchEvent(new Event(ADMIN_MODE_EVENT));
}

function liveClerkEmails(
  user: ReturnType<typeof useUser>["user"],
  fallbackEmail: string | null,
): string[] {
  const emails = [
    user?.primaryEmailAddress?.emailAddress,
    ...(user?.emailAddresses.map((entry) => entry.emailAddress) ?? []),
    fallbackEmail,
  ].filter((value): value is string => Boolean(value));
  return [...new Set(emails)];
}

export function AdminUiProvider({
  adminEmails,
  children,
}: {
  adminEmails: string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn: clerkSignedIn, userId } = useAuth();
  const { user } = useUser();
  const prevUserId = useRef<string | null | undefined>(undefined);
  const [chrome, setChrome] = useState<SessionChrome | null>(null);
  const [chromeToken, setChromeToken] = useState(0);

  const emails = liveClerkEmails(user, null);
  const userEmail = emails[0] ?? null;
  const isSignedIn = Boolean(clerkSignedIn);
  const fromLiveEmail = emails.some((email) => emailMatchesAdminList(email, adminEmails));
  const isAdminEligible = isSignedIn && fromLiveEmail;
  const isFormateurEligible = isSignedIn && Boolean(chrome?.isFormateurEligible);
  const isIntervenantEligible = isSignedIn && Boolean(chrome?.isIntervenantEligible);
  const avatarSrc = isSignedIn ? (chrome?.avatarSrc ?? null) : null;

  const refreshSessionChrome = useCallback(() => {
    setChromeToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded || !clerkSignedIn || !userId) {
      setChrome(null);
      return;
    }

    const controller = new AbortController();
    fetch("/api/session-chrome", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as SessionChromeResponse;
      })
      .then((data) => {
        if (!data?.signedIn) {
          setChrome(null);
          return;
        }
        setChrome({
          avatarSrc: typeof data.avatarSrc === "string" ? data.avatarSrc : null,
          isFormateurEligible: data.isFormateurEligible,
          isIntervenantEligible: data.isIntervenantEligible,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setChrome(null);
      });

    return () => controller.abort();
  }, [chromeToken, clerkSignedIn, isLoaded, userId]);

  const isAdminMode = useSyncExternalStore(
    subscribeAdminMode,
    () => readAdminModeSnapshot(isAdminEligible),
    () => false,
  );

  useEffect(() => {
    if (!isLoaded) return;
    const nextId = userId ?? null;
    if (prevUserId.current === undefined) {
      prevUserId.current = nextId;
      return;
    }
    if (prevUserId.current === nextId) return;
    prevUserId.current = nextId;
    router.refresh();
  }, [isLoaded, router, userId]);

  const value = useMemo<AdminUiContextValue>(
    () => ({
      isSignedIn,
      userEmail,
      avatarSrc,
      isAdminEligible,
      isFormateurEligible,
      isIntervenantEligible,
      isAdminMode,
      refreshSessionChrome,
      setAdminMode: (next) => {
        if (!isAdminEligible) return;
        writeAdminMode(next);
      },
      toggleAdminMode: () => {
        if (!isAdminEligible) return;
        writeAdminMode(!isAdminMode);
      },
    }),
    [
      avatarSrc,
      isAdminEligible,
      isFormateurEligible,
      isIntervenantEligible,
      isAdminMode,
      isSignedIn,
      refreshSessionChrome,
      userEmail,
    ],
  );

  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) {
    throw new Error("useAdminUi must be used within AdminUiProvider");
  }
  return ctx;
}
