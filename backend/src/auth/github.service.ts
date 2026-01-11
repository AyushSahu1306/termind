import { env } from "../config/env.js"

type GithubTokenResponse = {
    access_token?:string,
    error?:string
}

type GitHubUserResponse = {
  id: number;
  login: string;
  email: string | null;
};

export async function exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token",{
        method:"POST",
        headers:{
           Accept: "application/json",
           "Content-Type": "application/json", 
        },
        body: JSON.stringify({
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code,
        redirect_uri: env.githubCallbackUrl,
      }),
    });

    const data = (await response.json()) as GithubTokenResponse;

    if(!data.access_token){
        throw new Error("Failed to exchange OAuth code");
    }

    return data.access_token;
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUserResponse> {
    const response = await fetch("https://api.github.com/user", {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch GitHub user");
    }

    return response.json();
}