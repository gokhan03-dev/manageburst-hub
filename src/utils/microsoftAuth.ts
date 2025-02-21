
import { MicrosoftAuthConfig } from "@/types/microsoft";

export const getRedirectUri = () => {
  try {
    // Always check if we're in a browser context first
    if (typeof window === 'undefined') {
      return '/auth/microsoft/callback';
    }

    // For local development
    if (window.location.hostname.includes('localhost')) {
      return `http://localhost:8080/auth/microsoft/callback`;
    }
    
    // For all other environments, use the current origin
    return `${window.location.origin}/auth/microsoft/callback`;
    
  } catch (e) {
    console.error('Error getting redirect URI:', e);
    return '/auth/microsoft/callback';
  }
};

export const MICROSOFT_AUTH_CONFIG: MicrosoftAuthConfig = {
  clientId: "04afd4ac-5b4f-4ce5-92c0-b21ac7022d18",
  redirectUri: getRedirectUri(),
  scopes: [
    "Calendars.ReadWrite",
    "offline_access",
    "openid",
    "profile",
    "email"
  ]
};
