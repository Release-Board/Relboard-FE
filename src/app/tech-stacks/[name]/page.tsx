import TechStackTimeline from "@/features/tech-stacks/components/TechStackTimeline";

type Props = {
  params: Promise<{ name: string }>;
};

export default async function TechStackPage(props: Props) {
  const params = await props.params;
  return <TechStackTimeline techStackName={params.name} />;
}
