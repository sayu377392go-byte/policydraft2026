export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="hero-sky border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="font-display text-3xl font-bold tracking-wide text-gradient md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>}
        {children}
      </div>
    </div>
  );
}
