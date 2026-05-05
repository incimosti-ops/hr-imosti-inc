import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function OrgChart() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [managerId, setManagerId] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 📥 FETCH EMPLOYEES
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEmployees(data);
  };

  // ➕ ADD EMPLOYEE WITH MANAGER
  const addEmployee = async () => {
    if (!name || !position) {
      alert("Fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "employees"), {
        name,
        position,
        managerId: managerId || null,
        createdAt: new Date()
      });

      alert("Employee added!");
      setName("");
      setPosition("");
      setManagerId("");

      fetchEmployees();

    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    }
  };

  // 🧩 BUILD TREE
  const buildTree = (parentId = null) => {
    return employees
      .filter(emp => (emp.managerId || null) === parentId)
      .map(emp => ({
        ...emp,
        children: buildTree(emp.id)
      }));
  };

  const tree = buildTree();

  // 🌳 RENDER TREE
  const renderTree = (nodes) => {
    return (
      <ul>
        {nodes.map(node => (
          <li key={node.id}>
            <strong>{node.name}</strong> - {node.position}
            {node.children.length > 0 && renderTree(node.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Organization Chart</h2>

      {/* ➕ ADD EMPLOYEE */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        <br /><br />

        <select
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
        >
          <option value="">No Manager (Top Level)</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <br /><br />

        <button onClick={addEmployee}>
          Add to Org Chart
        </button>
      </div>

      {/* 🌳 TREE VIEW */}
      <h3>Company Structure</h3>
      {renderTree(tree)}
    </div>
  );
}

export default OrgChart;