import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

function Personal() {
  const { id, employee } = useOutletContext();
  const [loading, setLoading] = useState(true);

  // 🔥 EMPLOYMENT STATES
  const [employeeId, setEmployeeId] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("");
  const [dateHired, setDateHired] = useState("");
  const [regularizationDate, setRegularizationDate] = useState("");
  const [salary, setSalary] = useState("");

  // 🔥 PERSONAL STATES
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [contactNo, setContactNo] = useState("");

  // 🔥 EMERGENCY STATES
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // 🔥 GOVERNMENT STATES
  const [sss, setSss] = useState("");
  const [pagibig, setPagibig] = useState("");
  const [philhealth, setPhilhealth] = useState("");
  const [tin, setTin] = useState("");

  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employeeId || "");
      setEmploymentType(employee.employmentType || "");
      setStatus(employee.status || "");
      setDepartment(employee.department || "");
      setLocation(employee.location || "");
      setPosition(employee.position || "");
      setDateHired(employee.dateHired || "");
      setRegularizationDate(employee.regularizationDate || "");
      setSalary(employee.salary || "");
      setAddress(employee.address || "");
      setBirthday(employee.birthday || "");
      setContactNo(employee.contactNo || "");
      setEmergencyName(employee.emergencyName || "");
      setEmergencyContact(employee.emergencyContact || "");
      setSss(employee.sss || "");
      setPagibig(employee.pagibig || "");
      setPhilhealth(employee.philhealth || "");
      setTin(employee.tin || "");
      setLoading(false);
    }
  }, [employee]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "employees", id), {
        employeeId, employmentType, status, department, location, position,
        dateHired, regularizationDate, salary, address, birthday, contactNo,
        emergencyName, emergencyContact, sss, pagibig, philhealth, tin
      });
      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving changes");
    }
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Employee Information</h2>
        <button onClick={handleSave} style={styles.button}>Save Changes</button>
      </div>

      <div style={styles.grid}>
        
        {/* 🔥 EMPLOYMENT DETAILS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Employment Details</h3>
          
          <label style={styles.label}>Employee ID</label>
          <input style={styles.input} value={employeeId} onChange={e => setEmployeeId(e.target.value)} />

          <label style={styles.label}>Employment Type</label>
          <select style={styles.input} value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
            <option>On-call</option>
            <option>Probationary</option>
            <option>Regular</option>
          </select>

          <label style={styles.label}>Status</label>
          <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
            <option>Active</option>
            <option>Resigned</option>
            <option>Retired</option>
            <option>Terminated</option>
          </select>

          <label style={styles.label}>Department</label>
          <select style={styles.input} value={department} onChange={e => setDepartment(e.target.value)}>
            <option>Training</option>
            <option>Admin and HR</option>
            <option>Engineering and Maintenance</option>
            <option>Finance and Accounting</option>
            <option>Sales and Marketing</option>
          </select>

          <label style={styles.label}>Location</label>
          <select style={styles.input} value={location} onChange={e => setLocation(e.target.value)}>
            <option>Naic</option>
            <option>Aseana</option>
          </select>

          <label style={styles.label}>Position</label>
          <input style={styles.input} value={position} onChange={e => setPosition(e.target.value)} />

          <label style={styles.label}>Date Hired</label>
          <input style={styles.input} type="date" value={dateHired} onChange={e => setDateHired(e.target.value)} />

          <label style={styles.label}>Date of Regularization</label>
          <input style={styles.input} type="date" value={regularizationDate} onChange={e => setRegularizationDate(e.target.value)} />

          <label style={styles.label}>Current Salary</label>
          <input style={styles.input} type="number" value={salary} onChange={e => setSalary(e.target.value)} />
        </div>

        {/* 🔥 PERSONAL & EMERGENCY */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Info</h3>
            <label style={styles.label}>Address</label>
            <input style={styles.input} value={address} onChange={e => setAddress(e.target.value)} />

            <label style={styles.label}>Birthday</label>
            <input style={styles.input} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />

            <label style={styles.label}>Contact Number</label>
            <input style={styles.input} value={contactNo} onChange={e => setContactNo(e.target.value)} />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Emergency Contact</h3>
            <label style={styles.label}>Contact Person Name</label>
            <input style={styles.input} value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />

            <label style={styles.label}>Contact Number</label>
            <input style={styles.input} value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
          </div>
        </div>

        {/* 🔥 GOVERNMENT IDs */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Government IDs</h3>
          <label style={styles.label}>SSS Number</label>
          <input style={styles.input} value={sss} onChange={e => setSss(e.target.value)} />

          <label style={styles.label}>Pag-IBIG Number</label>
          <input style={styles.input} value={pagibig} onChange={e => setPagibig(e.target.value)} />

          <label style={styles.label}>PhilHealth Number</label>
          <input style={styles.input} value={philhealth} onChange={e => setPhilhealth(e.target.value)} />

          <label style={styles.label}>TIN Number</label>
          <input style={styles.input} value={tin} onChange={e => setTin(e.target.value)} />
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
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    margin: 0,
    color: "#1e293b",
    fontSize: "26px",
    fontWeight: "700",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  section: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    color: "#f97316",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    paddingBottom: "8px",
    borderBottom: "2px solid #f97316",
    width: "fit-content",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
    marginTop: "10px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    backgroundColor: "#fff",
  },
  button: {
    padding: "12px 24px",
    background: "#f97316",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
    boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.2)",
    transition: "transform 0.1s, background 0.2s",
  },
};

export default Personal;