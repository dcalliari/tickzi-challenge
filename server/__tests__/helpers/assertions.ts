import { expect } from "bun:test";

export function expectUUID(value: string) {
	expect(value).toMatch(/^[a-f0-9-]{36}$/);
}
