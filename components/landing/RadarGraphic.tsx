import React from "react";
import { cn } from "@/lib/utils";

export function RadarGraphic({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[500px] h-[500px] flex items-center justify-center", className)}>
      {/* Concentric Circles */}
      <div className="absolute inset-0 rounded-full border border-emerald-500/10" />
      <div className="absolute inset-[15%] rounded-full border border-emerald-500/10" />
      <div className="absolute inset-[30%] rounded-full border border-emerald-500/10" />
      <div className="absolute inset-[45%] rounded-full border border-emerald-500/10" />
      
      {/* Diagonal Axis Lines */}
      <div className="absolute inset-0 rotate-45">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-emerald-500/5 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/5 -translate-y-1/2" />
      </div>

      {/* Radar Sweep */}
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
        <div className="absolute top-0 left-1/2 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-emerald-500 to-emerald-500 shadow-[0_0_15px_#10b981] origin-bottom" />
        {/* Faint trailing gradient sector - simulated with a rotated gradient */}
        <div 
          className="absolute top-0 left-1/2 h-1/2 w-[250px] origin-bottom-left -translate-x-full bg-gradient-to-r from-transparent to-emerald-500/10" 
          style={{ transform: 'rotate(0deg) translateX(-100%) skewX(20deg)' }}
        />
      </div>

      {/* Dots */}
      <div className="absolute top-[22%] right-[25%] h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
      <div className="absolute bottom-[35%] left-[20%] h-4 w-4 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] opacity-80" />
      <div className="absolute top-[50%] right-[10%] h-2 w-2 bg-emerald-500/30 rounded-full" />
      <div className="absolute bottom-[20%] right-[30%] h-1.5 w-1.5 bg-emerald-500/50 rounded-full" />
      <div className="absolute top-[40%] left-[35%] h-2 w-2 bg-emerald-400/80 rounded-full" />
      
      {/* Center Glow */}
      <div className="absolute h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]" />
    </div>
  );
}

