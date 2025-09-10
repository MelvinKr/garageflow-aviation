"use server";
import { Repos } from "@/data/server";

export async function acceptQuoteAction(id: string) {
  return Repos.quotes.accept(id);
}
