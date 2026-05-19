import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore"; 
import { useOutletContext } from "react-router-dom";
import toast from 'react-hot-toast';

function Training() {
  const { id, employee } = useOutletContext();

  const [form, setForm] = useState({
    training: "",
    provider: "",
    cost: "",
    priority: "Low",
    particulars: "Online",
    date: "",
    status: "Pending",
    remarks: ""
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5; 

  // ✅ Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTraining();
  }, [id]);

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "training"), where("employeeId", "==", id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTraining = async () => {
    if (!form.training) {
      toast.error("Training name is required", { icon: '⚠️' });
      return;
    }

    const savingToast = toast.loading("Saving training...");

    try {
      await addDoc(collection(db, "training"), {
        employeeId: id,
        employeeName: employee.name,
        department: employee.department || "",
        ...form,
        createdAt: new Date()
      });

      toast.success("Training added successfully!", { id: savingToast });
      setForm({
        training: "", provider: "", cost: "", priority: "Low",
        particulars: "Online", date: "", status: "Pending", remarks: ""
      });
      fetchTraining();
    } catch (err) {
      toast.error("Error adding training", { id: savingToast });
    }
  };

  const updateStatus = async (recordId, newStatus) => {
    try {
      await updateDoc(doc(db, "training", recordId), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchTraining();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filteredRecords = records.filter(rec => 
    filter === "All" ? true : rec.priority === filter
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // ==========================================
  // DYNAMIC STYLES
  // ==========================================
  const styles = {
    page: { 
      background: "#f5f7fb", 
      minHeight: "100vh", 
      padding: isMobile ? "15px" : "30px",
      boxSizing: "border-box" 
    },
    container: { maxWidth: "900px", margin: "auto" },
    title: { 
      marginBottom: "20px", 
      fontSize: isMobile ? "20px" : "24px",
      textAlign: isMobile ? "center" : "left" 
    },
    accent: { color: "#ff6b00" },
    card: { 
      background: "#fff", 
      padding: isMobile ? "15px" : "20px", 
      borderRadius: "12px", 
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)", 
      marginBottom: "20px" 
    },
    cardTitle: { marginBottom: isMobile ? "10px" : "0" },
    headerRow: { 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between", 
      alignItems: isMobile ? "flex-start" : "center", 
      marginBottom: "20px",
      gap: isMobile ? "15px" : "0"
    },
    grid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
      gap: "10px", 
      marginBottom: "10px" 
    },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", fontSize: "14px" },
    textarea: { 
      width: "100%", 
      padding: "12px", 
      borderRadius: "8px", 
      border: "1px solid #ddd", 
      marginTop: "10px", 
      boxSizing: 'border-box',
      fontSize: "14px",
      minHeight: "80px"
    },
    button: { 
      marginTop: "15px", 
      background: "#ff6b00", 
      color: "#fff", 
      border: "none", 
      padding: "12px 15px", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontWeight: "bold",
      width: isMobile ? "100%" : "auto"
    },
    filterGroup: { 
      display: "flex", 
      gap: "5px", 
      background: "#eee", 
      padding: "4px", 
      borderRadius: "10px",
      width: isMobile ? "100%" : "auto",
      overflowX: isMobile ? "auto" : "visible"
    },
    filterBtn: { 
      flex: isMobile ? 1 : "none",
      padding: "6px 12px", 
      borderRadius: "8px", 
      border: "none", 
      background: "transparent", 
      cursor: "pointer", 
      fontSize: "12px", 
      color: "#666",
      whiteSpace: "nowrap"
    },
    filterBtnActive: { 
      flex: isMobile ? 1 : "none",
      padding: "6px 12px", 
      borderRadius: "8px", 
      border: "none", 
      background: "#fff", 
      color: "#ff6b00", 
      fontWeight: "bold", 
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      whiteSpace: "nowrap"
    },
    recordGrid: { display: "grid", gap: "12px" },
    recordCard: { border: "1px solid #eee", padding: "15px", borderRadius: "10px", background: "#fff" },
    training: { margin: 0, color: "#222", fontWeight: "600", fontSize: isMobile ? "15px" : "16px" },
    statusDropdown: (status) => ({
      padding: "4px 8px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "11px",
      background: status === "Completed" ? "#dcfce7" : status === "Pending" ? "#ffedd5" : "#fee2e2",
      color: status === "Completed" ? "#166534" : status === "Pending" ? "#9a3412" : "#991b1b",
      cursor: "pointer"
    }),
    provider: { color: "#444" },
    peso: { color: "#ff6b00", fontWeight: "bold" },
    meta: { color: "#777", fontSize: "12px", marginTop: "4px" },
    date: { color: "#555", fontSize: "12px" },
    remarks: { fontStyle: "italic", color: "#666", fontSize: "13px", marginTop: "8px", borderTop: "1px solid #eee", paddingTop: "8px" },
    empty: { textAlign: "center", color: "#94a3b8", padding: "20px" },
    pagination: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: isMobile ? "10px" : "20px",
      marginTop: "25px",
      paddingTop: "20px",
      borderTop: "1px solid #eee"
    },
    pageBtn: {
      padding: isMobile ? "8px 12px" : "8px 16px",
      borderRadius: "8px",
      border: "1px solid #ff6b00",
      background: "#fff",
      color: "#ff6b00",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: isMobile ? "12px" : "14px"
    },
    pageBtnDisabled: {
      padding: isMobile ? "8px 12px" : "8px 16px",
      borderRadius: "8px",
      border: "1px solid #eee",
      background: "#f9f9f9",
      color: "#ccc",
      cursor: "not-allowed",
      fontSize: isMobile ? "12px" : "14px"
    },
    pageInfo: { fontSize: "13px", color: "#555" }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          {employee.name} <span style={styles.accent}>Training</span>
        </h2>

        {/* 1. INPUT FORM */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add Training</h3>
          <div style={styles.grid}>
            <input name="training" placeholder="Training Name" value={form.training} onChange={handleChange} style={styles.input}/>
            <input name="provider" placeholder="Training Provider" value={form.provider} onChange={handleChange} style={styles.input}/>
            <input name="cost" type="number" placeholder="Cost" value={form.cost} onChange={handleChange} style={styles.input}/>
            
            <select name="priority" value={form.priority} onChange={handleChange} style={styles.input}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select name="particulars" value={form.particulars} onChange={handleChange} style={styles.input}>
              <option>Online</option>
              <option>Webinar</option>
              <option>Coaching</option>
              <option>Face to face</option>
            </select>
            <input name="date" type="date" value={form.date} onChange={handleChange} style={styles.input}/>
          </div>
          <textarea name="remarks" placeholder="Remarks..." value={form.remarks} onChange={handleChange} style={styles.textarea} />
          <button onClick={addTraining} style={styles.button}>+ Add Training</button>
        </div>

        {/* 2. FILTER & RECORDS */}
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <h3 style={styles.cardTitle}>Training Records</h3>
            <div style={styles.filterGroup}>
              {["All", "Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  style={filter === p ? styles.filterBtnActive : styles.filterBtn}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : currentRecords.length === 0 ? (
            <p style={styles.empty}>No {filter !== "All" ? filter : ""} training records found</p>
          ) : (
            <>
              <div style={styles.recordGrid}>
                {currentRecords.map(rec => (
                  <div key={rec.id} style={styles.recordCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <h4 style={styles.training}>{rec.training}</h4>
                      <select 
                        value={rec.status} 
                        onChange={(e) => updateStatus(rec.id, e.target.value)}
                        style={styles.statusDropdown(rec.status)}
                      >
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Hold</option>
                      </select>
                    </div>
                    <p style={{ fontSize: '14px', margin: '8px 0 4px 0' }}>Provider: <span style={styles.provider}>{rec.provider}</span></p>
                    <p style={{ fontSize: '14px', margin: '0' }}>Cost: <span style={styles.peso}>₱ {Number(rec.cost).toLocaleString()}</span></p>
                    <p style={styles.meta}>{rec.priority} • {rec.particulars}</p>
                    <p style={styles.date}>{rec.date}</p>
                    {rec.remarks && <p style={styles.remarks}>{rec.remarks}</p>}
                  </div>
                ))}
              </div>

              {/* ✅ Centered Pagination Controls */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                  >
                    Prev
                  </button>
                  
                  <span style={styles.pageInfo}>
                    <strong>{currentPage}</strong> / {totalPages}
                  </span>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={currentPage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Training;