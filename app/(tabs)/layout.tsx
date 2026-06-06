import BottomNav from "@/components/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-svh" style={{ backgroundColor: "#0f0f0f" }}>
      <main className="flex-1 pb-[64px]">{children}</main>
      <BottomNav />
    </div>
  );
}
