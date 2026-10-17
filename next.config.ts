import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de las habitaciones que se suben a Redforts (ver lib/redforts/room-photos.ts)
    remotePatterns: [{ protocol: "https", hostname: "booking.redforts.com", pathname: "/cstatic/**" }],
  },
};

export default nextConfig;
