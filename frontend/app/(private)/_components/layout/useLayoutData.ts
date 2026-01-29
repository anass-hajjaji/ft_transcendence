import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/api";
import { User } from "@/app/_hooks/global-store";
import { UserProfile } from "./types";


const excludePaths = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/twofa-gpage",
  "/google-auth",
  "/auth-intra",
  "/password",
  "/reset",
];

export function useLayoutData() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const hasAuthCookie = () => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('access_token=') || 
      cookie.trim().startsWith('refresh_token=') ||
      cookie.trim().startsWith('session=')
    );
  };

  useEffect(() => {
    if (!hasAuthCookie()) {
      setUser(null);
      setIsInitializing(false);
      if (!excludePaths.includes(pathname)) {
        router.push("/signin");
      }
    }
  }, [pathname, router]);

  const fetcher = useCallback(async () => {
    const res = await api.get("/auth/me");
    return res.data;
  }, []);

  const { isLoading, isValidating, error, mutate } = useSWR<User>(
    hasAuthCookie() ? "current-user" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      onSuccess(data) {
        setUser(data);
        setIsInitializing(false);
      },
      onError(err) {
        setUser(null);
        setIsInitializing(false);

        if (!excludePaths.includes(pathname)) {
          router.push("/signin");
        }
      },
    }
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        if (res.data && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (error) {
      }
    };

    if (user && user.id_user) {
      fetchUsers();
    }
  }, [user]);

  const isLoadingState = isInitializing || isLoading;

  return {
    user,
    setUser,
    users,
    isLoading: isLoadingState,
    isValidating,
    error,
    mutate,
  };
}
