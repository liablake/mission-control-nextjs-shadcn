import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 md:flex">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
