import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.content}>
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
    background: "#f1f5f9", // 🔥 global app background
    minHeight: "100vh"
  },

  content: {
    marginLeft: "250px", // 🔥 match your sidebar width
    width: "100%",
    minHeight: "100vh",
    overflowY: "auto"
  },

  inner: {
    padding: "30px",
    color: "#0f172a" // 🔥 FIX: proper readable default text
  }
};

export default Layout;