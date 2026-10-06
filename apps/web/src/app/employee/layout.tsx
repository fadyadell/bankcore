import DashboardShell from '@/components/DashboardShell';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
