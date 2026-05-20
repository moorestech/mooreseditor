import { v7 as uuidv7 } from "uuid";

export function generateUuid(): string {
  return uuidv7();
}
