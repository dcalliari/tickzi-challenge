export type ApiResponse = {
	message: string;
	success: true;
};

export type ApiErrorResponse = {
	error: string;
	message: string;
	success: false;
};
