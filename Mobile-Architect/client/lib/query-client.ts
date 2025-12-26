import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // Try Replit domain first, then localhost
  let host = process.env.EXPO_PUBLIC_DOMAIN;
  
  if (!host) {
    // Try to get from Constants (Expo)
    try {
      const Constants = require('expo-constants').default;
      if (Constants?.expoConfig?.extra?.apiUrl) {
        host = Constants.expoConfig.extra.apiUrl.replace(/^https?:\/\//, '');
      }
    } catch (e) {
      // Constants not available
    }
    
    if (!host) {
      // For mobile devices, use the computer's local IP or localhost
      // On web, use localhost
      if (typeof window !== 'undefined') {
        // Web environment
        host = "localhost:5000";
      } else {
        // React Native - default to localhost, but user should set EXPO_PUBLIC_DOMAIN
        // We'll try to detect from the Metro bundler URL if available
        host = "localhost:5000";
      }
    }
  }

  // Handle cases where host might already include protocol
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }

  // Use http for localhost/127.0.0.1/local IPs, https for other domains
  const isLocal = host.includes("localhost") || 
                  host.includes("127.0.0.1") || 
                  host.match(/^192\.168\./) ||
                  host.match(/^10\./) ||
                  host.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
  const protocol = isLocal ? "http" : "https";
  let url = new URL(`${protocol}://${host}`);

  return url.href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: 2, // Retry failed requests twice
      retryDelay: 1000, // Wait 1 second between retries
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
