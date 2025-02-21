
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function MicrosoftAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

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
        // Store the auth code in integration_settings
        const { error: updateError } = await supabase
          .from("integration_settings")
          .upsert({
            user_id: state,
            integration_type: "microsoft_calendar",
            config: { auth_code: code },
            is_active: true
          });

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Successfully connected to Microsoft Calendar",
        });
      } catch (error) {
        console.error("Error saving Microsoft integration:", error);
        toast({
          title: "Error",
          description: "Failed to save Microsoft Calendar integration",
          variant: "destructive",
        });
      }

      navigate("/settings");
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
