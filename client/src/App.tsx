import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { PublicEventsPage } from "@/pages/PublicEventsPage";

function App() {
	return (
		<BrowserRouter>
			<Toaster />
			<Routes>
				<Route path="/" element={<PublicEventsPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
