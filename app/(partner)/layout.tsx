import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout role="partner">{children}</ProtectedLayout>;
}
