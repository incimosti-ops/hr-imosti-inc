import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../logo.png";

function Sidebar() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);

  // Responsive Listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false); // Close mobile menu if resized to desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "12px",
    textDecoration: "none",
    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
    background: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    fontWeight: isActive ? "600" : "500",
    marginBottom: "8px",
    transition: "all 0.3s ease",
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
    border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
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

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* MOBILE HEADER (Only visible on mobile) */}
      {isMobile && (
        <div style={styles.mobileHeader}>
          <button onClick={toggleMenu} style={styles.menuBtn}>
            <Menu size={24} color="#d65a00" />
          </button>
          <img src={logo} alt="Logo" style={styles.mobileLogo} />
        </div>
      )}

      {/* OVERLAY (Closes menu when clicking outside) */}
      {isMobile && isOpen && <div onClick={toggleMenu} style={styles.overlay} />}

      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          transform: isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
          width: isMobile ? "280px" : "260px",
        }}
      >
        {/* TOP */}
        <div>
          <div style={styles.logoContainer}>
            {isMobile && (
              <button onClick={toggleMenu} style={styles.closeBtn}>
                <X size={24} color="#fff" />
              </button>
            )}
            <img src={logo} alt="IMOSTI HRIS Logo" style={styles.logoImg} />
          </div>

          <nav style={styles.navContainer}>
            <NavLink to="/dashboard" style={linkStyle} onClick={() => isMobile && setIsOpen(false)}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink to="/employees" style={linkStyle} onClick={() => isMobile && setIsOpen(false)}>
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
    </>
  );
}

export default Sidebar;

const styles = {
  sidebar: {
    height: "100vh",
    background: "linear-gradient(160deg, #ff7b00 0%, #d65a00 100%)",
    color: "#fff",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
    zIndex: 1000,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  mobileHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    zIndex: 900,
  },

  menuBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
  },

  closeBtn: {
    position: "absolute",
    right: "10px",
    top: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  mobileLogo: {
    height: "30px",
    marginLeft: "12px",
    filter: "brightness(1) contrast(1.2)", // Show colored logo on white mobile header
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(2px)",
    zIndex: 950,
  },

  logoContainer: {
    marginBottom: "40px",
    display: "flex",
    justifyContent: "center",
    padding: "0 10px",
    position: "relative",
  },

  logoImg: {
    width: "100%",
    maxWidth: "140px",
    objectFit: "contain",
    filter: "brightness(0) invert(1) drop-shadow(0px 4px 6px rgba(0,0,0,0.15))",
  },

  navContainer: {
    display: "flex",
    flexDirection: "column",
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.15)",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px",
    background: "rgba(0, 0, 0, 0.15)",
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
    padding: "0 4px",
  },

  footerBrand: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },

  footerVersion: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
  },
};