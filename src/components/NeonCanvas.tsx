import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  coreColor,
  getBackboard,
  getBackingColor,
  getColor,
  getFont,
  getShape,
  getTier,
} from "@/lib/neon/catalog";
import type { DesignElement, NeonDesign } from "@/lib/neon/types";
import { cn } from "@/lib/utils";

import sceneBedroom from "@/assets/scene-bedroom.jpg";
import sceneCafe from "@/assets/scene-cafe.jpg";
import sceneGaming from "@/assets/scene-gaming.jpg";

const SCENE_IMAGES: Record<string, string | undefined> = {
  bedroom: sceneBedroom,
  cafe: sceneCafe,
  gaming: sceneGaming,
};

function glowShadow(hex: string): string {
  return `0 0 4px ${hex}, 0 0 12px ${hex}, 0 0 26px ${hex}, 0 0 52px ${hex}, 0 0 90px ${hex}`;
}

function TextNode({ el, widthPx }: { el: DesignElement; widthPx: number }) {
  const font = getFont(el.fontId ?? "dancing");

  const color = getColor(el.color);
  const size = Math.max(12, widthPx * 0.13 * el.scale);
  const text = font.uppercase ? (el.text ?? "").toUpperCase() : el.text;
  return (
    <span
      style={
        {
          fontFamily: font.family,
          fontWeight: font.weight,
          fontSize: size,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          color: coreColor(color.hex),
          textShadow: glowShadow(color.hex),
        } as CSSProperties
      }
    >
      {text || " "}
    </span>
  );
}

