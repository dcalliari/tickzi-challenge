import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
	children: React.ReactNode;
	error?: string;
}

export function AppLayout({ children }: AppLayoutProps) {
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="min-h-screen bg-background">
			<PageHeader user={user} onLogout={handleLogout} />
			<main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
