import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type NotificationType = "success" | "error" | "info";

/** ホストが提供する通知関数。SDK 内の編集エンジンはこれ経由でのみ通知する。 */
export type ShowNotificationFn = (
  title: string,
  message: string,
  type?: NotificationType,
) => void | Promise<void>;

const noopNotification: ShowNotificationFn = () => {};

const NotificationContext = createContext<ShowNotificationFn>(noopNotification);

export function NotificationProvider({
  showNotification,
  children,
}: {
  showNotification: ShowNotificationFn;
  children: ReactNode;
}) {
  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
    </NotificationContext.Provider>
  );
}

/** ホストが注入した通知関数を取得する。未提供時は no-op。 */
export function useNotification(): ShowNotificationFn {
  return useContext(NotificationContext);
}
