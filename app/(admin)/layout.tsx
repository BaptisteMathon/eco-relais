import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout role="admin">{children}</ProtectedLayout>;
}
