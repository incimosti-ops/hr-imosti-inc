import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("Regular");
  const [status, setStatus] = useState("Active");
  const [location, setLocation] = useState("Naic");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchEmployees();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEmployees(data);
  };

  const resetForm = () => {
    setName(""); setEmployeeId(""); setPosition(""); setDepartment("");
    setEmploymentType("Regular"); setStatus("Active"); setLocation("Naic");
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      setEmployeeId(emp.employeeId);
      setName(emp.name);
      setPosition(emp.position);
      setDepartment(emp.department);
      setEmploymentType(emp.employmentType);
      setStatus(emp.status);
      setLocation(emp.location);
    } else {
      setEditingId(null);
      resetForm();
    }
    setShowModal(true);
  };

  const saveEmployee = async () => {
    if (!name.trim()) { toast.error("Please enter the Full Name"); return; }
    if (!employeeId.trim()) { toast.error("Please enter the Employee ID"); return; }
    if (!position.trim()) { toast.error("Please enter the Position"); return; }
    if (!department.trim()) { toast.error("Please enter the Department"); return; }

    const payload = {
      employeeId, name, position, department, employmentType, status, location,
      updatedAt: new Date()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "employees", editingId), payload);
        toast.success("Employee updated successfully!");
      } else {
        await addDoc(collection(db, "employees"), { ...payload, createdAt: new Date() });
        toast.success("Employee added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      toast.error("Error saving record");
    }
  };

  const openDeleteConfirm = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "employees", idToDelete));
      toast.success("Employee deleted successfully");
      setShowDeleteModal(false);
      setIdToDelete(null);
      fetchEmployees();
    } catch (err) {
      toast.error("Error deleting employee");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  // --- STYLES (Moved inside to access isMobile) ---
  const styles = {
    container: { 
        padding: isMobile ? "20px" : "30px", 
        background: "#f8fafc", 
        minHeight: "100vh", 
        fontFamily: "Inter, sans-serif",
        paddingTop: isMobile ? "80px" : "30px" // Space for mobile headers
    },
    title: { fontSize: isMobile ? "20px" : "26px", fontWeight: "600", margin: 0 },
    addBtn: { padding: "10px 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "12px" : "14px" },
    tableWrapper: { marginTop: "20px", background: isMobile ? "transparent" : "#fff", borderRadius: "12px", overflow: "hidden", border: isMobile ? "none" : "1px solid #e2e8f0", boxShadow: isMobile ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "14px", fontSize: "13px", color: "#64748b", background: "#f1f5f9", fontWeight: "700" },
    td: { padding: "14px", color: "#0f172a", fontSize: "14px" },
    row: { borderTop: "1px solid #f1f5f9" },
    link: { color: "#f97316", textDecoration: "none", fontWeight: "600" },
    status: (status) => ({
      padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600",
      background: status === "Active" ? "#dcfce7" : "#fee2e2",
      color: status === "Active" ? "#166534" : "#991b1b"
    }),
    // Mobile Card Style
    card: {
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    cardLabel: { fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
    cardValue: { fontSize: "14px", fontWeight: "500", color: "#0f172a" },
    editBtn: { padding: "6px 12px", background: "#fff7ed", color: "#f97316", border: "1px solid #ffedd5", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    delBtn: { padding: "6px 12px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", padding: "20px", background: "#fff", borderTop: "1px solid #f1f5f9", borderRadius: isMobile ? "12px" : "0" },
    pageBtn: { padding: isMobile ? "8px 16px" : "10px 24px", background: "#f97316", color: "#fff", border: "none", borderRadius: "50px", cursor: "pointer", fontWeight: "700", fontSize: isMobile ? "12px" : "14px", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)" },
    pageInfo: { color: "#64748b", fontSize: "12px", fontWeight: "600" },
    modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: isMobile ? "flex-start" : "center", zIndex: 1000, padding: isMobile ? "20px" : "0" },
    modal: { background: "#fff", padding: "25px", borderRadius: "14px", width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", gap: "8px", marginTop: isMobile ? "50px" : "0" },
    label: { fontSize: "12px", fontWeight: "700", color: "#64748b", marginTop: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outlineColor: "#f97316" },
    actions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" },
    saveBtn: { background: "#f97316", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    cancelBtn: { background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: "10px" }}>
        <h2 style={styles.title}>Employee Masterlist</h2>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Add Employee</button>
      </div>

      <div style={styles.tableWrapper}>
        {isMobile ? (
          // --- MOBILE CARD VIEW ---
          <div>
            {currentEmployees.map(emp => (
              <div key={emp.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.cardLabel}>ID: {emp.employeeId}</span>
                  <span style={styles.status(emp.status)}>{emp.status}</span>
                </div>
                <div>
                  <Link to={`/employees/${emp.id}`} style={styles.link}>{emp.name}</Link>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{emp.position} • {emp.department}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Location: <strong>{emp.location}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button style={{ ...styles.editBtn, flex: 1 }} onClick={() => handleOpenModal(emp)}>Update</button>
                  <button style={{ ...styles.delBtn, flex: 1 }} onClick={() => openDeleteConfirm(emp.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (

          
          // --- DESKTOP TABLE VIEW ---
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Position</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map(emp => (
                <tr key={emp.id} style={styles.row}>
                  <td style={styles.td}>{emp.employeeId}</td>
                  <td style={styles.td}><Link to={`/employees/${emp.id}`} style={styles.link}>{emp.name}</Link></td>
                  <td style={styles.td}>{emp.position}</td>
                  <td style={styles.td}>{emp.department}</td>
                  <td style={styles.td}>{emp.employmentType}</td>
                  <td style={styles.td}><span style={styles.status(emp.status)}>{emp.status}</span></td>
                  <td style={styles.td}>{emp.location}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={styles.editBtn} onClick={() => handleOpenModal(emp)}>Update</button>
                      <button style={styles.delBtn} onClick={() => openDeleteConfirm(emp.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <>
    <Toaster
      position="top-center"
      reverseOrder={false}
    />

    <div style={styles.container}>
      {/* ALL YOUR EXISTING JSX */}
    </div>
  </>
        {/* Pagination */}
        <div style={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)} 
            style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}
          >
            {isMobile ? "←" : "← Previous"}
          </button>
          <span style={styles.pageInfo}>{isMobile ? `${currentPage}/${totalPages}` : `Page ${currentPage} of ${totalPages || 1}`}</span>
          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(p => p + 1)} 
            style={{...styles.pageBtn, opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1}}
          >
            {isMobile ? "→" : "Next →"}
          </button>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ margin: "0 0 10px 0" }}>{editingId ? "Update Employee" : "Add Employee"}</h3>
            <label style={styles.label}>Employee ID</label>
            <input style={styles.input} placeholder="ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <label style={styles.label}>Position</label>
            <input style={styles.input} placeholder="Position" value={position} onChange={e => setPosition(e.target.value)} />
            <label style={styles.label}>Department</label>
            <input style={styles.input} placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
            <label style={styles.label}>Status</label>
            <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
              <option>Active</option><option>Resigned</option><option>Retired</option><option>Terminated</option>
            </select>
            <label style={styles.label}>Location</label>
            <select style={styles.input} value={location} onChange={e => setLocation(e.target.value)}>
              <option>Naic</option><option>Aseana</option>
            </select>
            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={saveEmployee}>{editingId ? "Update" : "Save"}</button>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, maxWidth: '320px', textAlign: 'center'}}>
            <h3 style={{ color: '#f90000' }}>Delete Employee?</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>This action cannot be undone. Are you sure you want to remove this record?</p>
            <div style={{...styles.actions, justifyContent: 'center', gap: '15px'}}>
              <button style={{...styles.saveBtn, background: '#f80101'}} onClick={handleConfirmDelete}>Yes, Delete</button>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;