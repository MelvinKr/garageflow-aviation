export function openPrint(html: string) {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

