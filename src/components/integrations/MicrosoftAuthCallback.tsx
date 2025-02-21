
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MICROSOFT_AUTH_CONFIG } from "@/utils/microsoftAuth";

// This is the correct client secret from the Microsoft Azure Portal
const MICROSOFT_CLIENT_SECRET = "tUZ8Q~QxHonqcpDfHbAfFAQ5pRtfEKQ0Ss5jrcpS";

export function MicrosoftAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      console.log("Received auth callback with:", { code: !!code, state: !!state, error });

      if (error) {
        console.error("OAuth error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to connect to Microsoft Calendar",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      if (!code || !state) {
        toast({
          title: "Error",
          description: "Invalid authentication response",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      try {
        console.log("Starting token exchange...");
        console.log("Redirect URI:", MICROSOFT_AUTH_CONFIG.redirectUri);
        
        // Parse the state parameter to get the user ID
        const { userId } = JSON.parse(decodeURIComponent(state));
        console.log("User ID from state:", userId);

        const tokenRequestBody = {
          client_id: MICROSOFT_AUTH_CONFIG.clientId,
          scope: MICROSOFT_AUTH_CONFIG.scopes.join(" "),
          code: code,
          redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
          grant_type: "authorization_code",
          client_secret: MICROSOFT_CLIENT_SECRET,
        };

        console.log("Token request parameters:", {
          ...tokenRequestBody,
          client_secret: "[REDACTED]"
        });

        // Exchange the code for tokens
        const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(tokenRequestBody),
        });

        const responseText = await tokenResponse.text();
        console.log("Token response status:", tokenResponse.status);
        
        let tokens;
        try {
          tokens = JSON.parse(responseText);
          console.log("Token response parsed successfully");
        } catch (e) {
          console.error("Failed to parse token response:", responseText);
          throw new Error("Invalid token response");
        }

        if (!tokenResponse.ok || !tokens.refresh_token) {
          console.error("Token exchange failed:", responseText);
          throw new Error("Failed to obtain valid tokens");
        }

        console.log("Token exchange successful, updating user profile...");

        // Store the refresh token in the user's profile
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            microsoft_refresh_token: tokens.refresh_token,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Profile update error:", updateError);
          throw updateError;
        }

        console.log("Refresh token stored successfully");

        // Create or update integration settings
        const { error: settingsError } = await supabase
          .from("integration_settings")
          .upsert({
            user_id: userId,
            integration_type: "microsoft_calendar",
            is_active: true,
            sync_enabled: false,
            config: {
              scope: MICROSOFT_AUTH_CONFIG.scopes.join(" "),
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,integration_type'
          });

        if (settingsError) {
          console.error("Settings update error:", settingsError);
          throw settingsError;
        }

        console.log("Integration settings updated successfully");

        toast({
          title: "Success",
          description: "Successfully connected to Microsoft Calendar",
        });

        // Add a small delay before redirecting to ensure state updates are complete
        setTimeout(() => {
          navigate("/settings");
        }, 1000);

      } catch (error) {
        console.error("Error saving Microsoft integration:", error);
        toast({
          title: "Error",
          description: "Failed to save Microsoft Calendar integration",
          variant: "destructive",
        });
        navigate("/settings");
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Connecting to Microsoft Calendar</h2>
        <p className="text-muted-foreground">Please wait while we complete the setup...</p>
        <div className="mt-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
}
