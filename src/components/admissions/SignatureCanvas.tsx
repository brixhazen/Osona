import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Pen, Trash2, Check } from "lucide-react";

const MODULE_COLOR = "#10B981";

interface Props {
  onSign: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignatureCanvas({ onSign, onCancel }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);
  const lastPt     = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const up = () => { isDrawing.current = false; lastPt.current = null; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  function coords(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    const me = e as React.MouseEvent<HTMLCanvasElement>;
    return { x: (me.clientX - rect.left) * scaleX, y: (me.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    isDrawing.current = true;
    lastPt.current    = coords(e);
    setHasDrawn(true);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !lastPt.current) return;
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const pt     = coords(e);

    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    lastPt.current = pt;
  }

  function stopDraw() {
    isDrawing.current = false;
    lastPt.current    = null;
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  return (
    <div className="space-y-3">
      {/* Canvas area */}
      <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-border bg-white">
        <canvas
          ref={canvasRef}
          width={620}
          height={160}
          className="w-full block cursor-crosshair"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e); }}
          onTouchMove={(e)  => { e.preventDefault(); draw(e); }}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1.5">
            <Pen size={20} className="text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground/50">Draw your signature here</span>
          </div>
        )}
        {/* Baseline rule */}
        <div className="absolute bottom-10 left-10 right-10 border-b border-border/50 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={clear}
          disabled={!hasDrawn}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors disabled:opacity-30"
        >
          <Trash2 size={13} />
          Clear
        </button>
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSign(canvasRef.current!.toDataURL("image/png"))}
          disabled={!hasDrawn}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all",
            hasDrawn ? "opacity-100 hover:opacity-90" : "opacity-40 cursor-not-allowed",
          )}
          style={{ backgroundColor: MODULE_COLOR }}
        >
          <Check size={14} />
          Sign Document
        </button>
      </div>
    </div>
  );
}
