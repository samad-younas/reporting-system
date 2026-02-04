import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "lg",
  text = "Loading...",
  fullScreen = true,
  ...props
}) => {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 transition-all duration-300",
        fullScreen
          ? "min-h-screen w-full bg-background/50 backdrop-blur-sm"
          : "w-full h-full p-8",
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center justify-center">
        {/* Decorative background circle */}
        <div
          className={cn(
            "absolute rounded-full border-4 border-primary/20",
            sizeMap[size],
          )}
        />

        {/* Animated spinner */}
        <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary/50 animate-ping" />
        </div>
      </div>

      {text && (
        <p className="text-muted-foreground animate-pulse text-sm font-medium tracking-widest uppercase">
          {text}
        </p>
      )}
    </div>
  );
};
