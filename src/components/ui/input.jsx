import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex rounded-lg border-2 border-gray-300 bg-gray-200 bg-opacity-50 p-3 font-bold outline-offset-2 focus:border-transparent focus:border-0 text-black shadow-md opacity-50 h-[50px]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
