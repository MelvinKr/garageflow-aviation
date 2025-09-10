"use client";
export default function WoStatusBadge({ status }: { status: "draft"|"in_progress"|"awaiting_signature"|"closed"|"pending" }) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    awaiting_signature: "bg-purple-50 text-purple-700 border-purple-200",
    closed: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${map[status] || ""}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace("_", " ")}
    </span>
  );
}

