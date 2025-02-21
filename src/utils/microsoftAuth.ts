
import { MicrosoftAuthConfig } from "@/types/microsoft";

export const getRedirectUri = () => {
  try {
    // For local development
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return `http://localhost:8080/auth/microsoft/callback`;
    }
    
    // Default to current hostname for preview and production
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/microsoft/callback`;
    }
    
    // Fallback
    return `${window.location.origin}/auth/microsoft/callback`;
  } catch (e) {
    console.error('Error getting redirect URI:', e);
    return `${window.location.origin}/auth/microsoft/callback`;
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
