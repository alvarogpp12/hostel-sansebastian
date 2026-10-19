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

/** Logo de WhatsApp (monocromo) */
export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
