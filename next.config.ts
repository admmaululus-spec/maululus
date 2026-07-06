import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Berlaku untuk semua rute
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Mencegah web Anda di-embed di iframe web lain (Mencegah Clickjacking)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Mencegah browser menebak tipe file berbahaya
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Matikan akses hardware jika tidak butuh
          },
        ],
      },
    ];
  },
};

export default nextConfig;