import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={{ 
        ...styles.content, 
        marginLeft: isMobile ? "0" : "260px" // Match sidebar width
      }}>
        <div style={styles.inner}>
          <Outlet />
        </div>
      </div>
    </div>  
  );
}

const styles = {
  container: {
    display: "flex",
    background: "#f1f5f9", 
    minHeight: "100vh"
  },
  content: {
    width: "100%",
    minHeight: "100vh",
    transition: "margin-left 0.3s ease", // Smooth transition when resizing
  },
  inner: {
    padding: "0px", // Let individual pages handle their internal spacing
    color: "#0f172a" 
  }
};

export default Layout;