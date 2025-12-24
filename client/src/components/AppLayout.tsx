import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

interface AppLayoutProps {
	children: React.ReactNode;
	error?: string;
}

export function AppLayout({ children }: AppLayoutProps) {
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader onLogout={handleLogout} />
			<main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
