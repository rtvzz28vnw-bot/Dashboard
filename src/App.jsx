import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./widgets/components/ProtectedRoute";
import { Dashboard, Auth } from "@/layouts";

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            {" "}
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/auth/*" element={<Auth />} />

      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
