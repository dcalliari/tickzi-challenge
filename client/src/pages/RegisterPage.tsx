import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFormCard, AuthInput } from "@/components/AuthFormCard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			await register(name, email, password);
			navigate("/events");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to register");
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
					description="Create your account to get started"
					error={error}
					isLoading={isLoading}
					onSubmit={handleSubmit}
					submitLabel={isLoading ? "Creating account..." : "Register"}
					footerText="Already have an account?"
					footerLinkText="Login"
					footerLinkTo="/login"
				>
					<AuthInput
						id="name"
						label="Name"
						type="text"
						placeholder="Your name"
						value={name}
						onChange={setName}
						required
					/>
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
						minLength={6}
						helperText="Password must be at least 6 characters"
					/>
				</AuthFormCard>
			</div>
		</div>
	);
}
