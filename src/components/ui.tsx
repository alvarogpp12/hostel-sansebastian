import Image from "next/image";
import type { ReactNode } from "react";
import type { Media } from "@/content/media";
import { Arrow, ArrowOut } from "./icons";
import { TransitionLink } from "./TransitionLink";

/** Rounded, cropped image frame (`aspect` is a Tailwind aspect class) */
export function Frame({
  image,
  className = "",
  imgClassName = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
}: {
  image: Media;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-clip rounded-lg bg-neutral-200 ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`absolute inset-0 size-full object-cover ${imgClassName}`}
      />
    </div>
  );
}

/** Black pill button link with the reference's hover gap + icon scale */
export function ButtonLink({
  href,
  children,
  className = "",
  icon = "out",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  icon?: "out" | "right";
}) {
  return (
    <TransitionLink href={href} className={`style-button ${className}`}>
      {children}
      {icon === "out" ? <ArrowOut /> : <Arrow />}
    </TransitionLink>
  );
}

/** White card on beige, used by most content blocks */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-white ${className}`}>{children}</div>;
}

/** Beige→white fade between page bands */
export function Fade({ direction = "up", className = "h-20" }: { direction?: "up" | "down"; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${className} ${direction === "up" ? "bg-gradient-to-t" : "bg-gradient-to-b"} from-beige to-white`}
    />
  );
}
