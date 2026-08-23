import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Accès mobile/LAN en local (ex. http://192.168.1.21:3000) — HMR + assets
  allowedDevOrigins: ["192.168.1.21", "127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [70, 75],
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/videos/:path*.mp4",
        headers: [
          { key: "Content-Type", value: "video/mp4" },
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/formation-jouer-face-camera",
        destination: "/formations/formation-jouer-face-camera",
        permanent: true,
      },
      {
        source: "/formation-bande-demo",
        destination: "/formations/formation-tourner-bande-demo",
        permanent: true,
      },
      {
        source: "/formations/formation-bande-demo",
        destination: "/formations/formation-tourner-bande-demo",
        permanent: true,
      },
      {
        source: "/formation-realiser-court-metrage",
        destination: "/formations/formation-realiser-film-court",
        permanent: true,
      },
      {
        source: "/formations/formation-realiser-court-metrage",
        destination: "/formations/formation-realiser-film-court",
        permanent: true,
      },
      {
        source: "/formation-ecriture-scenario",
        destination: "/formations/formation-ecriture-court-metrage",
        permanent: true,
      },
      {
        source: "/formations/formation-ecriture-scenario",
        destination: "/formations/formation-ecriture-court-metrage",
        permanent: true,
      },
      {
        source: "/formation-camera-cinema",
        destination: "/formations/formation-lumiere-image",
        permanent: true,
      },
      {
        source: "/formations/formation-camera-cinema",
        destination: "/formations/formation-lumiere-image",
        permanent: true,
      },
      {
        source: "/formation-production-film",
        destination: "/formations/formation-passer-a-la-realisation",
        permanent: true,
      },
      {
        source: "/formations/formation-production-film",
        destination: "/formations/formation-passer-a-la-realisation",
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
