import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
import { MockTestPickerGrid } from "@/modules/mock/components/mock-test-picker-grid";

type Props = {
  activeNumber: number;
  title: string;
  catalogSlots?: MockCatalogSlot[];
  children: React.ReactNode;
};

/** Shared layout for unified `/test` and standalone coming-soon pages. */
export function MockTestHubShell({
  activeNumber,
  title,
  catalogSlots,
  children,
}: Props) {
  return (
    <div className="bf-dash-enter bg-[#f8fafc] pb-8 md:bg-transparent md:pb-0">
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--exam-ink)] sm:text-3xl">
          {title}
        </h1>

        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <MockTestPickerGrid
            slots={catalogSlots}
            activeNumber={activeNumber}
            variant="pills"
          />
        </div>
      </div>

      <div className="mt-5 space-y-5 px-4 sm:px-6">{children}</div>
    </div>
  );
}
