// Kiosk mode doesn't need the dashboard navigation
export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

