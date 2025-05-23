import DefaultLayout from "@/layouts/default";
import PostScrimCard from "@/components/PostScrimCard";
import ScrimWall from "@/components/ScrimWall";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <div className="flex justify-center w-full">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <PostScrimCard />
          <ScrimWall />
        </div>
      </div>
    </DefaultLayout>
  );
}
