"use client";
import UserNav from "@/components/UserNav";
import LogoutButton from "@/components/LogoutButton";

export default function HeaderUserActions() {
  return (
    <div className="flex items-center gap-2">
      <UserNav />
      <LogoutButton />
    </div>
  );
}

