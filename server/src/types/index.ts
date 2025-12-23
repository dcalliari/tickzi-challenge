export interface JWTPayload {
	userId: string;
	email: string;
	exp: number;
}

export interface PaginatedResponse<T> {
	success: true;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
