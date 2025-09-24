import { notifications } from '@mantine/notifications';
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

type NotificationType = "success" | "error" | "info";

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "green";
    case "error":
      return "red";
    case "info":
      return "blue";
  }
};

export async function showNotification(title: string, message: string, type: NotificationType = "info") {
  // First, try to show Mantine notification for immediate feedback
  notifications.show({
    title,
    message,
    color: getNotificationColor(type),
    autoClose: 4000,
  });

  // Also attempt to show native notification
  try {
    let isGranted = await isPermissionGranted();
    if (!isGranted) {
      const permission = await requestPermission();
      isGranted = permission === "granted";
    }

    if (isGranted) {
      await sendNotification({ title, body: message });
    }
  } catch (error) {
    // If native notification fails, we still have the Mantine notification
    console.debug('Native notification failed, using web notification only', error);
  }
}