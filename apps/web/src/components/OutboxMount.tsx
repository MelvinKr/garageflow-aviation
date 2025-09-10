"use client";
import { useOutboxReplay } from "@/lib/outbox";

export default function OutboxMount() {
  useOutboxReplay();
  return null;
}

