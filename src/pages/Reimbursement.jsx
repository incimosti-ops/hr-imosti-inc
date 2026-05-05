import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";

function Reimbursement() {
  const { id, employee } = useOutletContext();

  // 🔥 Form States
  const [amount, setAmount] = useState("");
  const [particulars, setParticulars] = useState("Employee");
  const [dateFiled, setDateFiled] = useState(new Date().toISOString().split("T")[0]);
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [description, setDescription] = useState("Consultation");
  const [hospitalName, setHospitalName] = useState("");
  const [status, setStatus] = useState("Pending");
  
  // 🔥 Data States
  const [records, setRecords] = useState([]);
  const [allocatedMBL, setAllocatedMBL] = useState(0);
  const [mblBalance, setMblBalance] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  // 🔥 MBL Inline Editing States
  const [isEditingMBL, setIsEditingMBL] = useState(false);
  const [newMBLValue, setNewMBLValue] = useState("");

  useEffect(() => {
    if (employee) {
      setAllocatedMBL(employee.allocatedMBL || 0);
    }
    fetchReimbursements();
  }, [id, employee]);

  // 🔥 FETCH + COMPUTE BALANCE
 const fetchReimbursements = async () => {
    const snapshot = await getDocs(collection(db, "reimbursements"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filtered = data.filter(r => r.employeeId === id);
    setRecords(filtered);

    // ✅ Calculate Approved and Pending
    const totalApproved = filtered
      .filter(r => r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalPending = filtered
      .filter(r => r.status === "Pending")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    setPendingTotal(totalPending);

    // ✅ Subtract BOTH Approved and Pending from the Allocated MBL
    const availableBalance = (employee?.allocatedMBL || 0) - totalApproved - totalPending;
    
    setMblBalance(availableBalance);
  };

  // 🔥 UPDATE MBL IN FIRESTORE
  const handleUpdateMBL = async () => {
    if (!newMBLValue || isNaN(newMBLValue)) {
      alert("Please enter a valid number");
      return;
    }

    try {
      const employeeRef = doc(db, "employees", id);
      await updateDoc(employeeRef, {
        allocatedMBL: Number(newMBLValue)
      });
      
      setAllocatedMBL(Number(newMBLValue));
      setIsEditingMBL(false);
      // Note: Since this is in the OutletContext, you may need to 
      // refresh the page or parent state to see the change reflected everywhere.
      window.location.reload(); 
    } catch (err) {
      console.error("Error updating MBL:", err);
      alert("Failed to update MBL.");
    }
  };

  // ➕ ADD REIMBURSEMENT WITH VALIDATION
  const addReimbursement = async () => {
    if (!amount || !department || !designation || !diagnosis || !hospitalName) {
      alert("Please fill all required fields.");
      return;
    }

    const amt = Number(amount);
    const totalCommitted = (allocatedMBL - mblBalance) + pendingTotal;

    if (amt + totalCommitted > allocatedMBL) {
      alert("Amount exceeds MBL when including pending requests");
      return;
    }

    try {
      await addDoc(collection(db, "reimbursements"), {
        employeeId: id,
        employeeName: employee.name,
        particulars,
        dateFiled,
        department,
        designation,
        diagnosis,
        description,
        hospitalName,
        amount: amt,
        status,
        createdAt: new Date()
      });

      // Reset Form
      setAmount("");
      setDiagnosis("");
      setHospitalName("");
      fetchReimbursements();
    } catch (err) {
      console.error(err);
      alert("Error submitting reimbursement");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {employee.name} — Medical Reimbursement
      </h2>

      {/* 🔥 MBL SUMMARY */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Allocated MBL</p>
          {isEditingMBL ? (
            <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
              <input 
                style={{ ...styles.input, width: "100px", padding: "5px" }} 
                type="number" 
                value={newMBLValue} 
                onChange={(e) => setNewMBLValue(e.target.value)}
              />
              <button onClick={handleUpdateMBL} style={styles.saveBtn}>Save</button>
              <button onClick={() => setIsEditingMBL(false)} style={styles.cancelBtn}>✕</button>
            </div>
          ) : (
            <h3 style={styles.summaryValue} onClick={() => {
              setNewMBLValue(allocatedMBL);
              setIsEditingMBL(true);
            }}>
              ₱{allocatedMBL} <span style={styles.editIcon}>✏️</span>
            </h3>
          )}
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Remaining Balance</p>
          <h3 style={{ ...styles.summaryValue, color: mblBalance < 0 ? "red" : "#16a34a" }}>
            ₱{mblBalance}
          </h3>
        </div>
      </div>

      {/* FORM */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>New Request</h3>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Particulars</label>
            <select style={styles.input} value={particulars} onChange={(e) => setParticulars(e.target.value)}>
              <option value="Employee">Employee</option>
              <option value="Dependent">Dependent</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date Filed</label>
            <input style={styles.input} type="date" value={dateFiled} onChange={(e) => setDateFiled(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Department</label>
            <input style={styles.input} type="text" placeholder="e.g. IT, HR" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Designation</label>
            <input style={styles.input} type="text" placeholder="e.g. Software Engineer" value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <select style={styles.input} value={description} onChange={(e) => setDescription(e.target.value)}>
              <option value="Consultation">Consultation</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Confinement">Confinement</option>
              <option value="Operation">Operation</option>
              <option value="Emergency room">Emergency room</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Hospital Name</label>
            <input style={styles.input} type="text" placeholder="Hospital/Clinic" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
          </div>

          <div style={{ ...styles.inputGroup, gridColumn: "span 2" }}>
            <label style={styles.label}>Medical Finding & Diagnosis</label>
            <input style={styles.input} type="text" placeholder="Enter findings..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount (₱)</label>
            <input style={styles.input} type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Status</label>
            <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <button style={styles.submitBtn} onClick={addReimbursement}>
          Submit Request
        </button>
      </div>

      {/* RECORDS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Records</h3>
        {records.length === 0 ? (
          <p style={styles.emptyText}>No records found.</p>
        ) : (
          <div style={styles.list}>
            {records.map(rec => (
              <div key={rec.id} style={styles.item}>
                <div style={styles.itemContent}>
                  <div style={styles.itemHeader}>
                    <strong>₱{rec.amount}</strong>
                    <span style={styles.status(rec.status)}>{rec.status}</span>
                  </div>
                  <div style={styles.itemDetails}>
                    <p><strong>Date:</strong> {rec.dateFiled}</p>
                    <p><strong>Hospital:</strong> {rec.hospitalName}</p>
                    <p><strong>Diagnosis:</strong> {rec.diagnosis}</p>
                    <p><strong>Type:</strong> {rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, sans-serif" },
  title: { fontSize: "26px", marginBottom: "20px", color: "#0f172a" },
  summary: { display: "flex", gap: "20px", marginBottom: "20px" },
  summaryCard: { background: "#fff", padding: "15px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", minWidth: "180px" },
  summaryLabel: { margin: 0, fontSize: "14px", color: "#64748b" },
  summaryValue: { margin: "5px 0 0 0", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  editIcon: { fontSize: "14px", color: "#94a3b8" },
  card: { background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "20px" },
  cardTitle: { marginBottom: "20px", color: "#1e293b" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "14px", fontWeight: "500", color: "#475569" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" },
  submitBtn: { background: "#f97316", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%" },
  saveBtn: { background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer" },
  cancelBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  item: { padding: "15px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc" },
  itemContent: { display: "flex", flexDirection: "column", gap: "10px" },
  itemHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "18px" },
  itemDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: "#475569" },
  status: (status) => ({
    padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
    background: status === "Approved" ? "#dcfce7" : status === "Rejected" ? "#fee2e2" : "#fef3c7",
    color: status === "Approved" ? "#166534" : status === "Rejected" ? "#991b1b" : "#92400e"
  })
};

export default Reimbursement;