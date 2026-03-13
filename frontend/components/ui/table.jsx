import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}

export function THead({ className, ...props }) {
  return <thead className={cn("bg-muted/70", className)} {...props} />;
}

export function TH({ className, ...props }) {
  return <th className={cn("px-3 py-2 font-medium", className)} {...props} />;
}

export function TD({ className, ...props }) {
  return <td className={cn("border-t border-border px-3 py-2", className)} {...props} />;
}
