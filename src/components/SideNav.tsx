
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { 
  ListTodo, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";

export const SideNav = () => {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <div className="flex h-full flex-col gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <ListTodo className="h-4 w-4" />
            Tasks
          </Button>
          <NavLink to="/settings" className="w-full">
            {({ isActive }) => (
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            )}
          </NavLink>
        </div>
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </Sidebar>
  );
};
