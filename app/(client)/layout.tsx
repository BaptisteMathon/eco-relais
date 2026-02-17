import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout role="client">{children}</ProtectedLayout>;
}
