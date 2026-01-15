import { authenticatedFetch } from "../auth/authenticated-fetch.js";

export async function whoami(): Promise<void> {
  const res = await authenticatedFetch("http://localhost:3000/auth/me");
  
  if (!res.ok) {
    throw new Error("Failed to fetch user identity");
  }

  const user = await res.json();

  console.log("You are logged in as:\n");
  console.log(`  Username: ${user.username ?? "(unknown)"}`);
  console.log(`  Name: ${user.name ?? "(unknown)"}`);
  console.log(`  GitHub ID: ${user.githubId}`);
}