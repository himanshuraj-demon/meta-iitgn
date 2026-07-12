"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";

const SettingsModal = dynamic(() => import("@/components/SettingsModal"), {
  ssr: false,
});

function SettingsModalTrigger() {
  const { settingsTab, setSettingsTab } = useAuth();
  
  if (!settingsTab) return null;
  
  return <SettingsModal initialTab={settingsTab} onClose={() => setSettingsTab(null)} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use NEXT_PUBLIC_GOOGLE_CLIENT_ID from environment, or a fallback for dev
  const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1098254429930-mockclientid.apps.googleusercontent.com") as string;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        {children}
        <SettingsModalTrigger />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
