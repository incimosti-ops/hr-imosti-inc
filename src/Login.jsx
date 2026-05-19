import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hr");
  const [loading, setLoading] = useState(false);
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();

  // Listen to window resize to toggle mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getFriendlyErrorMessage = (error) => {
    switch (error.code) {
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use": // Corrected from email-already-in-box
        return "This email is already registered.";
      default:
        // Fallback: strip "Firebase:" and parentheses if code isn't caught
        return error.message.replace(/Firebase:|\(auth\/.*\)./g, "").trim();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        toast.error("Account data not found. Please contact support.");
        return;
      }

      localStorage.setItem("role", userSnap.data().role);
      toast.success(`Welcome back!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role,
        createdAt: new Date(),
      });

      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        flexDirection: isMobile ? "column" : "row",
        overflowY: isMobile ? "auto" : "hidden",
      }}
    >
      {/* LEFT SIDE - BRANDING & YOUTUBE BACKGROUND */}
      <div
        style={{
          ...styles.left,
          flex: isMobile ? "none" : 1.2,
          minHeight: isMobile ? "280px" : "100%",
          width: isMobile ? "100%" : "auto",
        }}
      >
        <div style={styles.videoWrapper}>
          <iframe
            style={styles.iframe}
            src="https://www.youtube.com/embed/CEzCaHhO7IM?autoplay=1&mute=1&loop=1&playlist=CEzCaHhO7IM&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&disablekb=1"
            title="IMOSTI INC."
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>

        <div
          style={{
            ...styles.videoOverlay,
            padding: isMobile ? "30px 20px" : "60px",
            justifyContent: isMobile ? "center" : "flex-start",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div style={styles.content}>
            <div style={styles.logoBadge}>IMOSTI</div>
            <h1
              style={{
                ...styles.brandTitle,
                fontSize: isMobile ? "40px" : "64px",
              }}
            >
              IMOSTI HR
            </h1>
            <p
              style={{
                ...styles.brandDesc,
                fontSize: isMobile ? "16px" : "19px",
              }}
            >
              Streamline your workforce management with our next-generation
              digital ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - MODERNIZED FORM */}
      <div
        style={{
          ...styles.right,
          flex: isMobile ? "1" : 0.8,
          padding: isMobile ? "20px" : "40px",
          width: isMobile ? "100%" : "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...styles.card,
            padding: isMobile ? "32px 24px" : "48px",
          }}
        >
          <div style={styles.headerArea}>
            <h2 style={{ ...styles.title, fontSize: isMobile ? "28px" : "32px" }}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={styles.subtitle}>
              {isRegister
                ? "Sign up to start managing your team"
                : "Enter your details to access your dashboard"}
            </p>
          </div>

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. alex@imosti.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            {isRegister && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="hr">Human Resources (HR)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}

            <button
              onClick={isRegister ? handleRegister : handleLogin}
              style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
              disabled={loading}
            >
              {loading
                ? "Authenticating..."
                : isRegister
                ? "Create Account"
                : "Sign In to Dashboard"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: "#F1F5F9",
  },
  /* --- LEFT SIDE STYLES --- */
  left: {
    position: "relative",
    overflow: "hidden",
    background: "#111",
    display: "flex",
    alignItems: "center",
  },
  videoWrapper: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  iframe: {
    width: "300%",
    height: "100%",
    marginLeft: "-100%",
    objectFit: "cover",
    filter: "grayscale(20%) brightness(0.8)",
  },
  videoOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(255, 107, 0, 0.4), rgba(0, 0, 0, 0.8))",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
  },
  logoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    display: "inline-block",
    marginBottom: "20px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  content: {
    position: "relative",
    zIndex: 2,
    maxWidth: "500px",
    color: "#fff",
  },
  brandTitle: {
    fontWeight: "900",
    marginBottom: "16px",
    lineHeight: "1",
    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  brandDesc: {
    lineHeight: "1.6",
    opacity: 0.9,
    fontWeight: "400",
  },
  /* --- RIGHT SIDE STYLES --- */
  right: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    borderRadius: "28px",
    background: "#ffffff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    border: "1px solid #E2E8F0",
  },
  headerArea: {
    marginBottom: "36px",
  },
  title: {
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "10px",
    letterSpacing: "-1px",
  },
  subtitle: {
    color: "#64748B",
    fontSize: "16px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginLeft: "4px",
  },
  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    backgroundColor: "#F8FAFC",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s ease",
    color: "#1E293B",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#ff6b00",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    marginTop: "8px",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
    boxShadow: "0 10px 15px -3px rgba(255, 107, 0, 0.4)",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center",
  },
  switchText: {
    color: "#64748B",
  },
  link: {
    color: "#ff6b00",
    fontWeight: "700",
    cursor: "pointer",
    marginLeft: "6px",
    textDecoration: "none",
  },
};

export default Login;