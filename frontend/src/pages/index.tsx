import DefaultLayout from "@/layouts/default";
import PostScrimCard from "@/components/PostScrimCard";
import ScrimWall from "@/components/ScrimWall";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <PostScrimCard />
        <ScrimWall />
      </div>
    </DefaultLayout>
  );
}
