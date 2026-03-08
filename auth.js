// SwiftInvoice Authentication - PHP Backend Version
const API_BASE_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authMessage = document.getElementById("authMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        showMessage(data.error || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Connection error. Check if PHP server is running.", "error");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullName || !email || !password || !confirmPassword) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        showMessage(data.error || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      showMessage("Connection error. Check if PHP server is running.", "error");
    }
  }

  function showMessage(msg, type) {
    if (authMessage) {
      authMessage.textContent = msg;
      authMessage.className = "form-message " + (type === "error" ? "error" : "success");
      authMessage.style.display = "block";
    }
  }
});
