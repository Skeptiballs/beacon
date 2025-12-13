import React from "react";
import { cn } from "@/lib/utils";

export function RadarGraphic({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[500px] h-[500px] flex items-center justify-center", className)}>
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />

      {/* Grid: Concentric Circles */}
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="absolute rounded-full border border-emerald-500/10"
          style={{ inset: `${i * 15}%` }}
        />
      ))}
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full border border-emerald-500/15" />

      {/* Grid: Crosshairs & Axis */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-emerald-500/10 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/10 -translate-y-1/2" />
        {/* Diagonal lines (fainter) */}
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-emerald-500/5 -translate-x-1/2 rotate-45" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-emerald-500/5 -translate-x-1/2 -rotate-45" />
      </div>

      {/* Radar Sweep Container - Rotates */}
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
        
        {/* The Sweep Trail (Conic Gradient) */}
        {/* 
           We want the gradient to end exactly at the top (0deg/360deg) where the line is.
           We'll use a conic gradient that starts transparent and transitions to green.
           'from 270deg' rotates the start of the gradient to 9 o'clock.
           Then we fill 90deg (to 12 o'clock) with the transition.
        */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 270deg at 50% 50%, transparent 0deg, rgba(16, 185, 129, 0.01) 40deg, rgba(16, 185, 129, 0.2) 90deg, transparent 90deg)`
          }}
        />

        {/* The Leading Line */}
        <div className="absolute top-0 left-1/2 h-1/2 w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-500 to-emerald-500 shadow-[0_0_15px_#10b981] origin-bottom rounded-full" />
      </div>

      {/* Blips (Static or independently animated) */}
      {/* We can make them look like actual detected objects */}
      
      {/* Blip 1: Strong signal with ping */}
      <div className="absolute top-[22%] right-[25%] flex items-center justify-center">
        <div className="h-3 w-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] z-10" />
        <div className="absolute inset-0 h-3 w-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
      </div>

      {/* Blip 2: Faint signal */}
      <div className="absolute bottom-[35%] left-[20%] h-2 w-2 bg-emerald-500/60 rounded-full shadow-[0_0_8px_#10b981]" />

      {/* Blip 3: Distant signal */}
      <div className="absolute top-[50%] right-[10%] h-1.5 w-1.5 bg-emerald-500/40 rounded-full" />

      {/* Blip 4: Another active one */}
      <div className="absolute bottom-[25%] right-[35%] h-2.5 w-2.5 bg-emerald-500/80 rounded-full shadow-[0_0_4px_#10b981] animate-pulse" />

      {/* Center Hub */}
      <div className="absolute inset-[48%] rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm z-20 flex items-center justify-center">
         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
      </div>
    </div>
  );
}
