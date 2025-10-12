import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "23july.hostlin.com",
      },
      {
        protocol: "https",
        hostname: "deepeyex.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.nhathuoclongchau.com.vn",
      },
      {
        protocol: "https",
        hostname: "acihome.vn",
      },
      {
        protocol: "https",
        hostname: "deepeyex-admin.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "example.com", // 👈 thêm dòng này
      },
    ],
  },
};

export default nextConfig;
