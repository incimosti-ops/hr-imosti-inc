import { useState } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hr");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        alert("No user data found.");
        return;
      }

      localStorage.setItem("role", userSnap.data().role);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
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
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE - BRANDING & YOUTUBE BACKGROUND */}
      <div style={styles.left}>
        <div style={styles.videoWrapper}>
          <iframe
            style={styles.iframe}
            src="https://www.youtube.com/embed/CEzCaHhO7IM?autoplay=1&mute=1&loop=1&playlist=CEzCaHhO7IM&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&disablekb=1"
            title="IMOSTI INC."
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
        
        <div style={styles.videoOverlay}>
          <div style={styles.content}>
            <div style={styles.logoBadge}>IMOSTI</div>
            <h1 style={styles.brandTitle}>IMOSTI HR</h1>
            <p style={styles.brandDesc}>
              Streamline your workforce management with our next-generation digital ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - MODERNIZED FORM */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.headerArea}>
            <h2 style={styles.title}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={styles.subtitle}>
              {isRegister ? "Sign up to start managing your team" : "Enter your details to access your dashboard"}
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
              style={loading ? {...styles.button, opacity: 0.7} : styles.button}
              disabled={loading}
            >
              {loading ? "Authenticating..." : (isRegister ? "Create Account" : "Sign In to Dashboard")}
            </button>
          </div>

          <div style={styles.footer}>
            <p style={styles.switchText}>
              {isRegister ? "Already have an account?" : "New to the platform?"}
              <span
                onClick={() => setIsRegister(!isRegister)}
                style={styles.link}
              >
                {isRegister ? " Log in here" : " Create an account"}
              </span>
            </p>
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
    overflow: "hidden",
  },
  /* --- LEFT SIDE STYLES --- */
  left: {
    flex: 1.2,
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
    padding: "60px",
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
    fontSize: "64px",
    fontWeight: "900",
    marginBottom: "16px",
    lineHeight: "1",
    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  brandDesc: {
    fontSize: "19px",
    lineHeight: "1.6",
    opacity: 0.9,
    fontWeight: "400",
  },
  /* --- RIGHT SIDE STYLES (MODERNIZED) --- */
  right: {
    flex: 0.8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "48px",
    borderRadius: "28px",
    background: "#ffffff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    border: "1px solid #E2E8F0",
  },
  headerArea: {
    marginBottom: "36px",
  },
  title: {
    fontSize: "32px",
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
    fontSize: "15px",
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