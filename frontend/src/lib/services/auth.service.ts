import { api, setAccessToken } from "@/lib/api-client";
import { RawUser } from "@/types/api";

export interface AuthResult {
  user: RawUser;
  accessToken: string;
}

export async function registerUser(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const data = await api.post<AuthResult>("/auth/register", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResult> {
  const data = await api.post<AuthResult>("/auth/login", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function getCurrentUser(): Promise<RawUser> {
  const data = await api.get<{ user: RawUser }>("/auth/me");
  return data.user;
}
