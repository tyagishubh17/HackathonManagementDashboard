import DashboardLayout from "../../../components/layout/DashboardLayout";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="super_admin">{children}</DashboardLayout>;
}
