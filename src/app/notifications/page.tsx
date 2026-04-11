import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, UserPlus, MessageSquare, Fish, Star, MapPin, Heart, CheckCircle, AlertTriangle } from "lucide-react";
import PushSubscribeButton from "@/components/PushSubscribeButton";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type NotifConfig = {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: (actor: string | null, entityId: string | null) => React.ReactNode;
  href: (actorId: string | null, entityId: string | null) => string | null;
};

const NOTIF_TYPES: Record<string, NotifConfig> = {
  new_follower: {
    icon: UserPlus,
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    label: (actor) => <><strong className="text-white">@{actor ?? "Someone"}</strong> started following you</>,
    href: (actorId) => actorId ? `/anglers/${actorId}` : null,
  },
  spot_comment: {
    icon: MessageSquare,
    iconBg: "bg-cyan-600/20",
    iconColor: "text-cyan-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> commented on{entityId ? <> a <Link href={`/spots/${entityId}`} className="text-blue-400 hover:text-blue-300">spot</Link></> : " a spot"}</>,
    href: (_, entityId) => entityId ? `/spots/${entityId}` : null,
  },
  spot_rating: {
    icon: Star,
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> rated{entityId ? <> <Link href={`/spots/${entityId}`} className="text-blue-400 hover:text-blue-300">your spot</Link></> : " a spot"}</>,
    href: (_, entityId) => entityId ? `/spots/${entityId}` : null,
  },
  new_catch_nearby: {
    icon: Fish,
    iconBg: "bg-green-600/20",
    iconColor: "text-green-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> logged a catch{entityId ? <> at <Link href={`/spots/${entityId}`} className="text-blue-400 hover:text-blue-300">a saved spot</Link></> : ""}</>,
    href: (_, entityId) => entityId ? `/spots/${entityId}` : null,
  },
  spot_verified: {
    icon: MapPin,
    iconBg: "bg-violet-600/20",
    iconColor: "text-violet-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> verified{entityId ? <> <Link href={`/spots/${entityId}`} className="text-blue-400 hover:text-blue-300">a spot</Link></> : " a spot"} you added</>,
    href: (_, entityId) => entityId ? `/spots/${entityId}` : null,
  },
  catch_comment: {
    icon: MessageSquare,
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> commented on{entityId ? <> your <Link href={`/catches/${entityId}`} className="text-blue-400 hover:text-blue-300">catch</Link></> : " your catch"}</>,
    href: (_, entityId) => entityId ? `/catches/${entityId}` : null,
  },
  catch_reaction: {
    icon: Heart,
    iconBg: "bg-pink-600/20",
    iconColor: "text-pink-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> reacted to{entityId ? <> your <Link href={`/catches/${entityId}`} className="text-blue-400 hover:text-blue-300">catch</Link></> : " your catch"}</>,
    href: (_, entityId) => entityId ? `/catches/${entityId}` : null,
  },
  follow_catch: {
    icon: Fish,
    iconBg: "bg-green-600/20",
    iconColor: "text-green-400",
    label: (actor, entityId) => <><strong className="text-white">@{actor ?? "Someone"}</strong> logged a new{entityId ? <> <Link href={`/catches/${entityId}`} className="text-blue-400 hover:text-blue-300">catch</Link></> : " catch"}</>,
    href: (_, entityId) => entityId ? `/catches/${entityId}` : null,
  },
  spot_approved: {
    icon: CheckCircle,
    iconBg: "bg-green-600/20",
    iconColor: "text-green-400",
    label: (_, entityId) => <>Your{entityId ? <> <Link href={`/spots/${entityId}`} className="text-blue-400 hover:text-blue-300">spot</Link></> : " spot"} was approved and is now live on the map!</>,
    href: (_, entityId) => entityId ? `/spots/${entityId}` : null,
  },
  spot_rejected: {
    icon: AlertTriangle,
    iconBg: "bg-red-600/20",
    iconColor: "text-red-400",
    label: () => <>Your submitted spot was not approved. It may not meet our guidelines.</>,
    href: () => "/submit-spot",
  },
  welcome: {
    icon: Star,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    label: () => <>Welcome to HookLine! Start by exploring the <Link href="/map" className="text-blue-400 hover:text-blue-300">map</Link> and logging your first catch.</>,
    href: () => "/map",
  },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, read, created_at, entity_id, actor_id, profiles!notifications_actor_id_fkey(username)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (notifications?.some((n) => !n.read)) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  }

  type Notification = {
    id: string;
    type: string;
    read: boolean;
    created_at: string;
    entity_id: string | null;
    actor_id: string | null;
    profiles: { username: string } | null;
  };

  const notifs = (notifications ?? []) as unknown as Notification[];
  const unreadCount = notifs.filter((n) => !n.read).length;

  // Group notifications by date
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  function dateGroup(dateStr: string) {
    const t = new Date(dateStr).getTime();
    if (t >= todayStart) return "Today";
    if (t >= yesterdayStart) return "Yesterday";
    if (t >= weekStart) return "This Week";
    return "Earlier";
  }

  const groups: { label: string; items: Notification[] }[] = [];
  for (const n of notifs) {
    const label = dateGroup(n.created_at);
    const last = groups[groups.length - 1];
    if (last?.label === label) {
      last.items.push(n);
    } else {
      groups.push({ label, items: [n] });
    }
  }

  function renderNotif(n: Notification) {
    const actor = n.profiles?.username ?? null;
    const cfg = NOTIF_TYPES[n.type];

    if (!cfg) return (
      <div key={n.id} className="p-4 rounded-xl border border-white/6 bg-white/2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <Bell size={14} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{n.type.replace(/_/g, " ")}</p>
          <p className="text-xs text-slate-600 mt-0.5">{timeAgo(n.created_at)}</p>
        </div>
      </div>
    );

    const Icon = cfg.icon;
    const href = cfg.href(n.actor_id, n.entity_id);

    const inner = (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={15} className={cfg.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300 leading-snug">
            {cfg.label(actor, n.entity_id)}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{timeAgo(n.created_at)}</p>
        </div>
        {!n.read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
        )}
      </div>
    );

    return (
      <div
        key={n.id}
        className={`p-4 rounded-xl border transition-colors ${
          !n.read ? "border-blue-500/20 bg-blue-500/5" : "border-white/6 bg-white/2"
        }`}
      >
        {href ? (
          <Link href={href} className="block hover:opacity-80 transition-opacity">
            {inner}
          </Link>
        ) : inner}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
            <Bell className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-blue-400 mt-0.5">{unreadCount} new</p>
            )}
          </div>
        </div>
        <PushSubscribeButton />
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="opacity-30" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">You&apos;re all caught up</p>
          <p className="text-xs text-slate-700">
            Follow anglers and log catches to start getting notifications.
          </p>
          <Link href="/explore" className="mt-3 text-xs text-blue-500 hover:text-blue-400 inline-block transition-colors">
            Discover anglers →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">{group.label}</p>
              <div className="flex flex-col gap-2">
                {group.items.map(renderNotif)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
