import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFormCard, AuthInput } from "@/components/AuthFormCard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			await login(email, password);
			navigate("/events");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to login");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader />
			<div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
				<AuthFormCard
					title="Tickzi"
					description="Login to manage your events and tickets"
					error={error}
					isLoading={isLoading}
					onSubmit={handleSubmit}
					submitLabel={isLoading ? "Logging in..." : "Login"}
					footerText="Don't have an account?"
					footerLinkText="Register"
					footerLinkTo="/register"
				>
					<AuthInput
						id="email"
						label="Email"
						type="email"
						placeholder="your@email.com"
						value={email}
						onChange={setEmail}
						required
					/>
					<AuthInput
						id="password"
						label="Password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={setPassword}
						required
					/>
				</AuthFormCard>
			</div>
		</div>
	);
}
