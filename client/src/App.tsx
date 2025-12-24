import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { PublicEventsPage } from "@/pages/PublicEventsPage";
import { RegisterPage } from "@/pages/RegisterPage";

function App() {
	return (
		<BrowserRouter>
			<Toaster />
			<AuthProvider>
				<Routes>
					<Route path="/" element={<PublicEventsPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
