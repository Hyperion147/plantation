import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ymbwjeemcemvtxgmrzvl.supabase.co'],
    // Or use remotePatterns for more control (recommended):
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ymbwjeemcemvtxgmrzvl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/plants/**',
      },
    ],
    
  },
};

export default nextConfig;
