import TestOnThisPage from "../../TestOnThisPage";
import TestHTMLContent from "../../TestHTMLContent";

export default async function TestDocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Await params as required by Next.js 15
  const { slug } = await params;
  
  // Decode the href path from the URL
  const encodedHref = slug.join('/');
  const href = decodeURIComponent(encodedHref);
  
  return (
    <div className="flex">
      <div className="flex-1">
        <TestHTMLContent href={href} />
      </div>
      <TestOnThisPage items={[]} />
    </div>
  );
}
