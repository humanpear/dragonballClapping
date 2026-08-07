/* eslint-disable react-refresh/only-export-components */
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode
} from "react";
import { cn } from "../../utils/cn";

interface RootProps extends HTMLAttributes<HTMLElement> {
  backgroundImage: string;
  children: ReactNode;
}

function Root({ backgroundImage, className, style, children, ...rest }: RootProps) {
  const mergedStyle: CSSProperties = {
    ...style,
    backgroundImage: `url(${backgroundImage})`
  };

  return (
    <main
      className={cn(
        "relative min-h-svh overflow-hidden bg-cover bg-center bg-no-repeat text-white",
        className
      )}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </main>
  );
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Top({ className, children, ...rest }: SectionProps) {
  return (
    <section
      className={cn(
        "absolute inset-x-4 top-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:top-4",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

function ScoreSlots({ className, children, ...rest }: SectionProps) {
  return (
    <div className={cn("flex justify-center", className)} {...rest}>
      {children}
    </div>
  );
}

type BeatImageProps = ImgHTMLAttributes<HTMLImageElement>;

function BeatImage({ className, ...rest }: BeatImageProps) {
  return <img className={cn("h-auto w-[2vw]", className)} {...rest} />;
}

function Middle({ className, children, ...rest }: SectionProps) {
  return (
    <section
      className={cn(
        "absolute inset-x-4 bottom-[34%] flex flex-col items-center gap-3 md:bottom-0",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

function Bottom({ className, children, ...rest }: SectionProps) {
  return (
    <section
      className={cn("absolute inset-x-4 bottom-[18%] flex justify-center", className)}
      {...rest}
    >
      {children}
    </section>
  );
}

interface ActionBarProps extends SectionProps {
  side: "left" | "right";
}

function ActionBar({ side, className, children, ...rest }: ActionBarProps) {
  return (
    <section
      className={cn(
        "absolute bottom-[22px] grid gap-2",
        side === "left" ? "left-3" : "right-3",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc: string;
  selected?: boolean;
  iconClassName?: string;
}

function ActionButton({
  iconSrc,
  selected = false,
  iconClassName,
  className,
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "grid place-items-center border-0 bg-transparent p-0 transition-transform",
        selected && "scale-105 [filter:drop-shadow(0_0_8px_rgba(251,191,36,0.8))]",
        rest.disabled ? "cursor-default opacity-55" : "cursor-pointer",
        className
      )}
      {...rest}
    >
      <img
        src={iconSrc}
        alt=""
        className={cn("h-[10vh] md:h-[15vh] w-auto object-contain", iconClassName)}
      />
    </button>
  );
}

function InfoCard({ className, children, ...rest }: SectionProps) {
  return (
    <section
      className={cn(
        "absolute left-2 top-[78px] rounded-xl border border-white/20 bg-slate-950/70 px-3 py-2 text-[0.75rem] leading-[1.35] md:left-[14px] md:top-[92px] md:text-[0.82rem]",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

interface RoundIntroOverlayProps extends HTMLAttributes<HTMLElement> {
  plateSrc: string;
  label: string;
}

function RoundIntroOverlay({
  plateSrc,
  label,
  className,
  ...rest
}: RoundIntroOverlayProps) {
  return (
    <section
      className={cn(
        "absolute inset-0 z-10 grid place-items-center bg-black/50",
        className
      )}
      {...rest}
    >
      <img src={plateSrc} alt="" className="h-auto w-[min(420px,82vw)]" />
      <strong className="absolute text-[clamp(1.9rem,7vw,3.3rem)] tracking-[0.07em] text-amber-100 [text-shadow:0_4px_10px_rgba(0,0,0,0.8)]">
        {label}
      </strong>
    </section>
  );
}

export const BattleFrame = Object.assign(Root, {
  Top,
  ScoreSlots,
  BeatImage,
  Middle,
  Bottom,
  ActionBar,
  ActionButton,
  InfoCard,
  RoundIntroOverlay
});
