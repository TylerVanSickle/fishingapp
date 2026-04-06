import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles").select("is_admin, username").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)]">
      <AdminNav username={profile.username ?? "admin"} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
