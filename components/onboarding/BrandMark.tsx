export function BrandMark() {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="ContextPRD home">
      <img
        src="/icon.png"
        alt=""
        className="h-6 w-6 rounded-md"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold tracking-[-0.01em] text-white">
        ContextPRD
      </span>
    </a>
  );
}
