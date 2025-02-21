
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    async function loadUserTheme() {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("theme_preference")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          console.error("Error loading theme preference:", error);
          return;
        }

        if (data?.theme_preference) {
          setTheme(data.theme_preference as Theme);
          document.documentElement.classList.toggle("dark", data.theme_preference === "dark");
        }
      } catch (error) {
        console.error("Unexpected error loading theme:", error);
      }
    }

    loadUserTheme();
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (user) {
      try {
        const { error } = await supabase
          .from("user_profiles")
          .upsert(
            {
              id: user.id,
              theme_preference: newTheme,
              email: user.email,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'id'
            }
          );

        if (error) {
          console.error("Error saving theme preference:", error);
          toast({
            title: "Error saving theme preference",
            description: error.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Unexpected error saving theme:", error);
        toast({
          title: "Error saving theme preference",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
