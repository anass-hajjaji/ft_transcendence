import { useState, useEffect } from "react";
import { AuthUser } from "../types";
import api from "@/lib/api";

export const useUserInfo = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get("/auth/me");
        const data = res.data;
        setUser({
          username: data.username,
          fullName: data.fullName || data.username,
          email: data.email,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { user, loading };
};
