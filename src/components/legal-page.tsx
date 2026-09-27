import { PageHeader } from "@/components/page-header";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6">
        {children}
      </div>
    </>
  );
}
