import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading">
      <Spinner className="size-6 text-brand" />
    </div>
  );
}
