import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Files from "./pages/Files";
import Training from "./pages/Training";
import Reimbursement from "./pages/Reimbursement";
import Library from "./pages/Library";
import OrgChart from "./pages/OrgChart";

import EmployeeProfile from "./pages/EmployeeProfile";

// 🔥 NEW TAB PAGES (create these)
import Overview from "./pages/Overview";
import Personal from "./pages/Personal";

function App() {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* MAIN APP */}
        <Route path="/" element={<Layout />}>

          {/* MAIN MODULES */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="files" element={<Files />} />
          <Route path="training" element={<Training />} />
          <Route path="reimbursement" element={<Reimbursement />} />
          <Route path="library" element={<Library />} />
          <Route path="orgchart" element={<OrgChart />} />

          {/* 🔥 EMPLOYEE PROFILE (NESTED SYSTEM) */}
          <Route path="employees/:id" element={<EmployeeProfile />}>

            {/* DEFAULT TAB */}
            <Route index element={<Overview />} />

            {/* INTERNAL TABS */}
            <Route path="personal" element={<Personal />} />
        
            <Route path="files" element={<Files />} />
            <Route path="training" element={<Training />} />
            <Route path="reimbursement" element={<Reimbursement />} />

          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;