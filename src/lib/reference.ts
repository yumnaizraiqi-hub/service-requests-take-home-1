import { randomUUID } from "crypto";

export function generateReference(): string {
  return `SR-${randomUUID().slice(0, 8).toUpperCase()}`;
}