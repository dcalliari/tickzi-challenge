import { sign } from "hono/jwt";

export const generateToken = async (
	userId: string,
	email: string,
	secret: string,
): Promise<string> => {
	const payload = {
		userId,
		email,
		exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
	};

	return await sign(payload, secret);
};

export const hashPassword = async (password: string): Promise<string> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${password}salt`);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const comparePassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	const hashedInput = await hashPassword(password);
	return hashedInput === hash;
};
