import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

function Files() {
  const { id, employee } = useOutletContext();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    if (id) fetchFiles();
  }, [id]);

  // 📂 FETCH FILES
  const fetchFiles = async () => {
    try {
      const snapshot = await getDocs(collection(db, "employeeFiles"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFiles(data.filter(f => f.employeeId === id));
    } catch (err) {
      console.error(err);
      alert("Error fetching files");
    }
  };

  // ☁️ UPLOAD FILE
  const handleUpload = async () => {
    if (!selectedFile) return alert("Select file");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "lahlxgnb");

      // 🔥 IMPORTANT: auto/upload
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dkmjn55bl/auto/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message);
      }

      await addDoc(collection(db, "employeeFiles"), {
        employeeId: id,
        employeeName: employee?.name || "",
        fileName: selectedFile.name,
        fileUrl: data.secure_url,
        fileType: selectedFile.type,
        createdAt: new Date()
      });

      setSelectedFile(null);
      fetchFiles();

    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    }

    setLoading(false);
  };

  // 🔥 PREVIEW HANDLER
  const renderPreview = () => {
    if (!previewFile) return null;

    const url = previewFile.fileUrl;

    // ✅ PDF
    if (previewFile.fileType?.includes("pdf")) {
      return (
        <iframe
          src={url.replace("/upload/", "/upload/fl_inline/")}
          width="100%"
          height="600px"
          title="PDF Viewer"
          style={{ border: "1px solid #ccc" }}
        />
      );
    }

    // ✅ DOC / DOCX
    if (
      previewFile.fileType?.includes("word") ||
      previewFile.fileName.endsWith(".doc") ||
      previewFile.fileName.endsWith(".docx")
    ) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${url}&embedded=true`}
          width="100%"
          height="600px"
          title="DOC Viewer"
          style={{ border: "1px solid #ccc" }}
        />
      );
    }

    // ✅ IMAGE
    if (previewFile.fileType?.includes("image")) {
      return (
        <img
          src={url}
          alt="preview"
          style={{ maxWidth: "100%", border: "1px solid #ccc" }}
        />
      );
    }

    // ❌ fallback
    return <p>No preview available</p>;
  };

  return (
    <div>
      <h2>{employee?.name || "Employee"} - Files</h2>

      {/* UPLOAD */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <hr />

      {/* FILE LIST */}
      <h3>Employee Files</h3>

      {files.length === 0 ? (
        <p>No files uploaded</p>
      ) : (
        files.map(file => (
          <div key={file.id} style={{ marginBottom: 10 }}>
            {file.fileName} —{" "}
            <button onClick={() => setPreviewFile(file)}>
              View
            </button>{" "}
            <a href={file.fileUrl} target="_blank" rel="noreferrer">
              Download
            </a>
          </div>
        ))
      )}

      {/* 🔥 PREVIEW */}
      {previewFile && (
        <div style={{ marginTop: 20 }}>
          <h3>Preview</h3>

          <button onClick={() => setPreviewFile(null)}>
            Close
          </button>

          <div style={{ marginTop: 10 }}>
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;