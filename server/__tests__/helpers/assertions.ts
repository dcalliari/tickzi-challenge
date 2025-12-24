import { expect } from "bun:test";

export function expectUUID(value: string) {
	expect(value).toMatch(/^[a-f0-9-]{36}$/);
}

export function expectApiSuccess(response: any) {
	expect(response.data).toBeDefined();
}

export function expectPaginationResponse(response: any) {
	expect(response.pagination).toBeDefined();
	expect(response.pagination.page).toBeNumber();
	expect(response.pagination.limit).toBeNumber();
	expect(response.pagination.total).toBeNumber();
	expect(response.pagination.totalPages).toBeNumber();
	expect(Array.isArray(response.data)).toBe(true);
}
