import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/utils/cn";

type CardWrapperProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function CardWrapper({ className, children, ...props }: CardWrapperProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-sm transition-all duration-200 ease-soft hover:-translate-y-[3px] hover:shadow-soft dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-[0_22px_40px_-32px_rgba(15,23,42,0.75)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
