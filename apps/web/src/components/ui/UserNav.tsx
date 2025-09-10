"use client";
import UserNavImpl from "../UserNav";
import type React from "react";

export default function UserNav(
  props: React.ComponentProps<typeof UserNavImpl>
) {
  return <UserNavImpl {...props} />;
}
