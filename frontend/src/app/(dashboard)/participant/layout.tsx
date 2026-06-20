import DashboardLayout from "../../../components/layout/DashboardLayout";

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="participant">{children}</DashboardLayout>;
}
