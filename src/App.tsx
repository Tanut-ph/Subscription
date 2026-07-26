import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import ImportEmail from "./pages/ImportEmail";
import AddSubscription from "./pages/AddSubscription";

export default function App() {
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
