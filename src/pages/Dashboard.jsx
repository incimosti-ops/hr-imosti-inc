import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from "recharts";

function Dashboard() {
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [training, setTraining] = useState([]);
  const [view, setView] = useState("employees");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // New states for button hover effects
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();

  // Listen to window resize to toggle mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole) navigate("/");
    else setRole(userRole);
    fetchStats();
  }, [navigate]);

  // Reset pagination to page 1 whenever the view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  const fetchStats = async () => {
    try {
      const [empSnap, fileSnap, reimbSnap, trainingSnap] = await Promise.all([
        getDocs(collection(db, "employees")),
        getDocs(collection(db, "employeeFiles")),
        getDocs(collection(db, "reimbursements")),
        getDocs(collection(db, "training")),
      ]);

      setEmployees(empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFiles(fileSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReimbursements(reimbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTraining(trainingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("role");
    navigate("/");
  };

  // --- LOGIC: ANALYTICS CALCULATIONS ---
  const availmentStats = reimbursements.reduce((acc, r) => {
    if (r.status !== "Approved") return acc;
    const type = r.particulars === "Dependent" ? "Dependent" : "Employee";
    acc[type].count += 1;
    acc[type].amount += (Number(r.amount) || 0);
    return acc;
  }, { Employee: { count: 0, amount: 0 }, Dependent: { count: 0, amount: 0 } });

  const barData = [
    { name: "Availment", Employee: availmentStats.Employee.count, Dependent: availmentStats.Dependent.count }
  ];

  const totalAllocatedMBL = employees.reduce((sum, emp) => sum + (Number(emp.allocatedMBL) || 0), 0);
  const totalUsedMBL = reimbursements
    .filter(r => r.status === "Approved" || r.status === "Pending")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  
  const budgetPieData = [
    { name: "Remaining Budget", value: Math.max(0, totalAllocatedMBL - totalUsedMBL) },
    { name: "Total Used", value: totalUsedMBL }
  ];

 const topDiagnoses = Object.entries(
  reimbursements.reduce((acc, r) => {
    if (r.diagnosis) {
      // Normalize text
      const normalizedDiagnosis = r.diagnosis
        .trim()
        .toLowerCase();

      acc[normalizedDiagnosis] = (acc[normalizedDiagnosis] || 0) + 1;
    }

    return acc;
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

  const COLORS = ["#475569", "#f97316"]; 

  const getFilteredReimbursements = (status) => reimbursements.filter(r => r.status === status);

  const getEmployeeRemainingMBL = (empId, empName, allocatedMBL) => {
    const usedTotal = reimbursements
      .filter(r => {
        const isEmployeeMatch = r.employeeId === empId || 
                               (r.employeeName?.trim().toLowerCase() === empName?.trim().toLowerCase());
        const isRelevantStatus = r.status === "Approved" || r.status === "Pending";
        return isEmployeeMatch && isRelevantStatus;
      })
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return (Number(allocatedMBL) || 0) - usedTotal;
  };

  // --- LOGIC: PAGINATION ---
  let currentViewData = [];
  if (view === "employees") currentViewData = employees;
  else if (view === "files") currentViewData = files;
  else if (view === "training") currentViewData = training;
  else if (["pending", "approved", "rejected"].includes(view)) {
    currentViewData = getFilteredReimbursements(view.charAt(0).toUpperCase() + view.slice(1));
  }

  const totalPages = Math.ceil(currentViewData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = currentViewData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- STYLES OBJECT (Moved inside to access isMobile) ---
  const styles = {
    container: { 
      background: "#f1f5f9", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif", 
      color: "#1e293b", 
      boxSizing: "border-box",
      paddingLeft: isMobile ? "20px" : "40px", 
      paddingRight: isMobile ? "20px" : "40px",
      paddingTop: isMobile ? "80px" : "40px", 
      paddingBottom: "40px",
      width: "100%",
    },
    header: { 
      display: "flex", 
      justifyContent: "space-between", 
      marginBottom: "30px",
      width: "100%" 
    },
    title: { fontWeight: "800", margin: 0 },
    subText: { color: "#64748b", marginTop: "5px" },
    logoutBtn: { padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", cursor: "pointer", transition: "0.2s" },
    analyticsRow: { 
      display: "grid", 
      gap: "25px", 
      marginBottom: "40px",
      gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
      width: "100%"
    },
    analyticsCard: { background: "#fff", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" },
    chartTitle: { textAlign: "center", marginBottom: "20px", fontSize: "14px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
    availmentTable: { width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" },
    th: { padding: "10px", borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", fontWeight: "600" },
    td: { padding: "12px 10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" },
    diagnosisBox: { marginTop: "20px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
    diagnosisHeader: { backgroundColor: "#f97316", color: "#fff", padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px", textTransform: "uppercase" },
    diagnosisList: { backgroundColor: "#fff", padding: "5px 15px" },
    diagnosisItem: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9", fontSize: "13px" },
    section: { marginBottom: "40px" },
    sectionHeading: { fontSize: "13px", textTransform: "uppercase", color: "#0f0f10", marginBottom: "15px", fontWeight: "700" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" },
    opCard: { background: "#fff", padding: "20px", borderRadius: "16px", cursor: "pointer", border: "2px solid transparent", display: "flex", alignItems: "center", gap: "15px", transition: "all 0.3s" },
    cardIcon: { fontSize: "24px" },
    cardLabel: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "600" },
    cardCount: { margin: 0, fontSize: "24px", fontWeight: "700" },
    tableSection: { 
      background: "#fff", 
      borderRadius: "20px", 
      overflowX: "auto", 
      border: "1px solid #e2e8f0",
      width: "100%"
    },
    tableHeader: { padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
    badge: { background: "#fff7ed", color: "#f97316", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
    tableBody: { padding: "0" },
    row: { display: "flex", padding: "16px 25px", borderBottom: "1px solid #f8fafc" },
    rowMain: { fontWeight: "600" },
    rowSub: { color: "#94a3b8", fontSize: "14px" },
    rowTag: { background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" },
    statusDot: { width: "10px", height: "10px", borderRadius: "50%" },
    paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 25px", borderTop: "1px solid #4789cb", background: "#fcfcfd" },
    pageBtn: { padding: "10px 20px", borderRadius: "50px", fontWeight: "700", fontSize: "13px", letterSpacing: "0.5px", transition: "all 0.3s ease-in-out", display: "flex", alignItems: "center", gap: "8px", outline: "none" },
    pageIndicatorWrapper: { background: "#f1f5f9", padding: "6px 16px", borderRadius: "20px", border: "1px solid #e2e8f0" },
    pageInfo: { fontSize: "13px", fontWeight: "600", color: "#64748b" },
    pageHighlight: { color: "#f97316", fontWeight: "800" }
  };

  // Dynamic style helper for pagination buttons
  const getBtnStyle = (isDisabled, isHovered) => ({
    ...styles.pageBtn,
    backgroundColor: isDisabled ? "#076ed5" : (isHovered ? "#ea580c" : "#f97316"),
    color: "#ffffff",
    boxShadow: isDisabled ? "none" : (isHovered ? "0 6px 15px rgba(249, 115, 22, 0.4)" : "0 2px 5px rgba(249, 115, 22, 0.2)"),
    cursor: isDisabled ? "not-allowed" : "pointer",
    transform: isHovered && !isDisabled ? "translateY(-2px)" : "translateY(0)",
    border: isDisabled ? "1px solid #e2e8f0" : "1px solid transparent",
  });

  return (
    <div style={styles.container}>
      <header
        style={{
          ...styles.header,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "15px" : "0",
        }}
      >
        <div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? "24px" : "32px" }}>
            HR Management Portal
          </h1>
          <p style={styles.subText}>
            Welcome back,{" "}
            <span style={{ color: "#f97316", fontWeight: "600" }}>{role}</span>
          </p>
        </div>
      </header>

      {/* --- ANALYTICS SECTION --- */}
      <div style={styles.analyticsRow}>
        <div style={styles.analyticsCard}>
          <div style={{ height: 260 }}>
            <h4 style={styles.chartTitle}>Availment of Medical Reimbursement</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Employee" fill="#ef4444" barSize={isMobile ? 40 : 60} label={{ position: 'top', fontSize: 12, fontWeight: 'bold' }} />
                <Bar dataKey="Dependent" fill="#f97316" barSize={isMobile ? 40 : 60} label={{ position: 'top', fontSize: 12, fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "30px", overflowX: "auto" }}>
            <table style={{ ...styles.availmentTable, minWidth: isMobile ? "400px" : "auto" }}>
              <thead>
                <tr>
                  <th colSpan="2" style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", padding: "8px" }}>Total Count</th>
                  <th colSpan="2" style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", padding: "8px" }}>Total Amount</th>
                </tr>
                <tr style={{ backgroundColor: "#cbd5e1" }}>
                  <th style={styles.th}>Employees</th>
                  <th style={styles.th}>Dependent</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Dependent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>{availmentStats.Employee.count}</td>
                  <td style={styles.td}>{availmentStats.Dependent.count}</td>
                  <td style={styles.td}>₱{availmentStats.Employee.amount.toLocaleString()}</td>
                  <td style={styles.td}>₱{availmentStats.Dependent.amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ ...styles.td, fontWeight: "700", textAlign: "right" }}>Total Disbursement:</td>
                  <td colSpan="2" style={{ ...styles.td, backgroundColor: "#facc15", fontWeight: "bold" }}>
                    ₱{(availmentStats.Employee.amount + availmentStats.Dependent.amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <div style={{ height: 260 }}>
            <h4 style={styles.chartTitle}>Budget Allocation Utilization</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  innerRadius={isMobile ? 45 : 60}
                  outerRadius={isMobile ? 70 : 85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {budgetPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.diagnosisBox}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "5px" : "0", justifyContent: "space-between", padding: "10px 15px", fontSize: "13px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
               <div><span style={{ color: "#475569" }}>●</span> <b>Budget:</b> ₱{totalAllocatedMBL.toLocaleString()}</div>
               <div><span style={{ color: "#f97316" }}>●</span> <b>Used:</b> ₱{totalUsedMBL.toLocaleString()}</div>
            </div>
            <div style={styles.diagnosisHeader}>Top Diagnosis</div>
            <div style={styles.diagnosisList}>
              {topDiagnoses.length > 0 ? topDiagnoses.map(([name, count], i) => (
                <div key={i} style={styles.diagnosisItem}>
                  <span>{name.toUpperCase()}</span>
                  <span style={{ fontWeight: "700", color: "#f97316" }}>{count}</span>
                </div>
              )) : <div style={styles.diagnosisItem}>No data recorded</div>}
            </div>
          </div>
        </div>
      </div>

      {/* --- OPERATIONS CARDS --- */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>System Operations</h3>
        <div style={styles.grid}>
          {[
            { id: "employees", label: "Employees", count: employees.length, icon: "👥" },
            { id: "files", label: "Files", count: files.length, icon: "📁" },
            { id: "training", label: "Training", count: training.length, icon: "🎓" },
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
                transform: hoveredCard === item.id && !isMobile ? "translateY(-5px)" : "none",
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

      {/* --- DATA TABLE VIEW WITH PAGINATION --- */}
      <section style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: isMobile ? "16px" : "18px" }}>{view.toUpperCase()} RECORDS</h3>
          <span style={styles.badge}>{view}</span>
        </div>

        <div style={styles.tableBody}>
          {view === "employees" && paginatedData.map(emp => {
            const remaining = getEmployeeRemainingMBL(emp.id, emp.name, emp.allocatedMBL);
            return (
              <div key={emp.id} style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "10px" : "0" }}>
                <div style={{ ...styles.rowMain, flex: isMobile ? "none" : 2 }}>{emp.name}</div>
                <div style={{ ...styles.rowSub, flex: isMobile ? "none" : 2 }}>{emp.position}</div>
                <div style={{ display: 'flex', gap: '8px', width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
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

          {view === "files" && paginatedData.map(file => (
            <div key={file.id} style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "5px" : "0" }}>
              <div style={{ ...styles.rowMain, flex: isMobile ? "none" : 2 }}>{file.fileName}</div>
              <div style={{ ...styles.rowSub, flex: isMobile ? "none" : 2 }}>{file.employeeName}</div>
            </div>
          ))}

          {view === "training" && paginatedData.map(t => (
            <div key={t.id} style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "5px" : "0" }}>
              <div style={{ ...styles.rowMain, flex: isMobile ? "none" : 2 }}>{t.training || "Untitled Training"}</div>
              <div style={{ ...styles.rowSub, flex: isMobile ? "none" : 2 }}>
                {t.employeeName} 
                <span style={{ margin: "0 8px", color: "#e2e8f0", display: isMobile ? "none" : "inline" }}>|</span>
                <span style={{ display: isMobile ? "block" : "inline", marginTop: isMobile ? "4px" : "0" }}>
                  ₱{(Number(t.cost) || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {["pending", "approved", "rejected"].includes(view) && 
            paginatedData.map(r => (
              <div key={r.id} style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "8px" : "0" }}>
                <div style={{ ...styles.rowMain, flex: isMobile ? "none" : 2 }}>
                  {r.employeeName}
                </div>
                <div style={{ ...styles.rowSub, flex: isMobile ? "none" : 2 }}>
                  Amount: ₱{Number(r.amount).toLocaleString()}
                </div>
                <div style={{ 
                  ...styles.statusDot, 
                  backgroundColor: view === 'pending' ? '#f59e0b' : view === 'approved' ? '#10b981' : '#ef4444',
                  marginLeft: isMobile ? "0" : "10px"
                }}></div>
              </div>
          ))}

          {/* Empty State / No Data Fallback */}
          {paginatedData.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
              No records found.
            </div>
          )}
        </div>

        {/* --- PREMIUM PAGINATION CONTROLS --- */}
        {currentViewData.length > 0 && (
          <div style={{ 
            ...styles.paginationContainer, 
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "15px" : "0"
          }}>
            <button 
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              style={{ ...getBtnStyle(currentPage === 1, hoverPrev), width: isMobile ? "100%" : "auto", justifyContent: "center" }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div style={styles.pageIndicatorWrapper}>
              <span style={styles.pageInfo}>
                Page <span style={styles.pageHighlight}>{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              style={{ ...getBtnStyle(currentPage === totalPages, hoverNext), width: isMobile ? "100%" : "auto", justifyContent: "center" }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;