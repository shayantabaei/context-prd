import { FileText } from "lucide-react";

export function BrandMark() {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="ContextPRD home">
      <FileText className="h-5 w-5 text-blue-400" strokeWidth={1.9} />
      <span className="text-sm font-semibold tracking-[-0.01em] text-white">
        ContextPRD
      </span>
    </a>
  );
}
