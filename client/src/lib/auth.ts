import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  sapphireBalance: number;
  dailyClaimed: number;
  lastClaimDate: Date | null;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export async function signup(email: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/signup", { email, password });
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
