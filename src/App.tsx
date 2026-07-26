import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import ImportEmail from "./pages/ImportEmail";
import AddSubscription from "./pages/AddSubscription";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { enabled, loading, user } = useAuth();

  if (enabled && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // When Supabase auth is on, require a signed-in user.
  if (enabled && !user) {
    return <Login />;
  }

  return (
    <SubscriptionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/import" element={<ImportEmail />} />
            <Route path="/add" element={<AddSubscription />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SubscriptionProvider>
  );
}
