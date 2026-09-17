import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Clock,
  CreditCard,
  Euro,
  Eye,
  Globe,
  Heart,
  KeyRound,
  Leaf,
  MapPin,
  Mountain,
  ShieldCheck,
  ShowerHead,
  Sparkle,
  Sun,
  Tag,
  TrainFront,
  Users,
  Utensils,
  Waves,
  Wifi,
  type LucideProps,
} from "lucide-react";
import type { IconName, SocialLink } from "@/content/site";

const map = {
  sparkle: Sparkle,
  leaf: Leaf,
  marker: MapPin,
  tag: Tag,
  waves: Waves,
  globe: Globe,
  users: Users,
  bed: BedDouble,
  euro: Euro,
  calendar: CalendarDays,
  shower: ShowerHead,
  wifi: Wifi,
  sun: Sun,
  eye: Eye,
  clock: Clock,
  key: KeyRound,
  heart: Heart,
  shield: ShieldCheck,
  train: TrainFront,
  utensils: Utensils,
  mountain: Mountain,
  creditCard: CreditCard,
} satisfies Record<IconName, unknown>;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = map[name];
  return <Cmp strokeWidth={1.25} aria-hidden="true" {...props} />;
}

export const Arrow = (p: LucideProps) => <ArrowRight strokeWidth={1.5} size={16} aria-hidden="true" {...p} />;
export const ArrowBack = (p: LucideProps) => <ArrowLeft strokeWidth={1.5} size={16} aria-hidden="true" {...p} />;
export const ArrowOut = (p: LucideProps) => <ArrowUpRight strokeWidth={1.5} size={16} aria-hidden="true" {...p} />;

/** Minimal monochrome social glyphs (lucide no longer ships brand icons) */
export function SocialGlyph({ icon, className }: { icon: SocialLink["icon"]; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true as const };
  if (icon === "facebook")
    return (
      <svg {...common}>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3Z" />
      </svg>
    );
  if (icon === "instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M5.2 8.7h3.1V19H5.2V8.7Zm1.6-5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM10.3 8.7h3v1.4c.4-.8 1.5-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V19H17v-5c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V19h-3.1V8.7Z" />
    </svg>
  );
}
