import { listQuotesAction, createQuoteAction, updateQuoteAction } from "./actions";
import QuotesClient from "./QuotesClient";

export default async function QuotesPage() {
  const rows = await listQuotesAction({ limit: 200 });
  return <QuotesClient rows={rows as any} createAction={createQuoteAction} updateAction={updateQuoteAction} />;
}
