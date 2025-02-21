
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MICROSOFT_AUTH_CONFIG } from "@/utils/microsoftAuth";
import { supabase } from "@/integrations/supabase/client";

interface ConnectButtonProps {
  userId: string;
}

export function ConnectButton({ userId }: ConnectButtonProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Generate state parameter for security
      const stateParam = encodeURIComponent(JSON.stringify({
        userId,
        timestamp: Date.now()
      }));

      // Construct Microsoft OAuth URL with all necessary parameters
      const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
      
      // Add required query parameters
      const params = new URLSearchParams({
        client_id: MICROSOFT_AUTH_CONFIG.clientId,
        response_type: "code",
        redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
        scope: MICROSOFT_AUTH_CONFIG.scopes.join(" "),
        response_mode: "query",
        state: stateParam,
        prompt: "select_account"
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
