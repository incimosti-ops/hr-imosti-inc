import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// ✅ NEW IMPORTS
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../imosti1.png";

function Overview() {
  const { id, employee } = useOutletContext();
  const [trainings, setTrainings] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);

  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ==========================================
  // 1. FETCH TRAININGS FROM FIREBASE
  // ==========================================
  useEffect(() => {
    const fetchTrainings = async () => {
      if (!id) {
        setLoadingTrainings(false);
        return;
      }

      try {
        const q = query(
          collection(db, "training"),
          where("employeeId", "==", id)
        );

        const querySnapshot = await getDocs(q);
        const trainingData = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));

        const sortedData = trainingData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrainings(sortedData);
      } catch (error) {
        console.error("Error fetching training data:", error);
      } finally {
        setLoadingTrainings(false);
      }
    };

    fetchTrainings();
  }, [id]);

  // ==========================================
  // 2. GENERATE PDF
  // ==========================================
  const generatePDF = () => {
    const doc = new jsPDF();

    const drawHeader = () => {
      try {
        doc.addImage(logo, 'PNG', 20, 10, 30, 38);
      } catch (error) {
        doc.setFillColor(0, 0, 0);
        doc.rect(20, 10, 30, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text("IMOSTI", 35, 42, { align: "center" });
      }

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("International Maritime & Offshore Safety Training Institute, Inc.", 55, 25);

      doc.setDrawColor(249, 115, 22); 
      doc.setLineWidth(1);
      doc.line(55, 28, 196, 28);

      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(16);
      doc.text("201 Files / CV", 196, 36, { align: "right" });
    };

    drawHeader();
    let yPos = 50;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Curriculum Vitae", 105, yPos, { align: "center" });
    yPos += 8;

    doc.setFontSize(12);
    doc.text(employee.name?.toUpperCase() || "N/A", 105, yPos, { align: "center" });
    yPos += 2;
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.line(50, yPos, 160, yPos);

    // PRESENT ADDRESS
yPos += 5;

doc.setFont("helvetica", "bold");
doc.text("Present Address:", 105, yPos, { align: "center" });

yPos += 6;

doc.setFont("helvetica", "normal");
doc.text(employee.presentAddress || "N/A", 105, yPos, { align: "center" });

// PERMANENT ADDRESS
yPos += 10;

doc.setFont("helvetica", "bold");
doc.text("Permanent Address:", 105, yPos, { align: "center" });

yPos += 6;

doc.setFont("helvetica", "normal");
doc.text(employee.permanentAddress || "N/A", 105, yPos, { align: "center" });
yPos += 3;
doc.line(50, yPos, 160, yPos);
    yPos += 5;
    doc.text(`Tel No. ${employee.contactNo || "N/A"}`, 105, yPos, { align: "center" });
    yPos += 2;
    doc.line(50, yPos, 160, yPos);

    yPos += 15;
    doc.text("QUALIFICATIONS:", 25, yPos);
    yPos += 8;
    doc.text("Educational Attainment:", 35, yPos);
    yPos += 8;

    if (employee.education && employee.education.length > 0) {
      employee.education.forEach(edu => {
        doc.setFont("helvetica", "normal");
        doc.text(edu.category || "N/A", 35, yPos);
        doc.text(":", 70, yPos);
        doc.setFont("helvetica", "bold");
        doc.text(edu.school || "N/A", 80, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        if (edu.degree) { doc.text(edu.degree, 80, yPos); yPos += 5; }
        if (edu.year) { doc.text(edu.year, 80, yPos); yPos += 5; }
        yPos += 4;
      });
    }

    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text("WORK EXPERIENCE:", 14, yPos);
    yPos += 4;

    const experienceRows = (employee.workExperience && employee.workExperience.length > 0)
      ? employee.workExperience.map(exp => [exp.position || "N/A", exp.company || "N/A", exp.type || "N/A", exp.duration || "N/A"])
      : [["N/A", "N/A", "N/A", "N/A"]];

    autoTable(doc, {
      startY: yPos,
      head: [["Position / Title", "Company", "Type", "Duration"]],
      body: experienceRows,
      theme: 'grid',
      headStyles: { fillColor: [169, 169, 169], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 }
    });

    doc.addPage();
    drawHeader();
    yPos = 55;

    doc.setFont("helvetica", "bold");
    doc.text("TRAININGS / SEMINARS ATTENDED:", 12, yPos);
    yPos += 8;

    const trainingRows = trainings.length > 0
      ? trainings.map(item => [
          item.training?.toUpperCase() || "N/A",
          item.provider?.toUpperCase() || "N/A",
          item.date || "N/A"
        ])
      : [["No records found", "", ""]];

    autoTable(doc, {
      startY: yPos,
      head: [["TOPIC", "LOCATION", "DATE"]], 
      body: trainingRows,
      theme: 'grid',
      headStyles: { fillColor: [169, 169, 169], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'middle' },
      columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 65 }, 2: { cellWidth: 'auto' } }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setTextColor(135, 206, 235);
      doc.setFontSize(9);
      doc.text("International Maritime & Offshore Safety Training Institute, Inc.", 105, footerY, { align: "center" });
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text("10th Floor Room 1008 ASEANA Two Bldg., Bradco Avenue", 105, footerY + 4, { align: "center" });
    }

    doc.save(`${employee.name || "employee"}_CV.pdf`);
  };

  // ==========================================
  // 3. STYLES (DYNAMIC BASED ON isMobile)
  // ==========================================
  const styles = {
    container: {
      padding: isMobile ? "15px" : "30px",
      background: "#f8fafc",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "1500px",
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
    },
    headerRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      marginBottom: "20px",
      gap: isMobile ? "10px" : "0"
    },
    title: {
      margin: 0,
      color: "#1e293b",
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: "700"
    },
    exportBtn: {
      width: isMobile ? "100%" : "auto",
      padding: "10px 20px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
      gap: isMobile ? "15px" : "25px",
      alignItems: "start",
    },
    card: {
      background: "#ffffff",
      padding: isMobile ? "18px" : "25px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column"
    },
    cardTitle: {
      color: "#f97316",
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "15px",
      paddingBottom: "8px",
      borderBottom: "2px solid #f97316",
      width: "fit-content"
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      gap: "15px",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9"
    },
    label: {
      color: "#64748b",
      fontWeight: "600",
      fontSize: "13px",
      minWidth: "100px"
    },
    value: {
      color: "#1e293b",
      fontWeight: "600",
      fontSize: "14px",
      textAlign: "right",
      wordBreak: "break-word"
    },
    mutedText: {
      color: "#94a3b8",
      fontSize: "14px",
      fontStyle: "italic"
    },
    trainingList: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      maxHeight: isMobile ? "none" : "500px",
      overflowY: isMobile ? "visible" : "auto",
      paddingRight: isMobile ? "0" : "10px",
      paddingBottom: "5px",
    },
    trainingItem: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px"
    },
    trainingHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "10px",
      marginBottom: "12px"
    },
    trainingTitle: {
      margin: 0,
      fontSize: "15px",
      fontWeight: "700",
      lineHeight: "1.2"
    },
    statusBadge: {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      height: "fit-content",
      whiteSpace: "nowrap"
    },
    trainingGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px"
    },
    trainingDetail: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    },
    labelSmall: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#64748b"
    },
    valueSmall: {
      fontSize: "13px",
      wordBreak: "break-word",
      fontWeight: "500"
    },
    remarksBox: {
      marginTop: "10px",
      padding: "10px",
      background: "#fff",
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    },
    remarksText: {
      margin: 0,
      fontSize: "13px",
      color: "#334155"
    }
  };

  // ==========================================
  // 4. UI RENDER
  // ==========================================
  if (!employee) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Employee Overview</h2>
        <button onClick={generatePDF} style={styles.exportBtn}>
          Download CV
        </button>
      </div>

      <div style={styles.grid}>
        {/* Basic Information */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Basic Information</h3>

          <div style={styles.row}>
            <span style={styles.label}>Full Name</span>
            <span style={styles.value}>{employee.name || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Employee ID</span>
            <span style={styles.value}>{employee.employeeId || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Present Address</span>
            <span style={styles.value}>{employee.presentAddress || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Permanent Address</span>
            <span style={styles.value}>{employee.permanentAddress || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Status</span>
            <span style={{ ...styles.value, color: "#f97316", fontWeight: "700" }}>
              {employee.status || "N/A"}
            </span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Position</span>
            <span style={styles.value}>{employee.position || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Department</span>
            <span style={styles.value}>{employee.department || "N/A"}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Location</span>
            <span style={styles.value}>{employee.location || "N/A"}</span>
          </div>
        </div>

        {/* Educational Attainment */}
        {employee.education && employee.education.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Education</h3>
            <div style={styles.trainingList}>
              {employee.education.map((edu, index) => (
                <div key={index} style={styles.trainingItem}>
                  <div style={styles.trainingGrid}>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>Category</span>
                      <span style={styles.valueSmall}>{edu.category || "N/A"}</span>
                    </div>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>Degree</span>
                      <span style={styles.valueSmall}>{edu.degree || "N/A"}</span>
                    </div>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>School</span>
                      <span style={styles.valueSmall}>{edu.school || "N/A"}</span>
                    </div>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>Year</span>
                      <span style={styles.valueSmall}>{edu.year || "N/A"}</span>
                    </div>
                  </div>
                  {edu.details && (
                    <div style={styles.remarksBox}>
                      <span style={styles.labelSmall}>Details:</span>
                      <p style={styles.remarksText}>{edu.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Records */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Trainings</h3>
          {loadingTrainings ? (
            <p style={styles.mutedText}>Loading...</p>
          ) : trainings.length > 0 ? (
            <div style={styles.trainingList}>
              {trainings.map((item) => (
                <div key={item.docId} style={styles.trainingItem}>
                  <div style={styles.trainingHeader}>
                    <h4 style={styles.trainingTitle}>{item.training || "Untitled"}</h4>
                    <span style={{
                        ...styles.statusBadge,
                        backgroundColor: item.status === "Completed" ? "#d1fae5" : "#fef3c7",
                        color: item.status === "Completed" ? "#047857" : "#d97706"
                    }}>
                      {item.status || "Pending"}
                    </span>
                  </div>
                  <div style={styles.trainingGrid}>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>Date</span>
                      <span style={styles.valueSmall}>{item.date || "N/A"}</span>
                    </div>
                    <div style={styles.trainingDetail}>
                      <span style={styles.labelSmall}>Provider</span>
                      <span style={styles.valueSmall}>{item.provider || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.mutedText}>No records found.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Overview;