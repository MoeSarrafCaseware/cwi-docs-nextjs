import OnThisPage from "@/components/OnThisPage";
import HTMLContent from "@/components/HTMLContent";

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Await params as required by Next.js 15
  const { slug } = await params;
  
  // Decode the href path from the URL
  const encodedHref = slug.join('/');
  const href = decodeURIComponent(encodedHref);
  
  return (
    <div className="flex">
      <div className="flex-1">
        <HTMLContent href={href} />
      </div>
      <OnThisPage items={[]} />
    </div>
  );
}
