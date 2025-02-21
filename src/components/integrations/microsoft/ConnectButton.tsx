
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MICROSOFT_AUTH_CONFIG } from "@/utils/microsoftAuth";
import { supabase } from "@/integrations/supabase/client";

interface ConnectButtonProps {
  userId: string;
}

// Function to generate random string for PKCE
function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Function to generate code challenge from verifier
async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function ConnectButton({ userId }: ConnectButtonProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      sessionStorage.setItem('code_verifier', codeVerifier);

      // Generate state parameter for security
      const stateParam = encodeURIComponent(JSON.stringify({
        userId,
        timestamp: Date.now()
      }));

      // Construct Microsoft OAuth URL with PKCE parameters
      const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
      
      // Add required query parameters
      const params = new URLSearchParams({
        client_id: MICROSOFT_AUTH_CONFIG.clientId,
        response_type: "code",
        redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
        scope: MICROSOFT_AUTH_CONFIG.scopes.join(" "),
        response_mode: "query",
        state: stateParam,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "consent"
      });

      authUrl.search = params.toString();

      // Log the full URL for debugging
      console.log("Microsoft Auth URL:", authUrl.toString());
      console.log("Redirect URI:", MICROSOFT_AUTH_CONFIG.redirectUri);

      // Redirect to Microsoft login
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error connecting to Microsoft:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Microsoft Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant="default"
    >
      {isConnecting ? "Connecting..." : "Connect Microsoft Calendar"}
    </Button>
  );
}
