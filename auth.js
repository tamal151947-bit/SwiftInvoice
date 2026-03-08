// Simple authentication - no server, no storage complexity
const CURRENT_USER_KEY = "swiftInvoiceCurrentUser";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authMessage = document.getElementById("authMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (email && password) {
        // Accept any credentials - simple demo mode
        const user = { email, name: email.split("@")[0] };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        window.location.href = "index.html";
      } else {
        showMessage("Please fill in all fields", "error");
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
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

      // Create user in demo mode
      const user = { email, name: fullName };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      window.location.href = "index.html";
    });
  }

  function showMessage(msg, type) {
    authMessage.textContent = msg;
    authMessage.className = "form-message " + (type === "error" ? "error" : "success");
  }
});
