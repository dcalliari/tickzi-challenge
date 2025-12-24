import { createContext, useContext, useEffect, useState } from "react";
import { authService, type User } from "@/services/auth.service";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		const data = await authService.login({ email, password });
		setUser(data.user);
		setToken(data.token);
		localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.user));
	};

	const register = async (name: string, email: string, password: string) => {
		const data = await authService.register({ name, email, password });
		setUser(data.user);
		setToken(data.token);
		localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.user));
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider
			value={{ user, token, login, register, logout, isLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
