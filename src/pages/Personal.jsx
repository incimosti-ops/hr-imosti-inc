import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";

function Personal() {
  const { id, employee } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // CORE IDENTITY & EMPLOYMENT STATES
  const [name, setName] = useState("");
  const [allocatedMBL, setAllocatedMBL] = useState(0);
  const [employeeId, setEmployeeId] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("");
  const [dateHired, setDateHired] = useState("");
  const [regularizationDate, setRegularizationDate] = useState("");
  const [salary, setSalary] = useState("");

  // PERSONAL STATES
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [contactNo, setContactNo] = useState("");

  // EMERGENCY STATES
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // GOVERNMENT STATES
  const [sss, setSss] = useState("");
  const [pagibig, setPagibig] = useState("");
  const [philhealth, setPhilhealth] = useState("");
  const [tin, setTin] = useState("");

  // DYNAMIC STATES
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);

  // HIGHLIGHT STATES
  const [newEduIndex, setNewEduIndex] = useState(null);
  const [newWorkIndex, setNewWorkIndex] = useState(null);

  const educationRefs = useRef([]);
  const workRefs = useRef([]);

  const TOAST_IDS = {
    education: "education-toast",
    work: "work-toast",
    removeEducation: "remove-education-toast",
    removeWork: "remove-work-toast",
  };

  // ✅ Handle Window Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setPresentAddress(employee.presentAddress || "");
      setPermanentAddress(employee.permanentAddress || "");
      setAllocatedMBL(employee.allocatedMBL || 0);
      setEmployeeId(employee.employeeId || "");
      setEmploymentType(employee.employmentType || "");
      setStatus(employee.status || "Active");
      setDepartment(employee.department || "");
      setLocation(employee.location || "");
      setPosition(employee.position || "");
      setDateHired(employee.dateHired || "");
      setRegularizationDate(employee.regularizationDate || "");
      setSalary(employee.salary || "");
      setBirthday(employee.birthday || "");
      setContactNo(employee.contactNo || "");
      setEmergencyName(employee.emergencyName || "");
      setEmergencyContact(employee.emergencyContact || "");
      setSss(employee.sss || "");
      setPagibig(employee.pagibig || "");
      setPhilhealth(employee.philhealth || "");
      setTin(employee.tin || "");
      setEducation(employee.education || []);
      setWorkExperience(employee.workExperience || []);
      setLoading(false);
    }
  }, [employee]);

  // 🔥 HANDLERS (Retained exactly as original)
  const addEducation = () => {
    const newIndex = education.length;
    setEducation([...education, { category: "", school: "", degree: "", year: "" }]);
    setNewEduIndex(newIndex);
    setTimeout(() => setNewEduIndex(null), 3000);
    setTimeout(() => {
      educationRefs.current[newIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    toast.success("New education entry added", { id: TOAST_IDS.education, icon: "🎓" });
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
    toast.error("Education entry removed", { id: TOAST_IDS.removeEducation });
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addWork = () => {
    const newIndex = workExperience.length;
    setWorkExperience([...workExperience, { position: "", company: "", type: "", duration: "" }]);
    setNewWorkIndex(newIndex);
    setTimeout(() => setNewWorkIndex(null), 3000);
    setTimeout(() => {
      workRefs.current[newIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    toast.success("New work experience added", { id: TOAST_IDS.work, icon: "💼" });
  };

  const removeWork = (index) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
    toast.error("Work experience removed", { id: TOAST_IDS.removeWork });
  };

  const handleWorkChange = (index, field, value) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperience(updated);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      const sanitizedEducation = education.map(edu => ({
        category: edu.category || "", school: edu.school || "",
        degree: edu.degree || "", year: edu.year || ""
      }));

      const sanitizedWork = workExperience.map(work => ({
        position: work.position || "", company: work.company || "",
        type: work.type || "", duration: work.duration || ""
      }));

      await updateDoc(doc(db, "employees", id), {
        name: name || "",
        presentAddress: presentAddress || "",
        permanentAddress: permanentAddress || "",
        allocatedMBL: Number(allocatedMBL) || 0,
        employeeId: employeeId || "",
        employmentType: employmentType || "",
        status: status || "Active",
        department: department || "",
        location: location || "",
        position: position || "",
        dateHired: dateHired || "",
        regularizationDate: regularizationDate || "",
        salary: Number(salary) || 0,
        birthday: birthday || "",
        contactNo: contactNo || "",
        emergencyName: emergencyName || "",
        emergencyContact: emergencyContact || "",
        sss: sss || "",
        pagibig: pagibig || "",
        philhealth: philhealth || "",
        tin: tin || "",
        education: sanitizedEducation,
        workExperience: sanitizedWork
      });

      toast.success("Employee record updated successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Firestore Save Error:", err);
      toast.error(`Save failed: ${err.message}`, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // DYNAMIC STYLES
  // ==========================================
  const styles = {
    container: {
      padding: isMobile ? "20px 10px" : "40px 20px",
      background: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      maxWidth: "1515px",
      margin: "0 auto 30px auto",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "15px" : "0",
    },
    title: {
      color: "#1e293b",
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: "700",
      margin: 0,
    },
    verticalStack: {
      display: "flex",
      flexDirection: "column",
      gap: "25px",
      maxWidth: "1515px",
      margin: "0 auto",
    },
    section: {
      background: "#ffffff",
      padding: isMobile ? "15px" : "30px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      overflow: "hidden",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    sectionTitle: {
      color: "#f97316",
      fontSize: isMobile ? "17px" : "19px",
      fontWeight: "600",
      margin: 0,
      paddingBottom: "8px",
      borderBottom: "2px solid #f97316",
      width: "fit-content"
    },
 formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "100%" : "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "15px 25px",
      width: "100%",
    },
    inputGroup: { display: "flex", flexDirection: "column" },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#64748b",
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
      backgroundColor: "#fff",
      transition: "border-color 0.2s",
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
      width: isMobile ? "100%" : "auto",
    },
    addButton: {
      padding: "6px 14px",
      background: "#10b981",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
    },
    dynamicItem: {
      padding: isMobile ? "15px" : "20px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      marginBottom: "15px",
      transition: "background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease", 
    },
    highlightedItem: {
      backgroundColor: "#f0fdf4",
      borderColor: "#22c55e",
      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15)",
    },
    dynamicHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: "10px"
    },
    itemIndex: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#94a3b8",
      textTransform: "uppercase"
    },
    removeButton: {
      padding: "4px 10px",
      background: "#fee2e2",
      color: "#ef4444",
      border: "1px solid #fecaca",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },
    tableWrapper: {
      overflowX: "hidden", 
      width: "100%",
      marginBottom: "20px",
    },
   table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow: "hidden",
      tableLayout: "fixed",
    },
    th: {
      textAlign: "left",
      padding: "12px",
      background: "#f1f5f9",
      fontSize: "13px",
      fontWeight: "700",
      color: "#334155",
      width: isMobile ? "40%" : "30%",
    },
    td: {
      padding: "12px",
      borderTop: "1px solid #e2e8f0",
      wordBreak: "break-word",
    },
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#0f172a",
            borderRadius: "12px",
            padding: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
          },
          error: { style: { border: "1px solid #ef4444" } }
        }}
      />

      <div style={styles.header}>
        <h2 style={styles.title}>Edit Employee: {name}</h2>
        <button onClick={handleSave} style={styles.button} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={styles.verticalStack}>
        {/* 1. EMPLOYMENT DETAILS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Employment Details</h3>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Allocated MBL</label>
              <input style={styles.input} type="number" value={allocatedMBL} onChange={e => setAllocatedMBL(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Employee ID</label>
              <input style={styles.input} value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Employment Type</label>
              <select style={styles.input} value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
                <option value="">Select Type</option>
                <option>On-call</option>
                <option>Probationary</option>
                <option>Regular</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Status</label>
              <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
                <option>Active</option>
                <option>Resigned</option>
                <option>Retired</option>
                <option>Terminated</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Department</label>
              <select style={styles.input} value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                <option>Clinic Department</option>
                <option>Training</option>
                <option>Admin and HR</option>
                <option>Engineering and Maintenance</option>
                <option>Finance and Accounting</option>
                <option>Sales and Marketing</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Location</label>
              <select style={styles.input} value={location} onChange={e => setLocation(e.target.value)}>
                <option>Naic</option>
                <option>Aseana</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Position</label>
              <input style={styles.input} value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date Hired</label>
              <input style={styles.input} type="date" value={dateHired} onChange={e => setDateHired(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date of Regularization</label>
              <input style={styles.input} type="date" value={regularizationDate} onChange={e => setRegularizationDate(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Salary</label>
              <input style={styles.input} type="number" value={salary} onChange={e => setSalary(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 2. PERSONAL & EMERGENCY */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal & Emergency Info</h3>
          <div style={styles.formGrid}>
            <div style={{ gridColumn: "1 / -1", marginBottom: "10px" }}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Address Type</th>
                      <th style={styles.th}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}>Present Address</td>
                      <td style={styles.td}>
                        <input
  style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
  value={presentAddress}
  onChange={(e) => setPresentAddress(e.target.value)}
  placeholder="Current address"
