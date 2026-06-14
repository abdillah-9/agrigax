import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import RouteIndex from "../routes";

export default function Index() {
  return (
    <AuthProvider>
      <Router>
        <RouteIndex />
      </Router>
    </AuthProvider>
  );
}
