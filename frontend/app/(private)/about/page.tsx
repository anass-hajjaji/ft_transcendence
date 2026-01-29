import { cookies } from "next/headers";
import AboutPageClient from "./AboutPageClient";
import AboutPageWrapper from "./AboutPageWrapper";

// Server Component - fetches data on the server
async function getUserData() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8443/api";
    
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Cookie": `access_token=${accessToken}`,
      },
      cache: "no-store",
      // Add these to handle self-signed certificates in development
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error("Failed to fetch user data:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default async function AboutPage() {
  const userData = await getUserData();

  // If server-side fetch fails, use client-side fallback
  if (!userData) {
    return <AboutPageWrapper />;
  }

  return <AboutPageClient user={userData} />;
}