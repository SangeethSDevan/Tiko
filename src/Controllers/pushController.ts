import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

function assertEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return val;
}

const serviceAccount: ServiceAccount = {
  projectId: assertEnv("FIREBASE_PROJECT_ID"),
  clientEmail: assertEnv("FIREBASE_CLIENT_EMAIL"),
  privateKey: assertEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const prisma = new PrismaClient();

async function getTodayRemindersRaw(): Promise<
  {
    userId: string;
    fcmToken: string;
    title: string | null;
    description: string | null;
    reccurence: string;
  }[]
> {
  const results = await prisma.$queryRaw<
    {
      eventId: number;
      title: string | null;
      description: string | null;
      reccurence: string;
      eventDate: Date;
      userId: string;
      fcm_token: string | null;
    }[]
  >`
    SELECT 
      e."eventId",
      e."title",
      e."description",
      e."reccurence",
      e."eventDate",
      u."userId",
      t."fcm_token"
    FROM "Events" e
    JOIN "User" u ON e."userId" = u."userId"
    LEFT JOIN "Token" t ON u."userId" = t."user_id"
    WHERE
      e."reccurence" != 'NONE'
      AND (
        (e."reccurence" = 'DAILY')
        OR (e."reccurence" = 'WEEKLY' AND EXTRACT(DOW FROM e."eventDate") = EXTRACT(DOW FROM NOW()))
        OR (e."reccurence" = 'MONTHLY' AND EXTRACT(DAY FROM e."eventDate") = EXTRACT(DAY FROM NOW()))
        OR (e."reccurence" = 'YEARLY' AND e."ddmm" = TO_CHAR(NOW(), 'DDMM'))
      );
  `;

  return results
    .filter(r => r.fcm_token)
    .map(r => ({
      userId: r.userId,
      fcmToken: r.fcm_token!,
      title: r.title,
      description: r.description,
      reccurence: r.reccurence,
    }));
}

export async function sendNotifications() {
  const reminders = await getTodayRemindersRaw();

  if (reminders.length === 0) {
    console.log("✅ No reminders for today.");
    return;
  }

  console.log(`📅 Found ${reminders.length} reminders. Sending notifications...`);

  const messages = reminders.map(r => ({
    token: r.fcmToken,
    notification: {
      title: r.title || "Reminder",
      body: r.description || "You have a scheduled event today.",
    },
    data: {
      userId: r.userId,
      eventType: r.reccurence || "NONE",
    },
  }));

  const BATCH_SIZE = 500;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      const response = await admin.messaging().sendEach(batch);
      console.log(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ✅ ${response.successCount} sent, ❌ ${response.failureCount} failed`
      );
    } catch (err) {
      console.error("⚠️ Error sending batch:", err);
    }
  }

  console.log("🏁 All notifications processed.");
}

sendNotifications()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
