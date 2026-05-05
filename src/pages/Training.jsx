import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";

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

  useEffect(() => {
    fetchTraining();
  }, [id]);

  const fetchTraining = async () => {
    const snapshot = await getDocs(collection(db, "training"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setRecords(data.filter(t => t.employeeId === id));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addTraining = async () => {
    if (!form.training) {
      alert("Training name is required");
      return;
    }

    try {
      await addDoc(collection(db, "training"), {
        employeeId: id,
        employeeName: employee.name,
        department: employee.department || "",
        ...form,
        createdAt: new Date()
      });

      setForm({
        training: "",
        provider: "",
        cost: "",
        priority: "Low",
        particulars: "Online",
        date: "",
        status: "Pending",
        remarks: ""
      });

      fetchTraining();
    } catch (err) {
      console.error(err);
      alert("Error adding training");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        <h2 style={styles.title}>
          {employee.name} <span style={styles.accent}>Training</span>
        </h2>

        {/* FORM */}
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

            <select name="status" value={form.status} onChange={handleChange} style={styles.input}>
              <option>Pending</option>
              <option>Completed</option>
              <option>Hold</option>
            </select>
          </div>

          <textarea
            name="remarks"
            placeholder="Remarks..."
            value={form.remarks}
            onChange={handleChange}
            style={styles.textarea}
          />

          <button onClick={addTraining} style={styles.button}>
            + Add Training
          </button>
        </div>

        {/* RECORDS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Training Records</h3>

          {records.length === 0 ? (
            <p style={styles.empty}>No training records</p>
          ) : (
            <div style={styles.recordGrid}>
              {records.map(rec => (
                <div key={rec.id} style={styles.recordCard}>

                  <h4 style={styles.training}>{rec.training}</h4>

                  <p style={styles.status(rec.status)}>
                    {rec.status}
                  </p>

                  <p>
                    Provider: <span style={styles.provider}>{rec.provider}</span>
                  </p>

                  <p>
                    Cost:{" "}
                    <span style={styles.peso}>
                      ₱ {Number(rec.cost).toLocaleString()}
                    </span>
                  </p>

                  <p style={styles.meta}>
                    {rec.priority} • {rec.particulars}
                  </p>

                  <p style={styles.date}>{rec.date}</p>

                  {rec.remarks && (
                    <p style={styles.remarks}>{rec.remarks}</p>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Training;

const styles = {
  page: {
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "30px"
  },

  container: {
    maxWidth: "900px",
    margin: "auto"
  },

  title: {
    marginBottom: "20px"
  },

  accent: {
    color: "#ff6b00"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    marginBottom: "20px"
  },

  cardTitle: {
    marginBottom: "15px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "10px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none"
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "10px"
  },

  button: {
    marginTop: "15px",
    background: "#ff6b00",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  empty: {
    color: "#888"
  },

  recordGrid: {
    display: "grid",
    gap: "12px"
  },

  recordCard: {
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "10px",
    transition: "0.2s",
    background: "#fff"
  },

  training: {
    margin: 0,
    color: "#222",
    fontWeight: "600"
  },

  provider: {
    color: "#444",
    fontWeight: "500"
  },

  peso: {
    color: "#ff6b00",
    fontWeight: "bold",
    fontSize: "15px"
  },

  meta: {
    color: "#777",
    fontSize: "13px"
  },

  date: {
    color: "#555",
    fontSize: "13px"
  },

  remarks: {
    fontStyle: "italic",
    color: "#666",
    marginTop: "6px"
  },

  status: (status) => ({
    color:
      status === "Completed"
        ? "green"
        : status === "Pending"
        ? "#ff6b00"
        : "red",
    fontWeight: "bold",
    margin: "5px 0"
  })
};