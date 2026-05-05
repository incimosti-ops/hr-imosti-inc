import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function EmployeeProfile() {
  const { id } = useParams();
  const location = useLocation();

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    const docRef = doc(db, "employees", id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      setEmployee(snap.data());
    }
  };

  if (!employee)
    return <p style={{ color: "#64748b", padding: "20px" }}>Loading...</p>;

  // 🔥 Better active detection
  const isActive = (path) => {
    if (path === "overview") {
      return location.pathname === `/employees/${id}`;
    }
    return location.pathname.includes(path);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.name}>{employee.name}</h2>

      <p style={styles.sub}>
        {employee.position} • {employee.department}
      </p>

      {/* 🔥 NAV TABS */}
      <div style={styles.tabs}>
        <Link
          to=""
          style={isActive("overview") ? styles.activeTab : styles.tab}
        >
          Overview
        </Link>

        <Link
          to="personal"
          style={isActive("personal") ? styles.activeTab : styles.tab}
        >
          Personal
        </Link>

        <Link
          to="files"
          style={isActive("files") ? styles.activeTab : styles.tab}
        >
          Files
        </Link>

        <Link
          to="training"
          style={isActive("training") ? styles.activeTab : styles.tab}
        >
          Training
        </Link>

        <Link
          to="reimbursement"
          style={isActive("reimbursement") ? styles.activeTab : styles.tab}
        >
          Reimbursement
        </Link>
      </div>

      {/* 🔥 CONTENT */}
      <div style={styles.content}>
        <Outlet context={{ employee, id }} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f8fafc", // 🤍 clean system background
    minHeight: "100vh",
    color: "#0f172a"
  },

  name: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "4px"
  },

  sub: {
    color: "#64748b",
    marginBottom: "25px"
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.7)",
    padding: "8px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid #e2e8f0"
  },

  tab: {
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#64748b",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },

  activeTab: {
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    background: "#f97316", // 🟧 brand orange
    color: "#fff",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(249,115,22,0.25)"
  },

  content: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
  }
};

export default EmployeeProfile;