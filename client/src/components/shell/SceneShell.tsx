/* eslint-disable react-refresh/only-export-components */
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode
} from "react";
import { cn } from "../../utils/cn";

interface SceneRootProps extends HTMLAttributes<HTMLElement> {
  backgroundImage: string;
  children: ReactNode;
}

function Root({
  backgroundImage,
  className,
  style,
  children,
  ...rest
}: SceneRootProps) {
  const mergedStyle: CSSProperties = {
    ...style,
    backgroundImage: `url(${backgroundImage})`
  };

  return (
    <main
      className={cn(
        "relative min-h-svh overflow-hidden bg-cover bg-center bg-no-repeat",
        className
      )}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </main>
  );
}

interface PanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Panel({ className, children, ...rest }: PanelProps) {
  return (
    <section
      className={cn(
        "mx-auto box-border flex min-h-svh flex-col items-center justify-between p-8",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

interface ImageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  imageSrc: string;
  label: string;
  imageClassName?: string;
  labelClassName?: string;
}

function ImageButton({
  imageSrc,
  className,
  imageClassName,
  // 나중에 라벨 쓸일 있다면 사용
  // label,
  // labelClassName,
  ...rest
}: ImageButtonProps) {
  return (
    <button
      type="button"
      className={cn("relative cursor-pointer border-0 bg-transparent p-0", className)}
      {...rest}
    >
      <img
        src={imageSrc}
        alt=""
        className={cn("block", imageClassName)}
      />
      {/* 나중에 라벨 쓸일 있다면 사용 */}
      {/* <span
        className={cn(
          "absolute inset-0 grid place-items-center text-base font-bold tracking-[0.04em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]",
          labelClassName
        )}
      >
        {label}
      </span> */}
    </button>
  );
}

export const SceneShell = Object.assign(Root, {
  Panel,
  ImageButton
});
