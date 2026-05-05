import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../logo.png";


function Sidebar() {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "12px", // Modern rounded corners
    textDecoration: "none",
    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)", // Dim inactive text
    background: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    fontWeight: isActive ? "600" : "500",
    marginBottom: "8px",
    transition: "all 0.3s ease",
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none", // Subtle depth for active
    border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent"
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return (
    <div style={styles.sidebar}>
      
      {/* TOP */}
      <div>
        <div style={styles.logoContainer}>
          <img src={logo} alt="IMOSTI HRIS Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.navContainer}>
          <NavLink to="/dashboard" style={linkStyle}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/employees" style={linkStyle}>
            <Users size={20} />
            Employees
          </NavLink>
        </nav>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          Logout
        </button>

        <div style={styles.footerTextContainer}>
          <span style={styles.footerBrand}>IMOSTI HRIS</span>
          <small style={styles.footerVersion}>v1.0.0</small>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

const styles = {
  sidebar: {
    width: "260px", // Slightly wider for better text fit
    height: "100vh",
    background: "linear-gradient(160deg, #ff7b00 0%, #d65a00 100%)", // 🟧 Modern dynamic gradient
    color: "#fff",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    boxShadow: "4px 0 24px rgba(0,0,0,0.08)", // Softer, wider modern shadow
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
    zIndex: 100
  },

  logoContainer: {
    marginBottom: "40px",
    display: "flex",
    justifyContent: "center",
    padding: "0 10px"
  },

  logoImg: {
    width: "100%",
    maxWidth: "140px",
    objectFit: "contain",
    // 🔥 makes logo white AND adds a subtle shadow so it pops off the background
    filter: "brightness(0) invert(1) drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" 
  },

  navContainer: {
    display: "flex",
    flexDirection: "column",
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.15)", // Lighter border
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px",
    background: "rgba(0, 0, 0, 0.15)", // Darker translucent background
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  footerTextContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 4px"
  },

  footerBrand: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px"
  },

  footerVersion: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px"
  }
};