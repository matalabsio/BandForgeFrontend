import { MockTestPickerGrid } from "@/modules/mock/components/mock-test-picker-grid";

type Props = {
  activeNumber: number;
  children: React.ReactNode;
};

/** Compact shell for an individual test hub (`/test/[number]`). */
export function MockTestHubShell({ activeNumber, children }: Props) {
  return (
    <div className="bf-dash-enter space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <MockTestPickerGrid activeNumber={activeNumber} />
      {children}
    </div>
  );
}
