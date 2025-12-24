import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CreateEventPage } from "@/pages/CreateEventPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyEventsPage } from "@/pages/MyEventsPage";
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
					<Route
						path="/events"
						element={
							<ProtectedRoute>
								<MyEventsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/events/create"
						element={
							<ProtectedRoute>
								<CreateEventPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
