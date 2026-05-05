import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

function Dashboard() {
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [view, setView] = useState("employees"); // Default view
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole) navigate("/");
    else setRole(userRole);
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [empSnap, fileSnap, reimbSnap, trainingSnap] = await Promise.all([
        getDocs(collection(db, "employees")),
        getDocs(collection(db, "employeeFiles")),
        getDocs(collection(db, "reimbursements")),
        getDocs(collection(db, "trainings")),
      ]);

      setEmployees(empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFiles(fileSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReimbursements(reimbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTrainings(trainingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("role");
    navigate("/");
  };

  // Helper: Filter reimbursements by status
  const getFilteredReimbursements = (status) => reimbursements.filter(r => r.status === status);

  // Logic: ACCURATE Individual Employee Balance Calculation
  const getEmployeeRemainingMBL = (empId, empName, allocatedMBL) => {
    const usedTotal = reimbursements
      .filter(r => {
        // Precise matching by ID, with a fallback to name if ID is missing
        const isEmployeeMatch = r.employeeId === empId || 
                               (r.employeeName?.trim().toLowerCase() === empName?.trim().toLowerCase());
        
        // We subtract both Approved AND Pending to show the real remaining balance
        const isRelevantStatus = r.status === "Approved" || r.status === "Pending";
        
        return isEmployeeMatch && isRelevantStatus;
      })
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    
    return (Number(allocatedMBL) || 0) - usedTotal;
  };

  // Logic: Global Financial Totals
  const totalAllocatedMBL = employees.reduce((sum, emp) => sum + (Number(emp.allocatedMBL) || 0), 0);
  const totalUsedMBL = reimbursements
    .filter(r => r.status === "Approved" || r.status === "Pending")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalRemainingMBL = totalAllocatedMBL - totalUsedMBL;

  return (
    <div style={styles.container}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>HR Management Portal</h1>
          <p style={styles.subText}>Welcome back, <span style={{ color: "#f97316", fontWeight: "600" }}>{role}</span></p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {/* --- MBL SUMMARY SECTION --- */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>Financial Overview (MBL)</h3>
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: "4px solid #6366f1" }}>
            <p style={styles.statLabel}>Total Allocated</p>
            <h2 style={styles.statValue}>₱{totalAllocatedMBL.toLocaleString()}</h2>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #f97316" }}>
            <p style={styles.statLabel}>Total (Approved + Pending)</p>
            <h2 style={styles.statValue}>₱{totalUsedMBL.toLocaleString()}</h2>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #10b981" }}>
            <p style={styles.statLabel}>Actual Remaining Fund</p>
            <h2 style={{ ...styles.statValue, color: "#10b981" }}>₱{totalRemainingMBL.toLocaleString()}</h2>
          </div>
        </div>
      </section>

      {/* --- OPERATIONS CARDS --- */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>System Operations</h3>
        <div style={styles.grid}>
          {[
            { id: "employees", label: "Employees", count: employees.length, icon: "👥" },
            { id: "files", label: "Files", count: files.length, icon: "📁" },
            { id: "trainings", label: "Trainings", count: trainings.length, icon: "🎓" },
            { id: "pending", label: "Pending", count: getFilteredReimbursements("Pending").length, icon: "⏳" },
            { id: "approved", label: "Approved", count: getFilteredReimbursements("Approved").length, icon: "✅" },
            { id: "rejected", label: "Rejected", count: getFilteredReimbursements("Rejected").length, icon: "❌" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setView(item.id)}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.opCard,
                borderColor: view === item.id ? "#f97316" : "#e2e8f0",
                transform: hoveredCard === item.id ? "translateY(-5px)" : "none",
                boxShadow: hoveredCard === item.id ? "0 10px 20px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <span style={styles.cardIcon}>{item.icon}</span>
              <div>
                <p style={styles.cardLabel}>{item.label}</p>
                <h2 style={styles.cardCount}>{item.count}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- DATA TABLE VIEW --- */}
      <section style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>{view.toUpperCase()} RECORDS</h3>
          <span style={styles.badge}>{view}</span>
        </div>

        <div style={styles.tableBody}>
          {/* EMPLOYEES VIEW WITH REAL-TIME BALANCE */}
          {view === "employees" && employees.map(emp => {
            const remaining = getEmployeeRemainingMBL(emp.id, emp.name, emp.allocatedMBL);
            return (
              <div key={emp.id} style={styles.row}>
                <div style={styles.rowMain}>{emp.name}</div>
                <div style={styles.rowSub}>{emp.position}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={styles.rowTag}>₱{Number(emp.allocatedMBL || 0).toLocaleString()} Max</div>
                  <div style={{ 
                    ...styles.rowTag, 
                    backgroundColor: remaining <= 0 ? "#fee2e2" : "#dcfce7", 
                    color: remaining <= 0 ? "#ef4444" : "#16a34a",
                    border: `1px solid ${remaining <= 0 ? "#fecaca" : "#bbf7d0"}`
                  }}>
                    ₱{remaining.toLocaleString()} Left
                  </div>
                </div>
              </div>
            );
          })}

          {view === "files" && files.map(file => (
            <div key={file.id} style={styles.row}>
              <div style={styles.rowMain}>{file.fileName}</div>
              <div style={styles.rowSub}>{file.employeeName}</div>
            </div>
          ))}

          {view === "trainings" && trainings.map(t => (
            <div key={t.id} style={styles.row}>
              <div style={styles.rowMain}>{t.trainingTitle || "Untitled Training"}</div>
              <div style={styles.rowSub}>{t.employeeName}</div>
            </div>
          ))}

          {["pending", "approved", "rejected"].includes(view) && 
            getFilteredReimbursements(view.charAt(0).toUpperCase() + view.slice(1)).map(r => (
              <div key={r.id} style={styles.row}>
                <div style={styles.rowMain}>{r.employeeName}</div>
                <div style={styles.rowSub}>Amount: ₱{Number(r.amount).toLocaleString()}</div>
                <div style={{...styles.statusDot, backgroundColor: view === 'pending' ? '#f59e0b' : view === 'approved' ? '#10b981' : '#ef4444'}}></div>
              </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { padding: "40px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "800", margin: 0 },
  subText: { color: "#64748b", marginTop: "5px" },
  logoutBtn: { padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", cursor: "pointer" },
  section: { marginBottom: "40px" },
  sectionHeading: { fontSize: "14px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "15px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" },
  statCard: { background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  statLabel: { margin: 0, color: "#64748b", fontSize: "14px" },
  statValue: { margin: "10px 0 0 0", fontSize: "28px", fontWeight: "700" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  opCard: { background: "#fff", padding: "20px", borderRadius: "16px", cursor: "pointer", border: "2px solid transparent", display: "flex", alignItems: "center", gap: "15px", transition: "all 0.3s" },
  cardIcon: { fontSize: "24px" },
  cardLabel: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "600" },
  cardCount: { margin: 0, fontSize: "24px", fontWeight: "700" },
  tableSection: { background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0" },
  tableHeader: { padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  badge: { background: "#fff7ed", color: "#f97316", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  tableBody: { padding: "10px 0" },
  row: { display: "flex", alignItems: "center", padding: "16px 25px", borderBottom: "1px solid #f8fafc" },
  rowMain: { flex: 2, fontWeight: "600" },
  rowSub: { flex: 2, color: "#94a3b8", fontSize: "14px" },
  rowTag: { background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  statusDot: { width: "10px", height: "10px", borderRadius: "50%", marginLeft: "10px" }
};

export default Dashboard;