function ShapeNode({ el, widthPx }: { el: DesignElement; widthPx: number }) {
  const shape = getShape(el.shapeId ?? "heart");

  const color = getColor(el.color);
  const size = Math.max(20, widthPx * 0.16 * el.scale);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 0 5px ${color.hex}) drop-shadow(0 0 14px ${color.hex}) drop-shadow(0 0 30px ${color.hex})` }}
    >
      <g
        stroke={coreColor(color.hex)}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shape.d.map((p, i) => (
          <path key={i} d={p} />
        ))}
        {shape.circles?.map((c, i) => (
          <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
      </g>
    </svg>
  );
}

interface DragState {
  mode: "move" | "scale" | "rotate";
  id: string;
  startX: number;
  startY: number;
  origin: DesignElement;
  center: { x: number; y: number };
  startDist: number;
  startAngle: number;
}

export interface NeonCanvasProps {
  design: NeonDesign;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onElementChange?: (id: string, patch: Partial<DesignElement>) => void;
  /** called after a drag/resize/rotate gesture finishes (for history) */
  onCommit?: () => void;
  className?: string;
}

export function NeonCanvas({
  design,
  editable = false,
  selectedId = null,
  onSelect,
  onElementChange,
  onCommit,
  className,
}: NeonCanvasProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [widthPx, setWidthPx] = useState(0);
  const [heightPx, setHeightPx] = useState(0);
  const dragRef = useRef<DragState | null>(null);

  const tier = getTier(design.tierId);
  const board = getBackboard(design.backboardId);
  const backing = getBackingColor(design.backingColorId);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => {
      setWidthPx(el.clientWidth);
      setHeightPx(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampPos = (v: number) => Math.min(96, Math.max(4, v));

  function startDrag(e: ReactPointerEvent, mode: DragState["mode"], el: DesignElement) {
    if (!editable || !onElementChange) return;
    e.stopPropagation();
    e.preventDefault();
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const center = {
      x: rect.left + (el.x / 100) * rect.width,
      y: rect.top + (el.y / 100) * rect.height,
    };
    const startDist = Math.hypot(e.clientX - center.x, e.clientY - center.y) || 1;
    const startAngle =
      (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) / Math.PI;
    dragRef.current = { mode, id: el.id, startX: e.clientX, startY: e.clientY, origin: { ...el }, center, startDist, startAngle };
    onSelect?.(el.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDragMove(e: ReactPointerEvent) {
    const d = dragRef.current;
    if (!d || !onElementChange) return;
    if (d.mode === "move") {
      const dx = ((e.clientX - d.startX) / Math.max(widthPx, 1)) * 100;
      const dy = ((e.clientY - d.startY) / Math.max(heightPx, 1)) * 100;
      onElementChange(d.id, {
        x: clampPos(d.origin.x + dx),
        y: clampPos(d.origin.y + dy),
      });
    } else if (d.mode === "scale") {
      const dist = Math.hypot(e.clientX - d.center.x, e.clientY - d.center.y);
      onElementChange(d.id, {
        scale: Math.min(3, Math.max(0.3, d.origin.scale * (dist / d.startDist))),
      });
    } else {
      const angle = (Math.atan2(e.clientY - d.center.y, e.clientX - d.center.x) * 180) / Math.PI;
      onElementChange(d.id, {
        rotation: Math.round(d.origin.rotation + (angle - d.startAngle)),
      });
    }
  }

  function endDrag() {
    if (dragRef.current) {
      dragRef.current = null;
      onCommit?.();
    }
  }

  const sceneImage = SCENE_IMAGES[design.sceneId];

  return (
    <div
      className={cn("relative overflow-hidden", !sceneImage && "glow-stage", className)}
      onPointerDown={() => onSelect?.(null)}
    >
      {sceneImage && (
        <>
          <img
            src={sceneImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-background/55" />
        </>
      )}

      {/* backboard panel */}
      {board.radius !== null && widthPx > 0 && (
        <div
          className="pointer-events-none absolute inset-[5%]"
          style={{
            background: backing.hex,
            opacity: design.backingColorId === "white" ? 0.22 : 0.5,
            borderRadius: board.id === "rectangle" ? "10px" : "3rem",
            border: board.border
              ? "1px solid color-mix(in srgb, var(--foreground) 18%, transparent)"
              : "none",
            boxShadow: "inset 0 0 60px color-mix(in srgb, var(--primary) 12%, transparent)",
          }}
        />
      )}

      {/* sign area */}
      <div
        ref={areaRef}
        className="relative mx-auto h-full w-full"
        style={{ aspectRatio: 1 / tier.ratio }}
      >
        {/* boundary guide */}
        {editable && (
          <div className="pointer-events-none absolute inset-[3%] rounded-xl border border-dashed border-border/70" />
        )}

        {design.elements.map((el) => {
          const selected = editable && el.id === selectedId;
          return (
            <div
              key={el.id}
              className={cn(
                "absolute select-none",
                editable && "cursor-grab touch-none active:cursor-grabbing",
              )}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                pointerEvents: editable ? "auto" : "none",
              }}
              onPointerDown={(e) => startDrag(e, "move", el)}
              onPointerMove={onDragMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div
                className={cn(
                  editable && "p-3",
                  selected && "rounded-lg outline-2 outline-dashed outline-ring/70",
                )}
              >
                {el.type === "text" ? (
                  <TextNode el={el} widthPx={widthPx} />
                ) : (
                  <ShapeNode el={el} widthPx={widthPx} />
                )}
              </div>

              {selected && (
                <>
                  {/* resize handle */}
                  <div
                    aria-label="Resize handle"
                    className="absolute -right-2 -bottom-2 h-6 w-6 cursor-nwse-resize touch-none rounded-full border-2 border-primary-foreground bg-primary shadow-[0_0_10px_var(--primary)]"
                    onPointerDown={(e) => startDrag(e, "scale", el)}
                    onPointerMove={onDragMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  />
                  {/* rotate handle */}
                  <div
                    aria-label="Rotate handle"
                    className="absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 cursor-grab touch-none rounded-full border-2 border-background bg-accent shadow-[0_0_10px_var(--accent)]"
                    onPointerDown={(e) => startDrag(e, "rotate", el)}
                    onPointerMove={onDragMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
