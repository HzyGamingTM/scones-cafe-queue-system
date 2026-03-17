import { redis } from "./redis"

const subscriptions = new Map<string, PushSubscriptionJSON>();

export function saveSubscription(sub: PushSubscriptionJSON) {
  if (sub.endpoint) redis.set(sub.endpoint, sub);
}

export function removeSubscription(endpoint: string) {
    redis.del(endpoint);
}

export async function sendPushNotification() {
    if (subscriptions.size === 0) return;
    const webpush = require('web-push');
    webpush.setVapidDetails(
        "",
        process.env.PUBLIC_VAPID_KEY!,
        process.env.PRIVATE_VAPID_KEY!
    );

    const payload = '';

    const sends = [...subscriptions.values()].map(async (sub) => {
        try {
            await webpush.sendNotification(sub as any, payload);
        } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                redis.del(sub.endpoint!);
            }
        }
    });

    await Promise.allSettled(sends);
}