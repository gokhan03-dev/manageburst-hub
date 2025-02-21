
import { MicrosoftAuthConfig } from "@/types/microsoft";

export const getRedirectUri = () => {
  try {
    // For local development
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return `http://localhost:8080/auth/microsoft/callback`;
    }
    
    // For preview environment with id
    if (typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com')) {
      const previewId = window.location.hostname.split('.')[0];
      return `https://${previewId}.lovableproject.com/auth/microsoft/callback`;
    }
    
    // Production URL
    return 'https://lovable-calendar-app.up.railway.app/auth/microsoft/callback';
  } catch (e) {
    console.error('Error getting redirect URI:', e);
    return 'https://lovable-calendar-app.up.railway.app/auth/microsoft/callback';
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
