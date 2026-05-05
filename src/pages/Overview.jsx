import { useOutletContext } from "react-router-dom";

function Overview() {
  const { employee } = useOutletContext();

  if (!employee) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Overview</h2>
      
      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.label}>Employee ID</span>
          <span style={styles.value}>{employee.employeeId || "N/A"}</span>
        </div>
        
        <div style={styles.row}>
          <span style={styles.label}>Employment Status</span>
          <span style={{...styles.value, color: "#f97316", fontWeight: "700"}}>
            {employee.status || "N/A"}
          </span>
        </div>
        
        <div style={styles.row}>
          <span style={styles.label}>Employment Type</span>
          <span style={styles.value}>{employee.employmentType || "N/A"}</span>
        </div>
        
        <div style={styles.row}>
          <span style={styles.label}>Location</span>
          <span style={styles.value}>{employee.location || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: "30px", 
    background: "#f8fafc", 
    minHeight: "100vh", 
    fontFamily: "system-ui, -apple-system, sans-serif" 
  },
  title: { 
    marginBottom: "25px", 
    color: "#1e293b", 
    fontSize: "26px" 
  },
  card: { 
    background: "#ffffff", 
    padding: "30px", 
    borderRadius: "16px", 
    border: "1px solid #e2e8f0", 
    maxWidth: "600px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  row: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: "16px 0", 
    borderBottom: "1px solid #f1f5f9" 
  },
  label: { 
    color: "#64748b", 
    fontWeight: "500", 
    fontSize: "14px" 
  },
  value: { 
    color: "#1e293b", 
    fontWeight: "600", 
    fontSize: "15px" 
  }
};

export default Overview;