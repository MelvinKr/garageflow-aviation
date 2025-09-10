"use client";
import SidebarClientImpl from "../SidebarClient";
import type React from "react";

export default function SidebarClient(
  props: React.ComponentProps<typeof SidebarClientImpl>
) {
  return <SidebarClientImpl {...props} />;
}
