import bcrypt from "bcryptjs";
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
	const salt = bcrypt.genSaltSync(10);
	return await bcrypt.hashSync(password, salt);
};

export const comparePassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	return await bcrypt.compareSync(password, hash);
};
