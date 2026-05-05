import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function Library() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 📂 FETCH DOCUMENTS
  const fetchDocuments = async () => {
    const snapshot = await getDocs(collection(db, "library"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setDocuments(data);
  };

  // ☁️ UPLOAD TO CLOUDINARY
  const uploadDocument = async () => {
    if (!file || !title) {
      alert("Add title and file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lahlxgnb");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dabc123xyz/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      // 🔥 SAVE TO FIRESTORE
      await addDoc(collection(db, "library"), {
        title,
        fileName: file.name,
        fileUrl: data.secure_url,
        uploadedAt: new Date()
      });

      alert("Document uploaded!");
      setFile(null);
      setTitle("");

      fetchDocuments();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>E-Library</h2>

      {/* ➕ UPLOAD */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={uploadDocument}>
          Upload Document
        </button>
      </div>

      {/* 📂 LIST */}
      <h3>Documents</h3>

      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            {doc.title} -
            <a href={doc.fileUrl} target="_blank" rel="noreferrer">
              View
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Library;