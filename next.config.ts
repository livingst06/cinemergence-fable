import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/formation-jouer-face-camera",
        destination: "/formations/formation-jouer-face-camera",
        permanent: true,
      },
      {
        source: "/formation-realiser-court-metrage",
        destination: "/formations/formation-realiser-court-metrage",
        permanent: true,
      },
      {
        source: "/formation-ecriture-scenario",
        destination: "/formations/formation-ecriture-scenario",
        permanent: true,
      },
      {
        source: "/formation-bande-demo",
        destination: "/formations/formation-bande-demo",
        permanent: true,
      },
      {
        source: "/formation-camera-cinema",
        destination: "/formations/formation-camera-cinema",
        permanent: true,
      },
      {
        source: "/formation-production-film",
        destination: "/formations/formation-production-film",
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
