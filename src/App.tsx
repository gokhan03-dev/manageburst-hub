
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MicrosoftAuthCallback } from "@/components/integrations/MicrosoftAuthCallback";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FilterProvider>
          <TaskProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/auth/microsoft/callback" 
                element={
                  <ProtectedRoute>
                    <MicrosoftAuthCallback />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </TaskProvider>
        </FilterProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
