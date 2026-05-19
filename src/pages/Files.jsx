import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { supabase } from "../supabase";
import toast, { Toaster } from "react-hot-toast";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaTrash,
  FaSearch,
  FaCloudUploadAlt,
  FaDownload,
  FaEye
} from "react-icons/fa";

function Files() {
  const { id, employee } = useOutletContext();

  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [search, setSearch] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [cancelUpload, setCancelUpload] = useState(false);

  // Responsive State
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const inputRef = useRef();

  useEffect(() => {
    // Handle window resize for responsive views
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (id) fetchFiles();
  }, [id]);

  // FETCH FILES
  const fetchFiles = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "employeeFiles")
      );

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFiles(
        data.filter(f => f.employeeId === id)
      );

    } catch (err) {
      console.error(err);
      toast.error("Error fetching files", {
        id: "error fetching files"
      });
    }
  };

  // MULTIPLE FILE UPLOAD
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return toast("Select files");
    }

    setLoading(true);
    setCancelUpload(false);

    const uploadQueue = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: (
        file.size /
        1024 /
        1024
      ).toFixed(2),
      progress: 0,
      status: "uploading",
      preview: file.type.includes("image")
        ? URL.createObjectURL(file)
        : null
    }));

    setUploadingFiles(uploadQueue);

    try {
      await Promise.all(
        uploadQueue.map(async (current) => {
          const filePath =
            `${id}/${Date.now()}-${current.file.name}`;

          // fake progress animation
          for (
            let p = 0;
            p <= 90;
            p += 10
          ) {
            await new Promise((resolve) =>
              setTimeout(resolve, 80)
            );

            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.id === current.id
                  ? {
                      ...item,
                      progress: p
                    }
                  : item
              )
            );
          }

          // upload
          const { error } =
            await supabase.storage
              .from("employee-files")
              .upload(
                filePath,
                current.file
              );

          if (error) throw error;

          const { data } =
            supabase.storage
              .from("employee-files")
              .getPublicUrl(filePath);

          // firestore
          await addDoc(
            collection(db, "employeeFiles"),
            {
              employeeId: id,
              employeeName:
                employee?.name || "",
              fileName:
                current.file.name,
              fileUrl:
                data.publicUrl,
              fileType:
                current.file.type,
              filePath,
              createdAt: new Date()
            }
          );

          // completed
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === current.id
                ? {
                    ...item,
                    progress: 100,
                    status: "completed"
                  }
                : item
            )
          );
        })
      );

      fetchFiles();

      toast.success("Files uploaded successfully", {
        id: "upload-success"
      });

      setTimeout(() => {
        setUploadingFiles([]);
        setSelectedFiles([]);
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(err.message, {
        id: "error"
      });
    }

    setLoading(false);
  };

  const handleDelete = async (file) => {
    toast((t) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minWidth: 260
        }}
      >
        <div
          style={{
            fontWeight: "700",
            fontSize: 15
          }}
        >
          Delete File?
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#64748b",
            wordBreak: "break-word"
          }}
        >
          {file.fileName}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 5
          }}
        >
          <button
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                let path = file.filePath;

                if (!path) {
                  const splitUrl =
                    file.fileUrl.split(
                      "/employee-files/"
                    );

                  path = splitUrl[1];
                }

                const {
                  error: storageError
                } = await supabase.storage
                  .from("employee-files")
                  .remove([path]);

                if (storageError) {
                  throw storageError;
                }

                await deleteDoc(
                  doc(
                    db,
                    "employeeFiles",
                    file.id
                  )
                );

                setFiles((prev) =>
                  prev.filter(
                    (f) => f.id !== file.id
                  )
                );

                if (
                  previewFile?.id === file.id
                ) {
                  setPreviewFile(null);
                }

                toast.success(
                  "File deleted successfully",
                  {
                    id: "delete-success"
                  }
                );

              } catch (err) {
                console.error(err);

                toast.error(
                  err.message ||
                  "Delete failed",
                  {
                    id: "delete-error"
                  }
                );
              }
            }}
            style={{
              flex: 1,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Delete
          </button>

          <button
            onClick={() =>
              toast.dismiss(t.id)
            }
            style={{
              flex: 1,
              background: "#e2e8f0",
              color: "#0f172a",
              border: "none",
              padding: "10px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      id: "delete-confirm",
      duration: 10000
    });
  };

  // DRAG DROP
  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFiles = Array.from(
      e.dataTransfer.files
    );

    setSelectedFiles((prev) => [
      ...prev,
      ...droppedFiles
    ]);
  };

  // FILE ICON
  const getFileIcon = (file) => {
    if (file.fileType?.includes("pdf")) {
      return <FaFilePdf color="red" size={22} />;
    }

    if (
      file.fileType?.includes("word") ||
      file.fileName.endsWith(".doc") ||
      file.fileName.endsWith(".docx")
    ) {
      return <FaFileWord color="blue" size={22} />;
    }

    if (file.fileType?.includes("image")) {
      return <FaFileImage color="green" size={22} />;
    }

    return <FaFileImage size={22} />;
  };

  // PREVIEW
  const renderPreview = () => {
    if (!previewFile) return null;

    const url = previewFile.fileUrl;
    const iframeHeight = isMobile ? "400px" : "700px"; // Responsive height

    // PDF
    if (previewFile.fileType?.includes("pdf")) {
      return (
        <iframe
          src={url}
          width="100%"
          height={iframeHeight}
          title="PDF Viewer"
          style={{
            border: "none",
            borderRadius: 10
          }}
        />
      );
    }

    // DOC
    if (
      previewFile.fileType?.includes("word") ||
      previewFile.fileName.endsWith(".doc") ||
      previewFile.fileName.endsWith(".docx")
    ) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${url}&embedded=true`}
          width="100%"
          height={iframeHeight}
          title="DOC Viewer"
          style={{
            border: "none",
            borderRadius: 10
          }}
        />
      );
    }

    // IMAGE
    if (previewFile.fileType?.includes("image")) {
      return (
        <img
          src={url}
          alt=""
          style={{
            width: "100%",
            borderRadius: 10
          }}
        />
      );
    }

    return <p>No preview available</p>;
  };

  // SEARCH
  const filteredFiles = files.filter(file =>
    file.fileName
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        padding: isMobile ? 15 : 25,
        background: "#f4f7fb",
        minHeight: "100vh",
        boxSizing: "border-box"
      }}
    >
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
          success: {
            style: {
              border: "1px solid #10b981"
            }
          },
          error: {
            style: {
              border: "1px solid #ef4444"
            }
          }
        }}
      />

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 15 : 0,
          marginBottom: 25
        }}
      >
        <h2 style={{ margin: 0, textAlign: isMobile ? "center" : "left" }}>
          {employee?.name || "Employee"} Files
        </h2>

        {/* SEARCH */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            padding: "10px 15px",
            borderRadius: 10,
            width: isMobile ? "100%" : 300,
            boxSizing: "border-box",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >
          <FaSearch color="#64748b" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              marginLeft: 10,
              width: "100%"
            }}
          />
        </div>
      </div>

      {/* DRAG DROP */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          background: "#fff",
          padding: isMobile ? 25 : 40,
          borderRadius: 15,
          textAlign: "center",
          border: "2px dashed #6366f1",
          transition: "0.2s",
          marginBottom: 25,
          boxSizing: "border-box"
        }}
      >
        <FaCloudUploadAlt size={isMobile ? 35 : 45} color="#4f46e5" />

        <h3 style={{ fontSize: isMobile ? 18 : 22, marginTop: 15 }}>
          Drag & Drop Files Here
        </h3>

        <p style={{ fontSize: isMobile ? 14 : 16, color: "#64748b" }}>
          or click below to browse
        </p>

        {/* SELECTED + UPLOADING FILES INSIDE DROPZONE */}
        {(selectedFiles.length > 0 || uploadingFiles.length > 0) && (
          <div
            style={{
              marginTop: 25,
              width: "100%",
              maxWidth: 700,
              marginInline: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxSizing: "border-box"
            }}
          >
            {(uploadingFiles.length > 0
              ? uploadingFiles
              : selectedFiles.map((file, index) => ({
                  id: index,
                  name: file.name,
                  size: (file.size / 1024 / 1024).toFixed(2),
                  progress: 0,
                  status: "ready",
                  preview: file.type.includes("image")
                    ? URL.createObjectURL(file)
                    : null
                }))
            ).map((upload) => (
              <div
                key={upload.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: isMobile ? 12 : 16,
                  textAlign: "left",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  boxSizing: "border-box"
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 15,
                    alignItems: isMobile ? "flex-start" : "center"
                  }}
                >
                  {/* IMAGE PREVIEW */}
                  {upload.preview ? (
                    <img
                      src={upload.preview}
                      alt=""
                      style={{
                        width: isMobile ? "100%" : 70,
                        height: isMobile ? 120 : 70,
                        borderRadius: 12,
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: isMobile ? "100%" : 70,
                        height: isMobile ? 60 : 70,
                        borderRadius: 12,
                        background: "#f1f5f9",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      {upload.name.includes(".pdf") ? (
                        <FaFilePdf size={28} color="#ef4444" />
                      ) : upload.name.includes(".doc") ||
                        upload.name.includes(".docx") ? (
                        <FaFileWord size={28} color="#2563eb" />
                      ) : (
                        <FaFileImage size={28} color="#10b981" />
                      )}
                    </div>
                  )}

                  {/* INFO */}
                  <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {upload.name}
                    </div>

                    <small style={{ color: "#64748b" }}>
                      {upload.size} MB
                    </small>

                    {/* PROGRESS */}
                    <div
                      style={{
                        marginTop: 10,
                        height: 10,
                        background: "#e2e8f0",
                        borderRadius: 999,
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          width: `${upload.progress}%`,
                          height: "100%",
                          background:
                            upload.status === "completed"
                              ? "#10b981"
                              : upload.status === "failed"
                              ? "#ef4444"
                              : "#4f46e5",
                          transition: "width 0.3s ease"
                        }}
                      />
                    </div>
                  </div>

                  {/* STATUS */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "row" : "column",
                      alignItems: "center",
                      justifyContent: isMobile ? "space-between" : "center",
                      width: isMobile ? "100%" : "auto",
                      gap: 10,
                      marginTop: isMobile ? 10 : 0
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color:
                          upload.status === "completed"
                            ? "#10b981"
                            : upload.status === "failed"
                            ? "#ef4444"
                            : "#4f46e5"
                      }}
                    >
                      {upload.status === "completed"
                        ? "Completed"
                        : upload.status === "failed"
                        ? "Failed"
                        : upload.status === "ready"
                        ? "Ready"
                        : `${upload.progress}%`}
                    </span>

                    {/* REMOVE BUTTON */}
                    {!loading && (
                      <button
                        onClick={() => {
                          setSelectedFiles((prev) =>
                            prev.filter((file) => file.name !== upload.name)
                          );

                          setUploadingFiles((prev) =>
                            prev.filter((item) => item.id !== upload.id)
                          );
                        }}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* CANCEL ALL */}
            {loading && (
              <button
                onClick={() => setCancelUpload(true)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: 10,
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Cancel Upload
              </button>
            )}
          </div>
        )}

        <input
          type="file"
          multiple
          ref={inputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            e.target.value = "";
          }}
        />

        <br />
        <br />

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 20,
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap"
          }}
        >
          {/* CHOOSE FILES BUTTON */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: "#ffffff",
              color: "#4f46e5",
              border: "2px solid #4f46e5",
              padding: "12px 25px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
              width: isMobile ? "100%" : "auto"
            }}
          >
            Choose Files
          </button>

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            style={{
              background:
                loading || selectedFiles.length === 0 ? "#a5b4fc" : "#4f46e5",
              color: "#fff",
              border: "none",
              padding: "12px 25px",
              borderRadius: 10,
              cursor:
                loading || selectedFiles.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              width: isMobile ? "100%" : "auto"
            }}
          >
            {loading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>

      {/* FILE GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: 20
        }}
      >
        {filteredFiles.map(file => (
          <div
            key={file.id}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 15,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              {/* THUMBNAIL */}
              {file.fileType?.includes("image") ? (
                <img
                  src={file.fileUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginBottom: 15
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f3f4f6",
                    borderRadius: 10,
                    marginBottom: 15
                  }}
                >
                  {getFileIcon(file)}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}
              >
                {getFileIcon(file)}

                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={file.fileName}
                  >
                    {file.fileName}
                  </div>

                  <small style={{ color: "#64748b" }}>
                    {file.fileType || "Unknown Type"}
                  </small>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20
              }}
            >
              <button
                onClick={() => setPreviewFile(file)}
                style={{
                  flex: 1,
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  padding: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5
                }}
              >
                <FaEye /> View
              </button>

              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: "#10b981",
                  color: "#fff",
                  padding: 10,
                  borderRadius: 8,
                  textAlign: "center",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5
                }}
              >
                <FaDownload /> DL
              </a>

              <button
                onClick={() => handleDelete(file)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            padding: isMobile ? 10 : 20,
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1000,
              background: "#fff",
              borderRadius: 15,
              padding: isMobile ? 15 : 20,
              maxHeight: "95vh",
              overflow: "auto",
              boxSizing: "border-box"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                gap: 15,
                marginBottom: 20
              }}
            >
              <h3
                style={{
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={previewFile.fileName}
              >
                {previewFile.fileName}
              </h3>

              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: 8,
                  cursor: "pointer",
                  width: isMobile ? "100%" : "auto"
                }}
              >
                Close
              </button>
            </div>

            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;