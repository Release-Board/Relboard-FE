import HomePageClient from "@/features/home/components/HomePageClient";

export const revalidate = 3600;

export default function HomePage() {
  return <HomePageClient />;
}
