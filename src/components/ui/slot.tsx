import * as React from "react";
import { cn } from "@/lib/utils";

/** 子要素に props を引き継ぐ最小限の Slot(@radix-ui/react-slot 相当) */
export function Slot({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!React.isValidElement<{ className?: string }>(children)) return null;
  return React.cloneElement(children, {
    ...props,
    className: cn(className, children.props.className),
  });
}
