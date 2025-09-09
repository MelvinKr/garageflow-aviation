"use server";
import { Repos } from "@/data";

export async function acceptQuoteAction(id: string) {
  return Repos.quotes.accept(id);
}

