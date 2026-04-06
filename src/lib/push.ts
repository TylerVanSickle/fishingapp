import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

function initVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mailto = process.env.VAPID_MAILTO;
  if (!pub || !priv || !mailto) return false;
  webpush.setVapidDetails(mailto, pub, priv);
  return true;
}

type PushPayload = { title: string; body: string; url?: string };

export async function sendPushToUser(
  supabase: SupabaseClient,
  userId: string,
  payload: PushPayload
) {
  if (!initVapid()) return;

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription")
    .eq("user_id", userId);

  if (!subs?.length) return;

  const dead: string[] = [];

  await Promise.allSettled(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription as webpush.PushSubscription,
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) dead.push(row.endpoint);
      }
    })
  );

  // Clean up expired subscriptions
  if (dead.length) {
    await supabase.from("push_subscriptions").delete().in("endpoint", dead);
  }
}
