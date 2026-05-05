import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("Regular");
  const [status, setStatus] = useState("Active");
  const [location, setLocation] = useState("Naic");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEmployees(data);
  };

  const addEmployee = async () => {
    if (!name || !employeeId || !position) {
      alert("Fill required fields");
      return;
    }

    try {
      await addDoc(collection(db, "employees"), {
        employeeId,
        name,
        position,
        department,
        employmentType,
        status,
        location,
        createdAt: new Date()
      });

      setName("");
      setEmployeeId("");
      setPosition("");
      setDepartment("");
      setEmploymentType("Regular");
      setStatus("Active");
      setLocation("Naic");

      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Masterlist</h2>

      <button style={styles.addBtn} onClick={() => setShowModal(true)}>
        + Add Employee
      </button>

      <div style={styles.tableWrapper}>
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
            </tr>
          </thead>

          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={styles.row}>
                <td style={styles.td}>{emp.employeeId}</td>

                <td style={styles.td}>
                  <Link to={`/employees/${emp.id}`} style={styles.link}>
                    {emp.name}
                  </Link>
                </td>

                <td style={styles.td}>{emp.position}</td>
                <td style={styles.td}>{emp.department}</td>
                <td style={styles.td}>{emp.employmentType}</td>

                <td style={styles.td}>
                  <span style={styles.status(emp.status)}>
                    {emp.status}
                  </span>
                </td>

                <td style={styles.td}>{emp.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Add Employee</h3>

            <input style={styles.input} placeholder="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
            <input style={styles.input} placeholder="Employee Name" value={name} onChange={e => setName(e.target.value)} />
            <input style={styles.input} placeholder="Position" value={position} onChange={e => setPosition(e.target.value)} />
            <input style={styles.input} placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />

            <select style={styles.input} value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
              <option>On-call</option>
              <option>Probationary</option>
              <option>Regular</option>
            </select>

            <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Resigned</option>
              <option>Retired</option>
              <option>Terminated</option>
            </select>

            <select style={styles.input} value={location} onChange={e => setLocation(e.target.value)}>
              <option>Naic</option>
              <option>Aseana</option>
            </select>

            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={addEmployee}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "100vh"
  },

  title: {
    fontSize: "26px",
    fontWeight: "600",
    marginBottom: "15px"
  },

  addBtn: {
    padding: "10px 16px",
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  tableWrapper: {
    marginTop: "20px",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e2e8f0"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    textAlign: "left",
    padding: "14px",
    fontSize: "13px",
    color: "#64748b",
    background: "#f1f5f9"
  },

  td: {
    padding: "14px",
    color: "#0f172a", // 🔥 FIXED TEXT COLOR
    fontSize: "14px"
  },

  row: {
    borderTop: "1px solid #f1f5f9"
  },

  link: {
    color: "#f97316",
    textDecoration: "none",
    fontWeight: "600"
  },

  status: (status) => ({
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    background: status === "Active" ? "#dcfce7" : "#e2e8f0",
    color: status === "Active" ? "#166534" : "#334155"
  }),

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "14px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },

  saveBtn: {
    background: "#f97316",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px"
  },

  cancelBtn: {
    background: "#e2e8f0",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px"
  }
};

export default Employees;