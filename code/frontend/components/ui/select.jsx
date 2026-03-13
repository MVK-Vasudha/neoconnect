import { cn } from "@/lib/utils";

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
