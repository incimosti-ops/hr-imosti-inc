import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

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
import Overview from "./pages/Overview";
import Personal from "./pages/Personal";

function App() {
  return (
    <>
      {/* GLOBAL TOAST CONFIGURATION */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          // Global styles for all toasts
          style: {
            fontSize: '15px',      // Larger text
            padding: '15px 25px',  // More breathing room
            minWidth: '430px',     // Prevents squishing
            borderRadius: '12px',  // Modern rounded corners
            fontWeight: '500',     // Medium weight for clarity
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', // More elevation
          },
          // Specific configurations for different states
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              background: '#334155',
              color: '#fff',
            }
          }
        }}
      />

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

            {/* EMPLOYEE PROFILE (NESTED SYSTEM) */}
            <Route path="employees/:id" element={<EmployeeProfile />}>
              <Route index element={<Overview />} />
              <Route path="personal" element={<Personal />} />
              <Route path="files" element={<Files />} />
              <Route path="training" element={<Training />} />
              <Route path="reimbursement" element={<Reimbursement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;