/>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.td}>Permanent Address</td>
                      <td style={styles.td}>
                        <input
                          style={styles.input}
                          value={permanentAddress}
                          onChange={(e) => setPermanentAddress(e.target.value)}
                          placeholder="Permanent address"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Birthday</label>
              <input style={styles.input} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Personal Contact No.</label>
              <input style={styles.input} value={contactNo} onChange={e => setContactNo(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Emergency Contact Person</label>
              <input style={styles.input} value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Emergency Contact No.</label>
              <input style={styles.input} value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 3. GOVERNMENT IDs */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Government IDs</h3>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>SSS Number</label>
              <input style={styles.input} value={sss} onChange={e => setSss(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pag-IBIG Number</label>
              <input style={styles.input} value={pagibig} onChange={e => setPagibig(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>PhilHealth Number</label>
              <input style={styles.input} value={philhealth} onChange={e => setPhilhealth(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>TIN Number</label>
              <input style={styles.input} value={tin} onChange={e => setTin(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 4. EDUCATIONAL ATTAINMENT */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Educational Attainment</h3>
            <button onClick={addEducation} style={styles.addButton}>+ Add Education</button>
          </div>
          {education.map((edu, index) => (
            <div 
              key={index} 
              ref={(el) => (educationRefs.current[index] = el)}
              style={{
                ...styles.dynamicItem,
                ...(newEduIndex === index ? styles.highlightedItem : {})
              }}
            >
              <div style={styles.dynamicHeader}>
                <span style={styles.itemIndex}>Entry #{index + 1}</span>
                <button onClick={() => removeEducation(index)} style={styles.removeButton}>Remove</button>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <input style={styles.input} placeholder="e.g. College" value={edu.category || ""} onChange={e => handleEducationChange(index, "category", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>School / Institution</label>
                  <input style={styles.input} value={edu.school || ""} onChange={e => handleEducationChange(index, "school", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Degree / Course</label>
                  <input style={styles.input} value={edu.degree || ""} onChange={e => handleEducationChange(index, "degree", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Year Graduated</label>
                  <input style={styles.input} value={edu.year || ""} onChange={e => handleEducationChange(index, "year", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. WORK EXPERIENCE */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Work Experience</h3>
            <button onClick={addWork} style={styles.addButton}>+ Add Work</button>
          </div>
          {workExperience.map((work, index) => (
            <div 
              key={index} 
              ref={(el) => (workRefs.current[index] = el)}
              style={{
                ...styles.dynamicItem,
                ...(newWorkIndex === index ? styles.highlightedItem : {})
              }}
            >
              <div style={styles.dynamicHeader}>
                <span style={styles.itemIndex}>Entry #{index + 1}</span>
                <button onClick={() => removeWork(index)} style={styles.removeButton}>Remove</button>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Position / Title</label>
                  <input style={styles.input} value={work.position} onChange={e => handleWorkChange(index, "position", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company</label>
                  <input style={styles.input} value={work.company} onChange={e => handleWorkChange(index, "company", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Type</label>
                  <input style={styles.input} placeholder="e.g. Full-time" value={work.type} onChange={e => handleWorkChange(index, "type", e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Duration</label>
                  <input style={styles.input} placeholder="e.g. 2020 - 2024" value={work.duration} onChange={e => handleWorkChange(index, "duration", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Personal;