import {
	buildApiUrl,
	createAuthHeaders,
	handleApiError,
} from "@/lib/api-config";

export interface User {
	id: string;
	name: string;
	email: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export const authService = {
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		const response = await fetch(buildApiUrl("/api/auth/login"), {
			method: "POST",
			headers: createAuthHeaders(),
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await fetch(buildApiUrl("/api/auth/register"), {
			method: "POST",
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},
};
