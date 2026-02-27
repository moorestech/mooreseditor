/**
 * Notification service.
 *
 * Shows in-app (Mantine) notifications and optionally native (Tauri) notifications.
 */

import { notifications } from "@mantine/notifications";

type NotificationType = "success" | "error" | "info";

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  success: "green",
  error: "red",
  info: "blue",
};

/**
 * Show a notification to the user.
 * Always shows a Mantine in-app toast. Also attempts native notification.
 */
export async function showNotification(
  title: string,
  message: string,
  type: NotificationType = "info",
): Promise<void> {
  // Mantine notification for immediate feedback
  notifications.show({
    title,
    message,
    color: NOTIFICATION_COLORS[type],
    autoClose: 4000,
  });

  // Also attempt native notification
  try {
    const { isPermissionGranted, requestPermission, sendNotification } =
      await import("@tauri-apps/plugin-notification");

    let isGranted = await isPermissionGranted();
    if (!isGranted) {
      const permission = await requestPermission();
      isGranted = permission === "granted";
    }

    if (isGranted) {
      await sendNotification({ title, body: message });
    }
  } catch {
    // Native notification not available — Mantine notification suffices
  }
}

/**
 * Notify the user about auto-filled missing required fields.
 */
export async function notifyFieldsAdded(
  menuItem: string,
  addedFields: string[],
): Promise<void> {
  if (addedFields.length === 0) return;

  console.log(`Filled missing required fields for ${menuItem}:`, addedFields);

  const fieldsToShow = addedFields.slice(0, 5);
  const remainingCount = addedFields.length - 5;
  const message =
    remainingCount > 0
      ? `${fieldsToShow.join(", ")} 他${remainingCount}件`
      : fieldsToShow.join(", ");

  await showNotification(
    "必須フィールドを補完しました",
    `${menuItem}: ${message}`,
    "info",
  );
}
