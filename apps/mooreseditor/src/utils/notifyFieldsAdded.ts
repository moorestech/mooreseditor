import { showNotification } from "./notification";

/**
 * 追加されたフィールドをユーザーに通知
 * @param menuItem メニューアイテム名
 * @param addedFields 追加されたフィールドのパス配列
 */
export async function notifyFieldsAdded(
  menuItem: string,
  addedFields: string[],
): Promise<void> {
  if (addedFields.length === 0) {
    return;
  }

  console.log(`Filled missing required fields for ${menuItem}:`, addedFields);

  // 表示するフィールド数を制限
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