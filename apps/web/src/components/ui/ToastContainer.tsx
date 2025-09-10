"use client";
import { useToast } from "./useToast";

export default function ToastContainer() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-3 right-3 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            "min-w-[260px] rounded-lg shadow-lg border px-3 py-2 text-sm bg-white",
            t.type === "success" ? "border-green-200" : "",
            t.type === "error" ? "border-red-200" : "",
            t.type === "info" ? "border-blue-200" : "",
          ].join(" ")}
          role="status"
        >
          <div className="flex items-start gap-2">
            <div className={[
              "mt-[3px] h-2 w-2 rounded-full",
              t.type === "success" ? "bg-green-600" : "",
              t.type === "error" ? "bg-red-600" : "",
              t.type === "info" || !t.type ? "bg-blue-600" : "",
            ].join(" ")} />
            <div className="flex-1">
              {t.title && <div className="font-medium">{t.title}</div>}
              <div className="text-gray-700">{t.message}</div>
            </div>
            <button className="text-gray-400 hover:text-gray-700" onClick={()=>remove(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

