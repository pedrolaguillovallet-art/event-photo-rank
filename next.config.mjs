const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  ...(assetPrefix === "cloudflare" ? {} : { assetPrefix: assetPrefix ?? "." }),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
