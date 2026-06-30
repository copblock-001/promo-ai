/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // TODO(asset): Supabase Storage 도메인을 .env로 설정 후 여기에 remotePatterns 추가
    remotePatterns: [],
  },
};

export default nextConfig;
