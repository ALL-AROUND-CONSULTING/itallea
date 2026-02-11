import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ActionBar } from "./ActionBar";

export function AppLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-32">
        <Outlet />
      </main>
      <ActionBar />
      <BottomNav />
    </div>
  );
}
