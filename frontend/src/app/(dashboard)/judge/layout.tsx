import DashboardLayout from "../../../components/layout/DashboardLayout";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="judge">{children}</DashboardLayout>;
}
