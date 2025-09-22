import { TestSearchProvider } from "./TestSearchProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <TestSearchProvider>
        {children}
      </TestSearchProvider>
    </LanguageProvider>
  );
}
