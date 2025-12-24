export const API_CONFIG = {
	baseUrl: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
} as const;

export function buildApiUrl(path: string): string {
	return `${API_CONFIG.baseUrl}${path}`;
}

export function createAuthHeaders(token?: string | null): HeadersInit {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return headers;
}

export async function handleApiError(response: Response): Promise<never> {
	const errorData = await response.json().catch(() => ({
		error: "An unexpected error occurred",
	}));

	throw new Error(
		errorData.error || `Request failed with status ${response.status}`,
	);
}
