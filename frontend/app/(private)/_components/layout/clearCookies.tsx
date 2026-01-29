export function deleteCookie(name: string) {
      if (typeof document === "undefined") return;
    
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    