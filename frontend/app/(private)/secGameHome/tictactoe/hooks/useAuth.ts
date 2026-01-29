import { useState, useEffect } from "react";
import { UserInfo } from "../types";
import api from "@/lib/api";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

        if (!token) {
          setAuthError("Not authenticated. Please login.");
          return;
        }

        setJwtToken(token);

        const res = await api.get("/auth/me");
        const data = res.data;
        setCurrentUser({
          username: data.username,
          fullName: data.fullName || data.username,
        });
      } catch (error) {
        setAuthError("Connection error. Please try again.");
      }
    };

    fetchUserInfo();
  }, []);

  return { currentUser, jwtToken, authError };
}
