import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Exhibits from "@/pages/Exhibits";
import Institutions from "@/pages/Institutions";
import Loans from "@/pages/Loans";
import NewLoan from "@/pages/NewLoan";
import Risks from "@/pages/Risks";
import Transport from "@/pages/Transport";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exhibits" element={<Exhibits />} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="loans" element={<Loans />} />
          <Route path="loans/new" element={<NewLoan />} />
          <Route path="risks" element={<Risks />} />
          <Route path="transport" element={<Transport />} />
        </Route>
      </Routes>
    </Router>
  );
}
