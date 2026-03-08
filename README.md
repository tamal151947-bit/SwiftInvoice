# SwiftInvoice 🚀

Fast, simple, and professional invoice generation for small businesses.

🌐 **Live App:** https://swiftinvoice-2.onrender.com

---

## ✨ What is SwiftInvoice?

SwiftInvoice is a lightweight invoicing web app built with:
- 🖥️ PHP + SQLite backend
- 🎨 HTML, CSS, and Vanilla JavaScript frontend
- 🔐 Session-based authentication

It helps you create invoices quickly, manage business profile details, and track invoice history from one dashboard.

---

## 🔥 Key Features

- 🔐 Signup, login, and logout
- 🧾 Invoice generator with dynamic line items
- ➕ Add/remove items with auto amount calculation
- 🧮 Automatic subtotal, GST, and total calculation
- 👤 Business profile management (shop, GST, phone, location, email)
- 👀 Invoice preview before print
- 🖨️ Print-ready invoice output
- 📊 Dashboard with total sales + invoice count
- 🕘 Invoice history tracking

---

## 🌍 Live Demo Links

- Home/Login: `https://swiftinvoice-2.onrender.com/login.html`
- Dashboard: `https://swiftinvoice-2.onrender.com/index.html`
- Invoice Generator: `https://swiftinvoice-2.onrender.com/invoice.html`
- Profile: `https://swiftinvoice-2.onrender.com/profile.html`
- History: `https://swiftinvoice-2.onrender.com/history.html`

---

## 🧰 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** PHP 8.1 (router-based built-in server)
- **Database:** SQLite (`swiftinvoice.db`)
- **Auth:** PHP Sessions + `password_hash(..., PASSWORD_BCRYPT)`
- **Deployment:** Render (Docker)

---

## 📁 Project Structure

```text
.
|- login.html / signup.html
|- index.html               # Dashboard
|- invoice.html             # Invoice generator
|- profile.html             # Business profile
|- history.html             # Invoice history
|- styles.css
|- auth.js                  # Auth frontend logic
|- script.js                # Main app frontend logic
|- router.php               # Request router for PHP server
|- api_auth.php             # Auth API (signup/login/logout)
|- api.php                  # App APIs (dashboard/profile/history/invoices)
|- config.php               # SQLite connection + table bootstrap
|- init_db.php              # Utility script
|- verify.php               # Utility script
|- Dockerfile
|- render.yaml
|- swiftinvoice.db          # Auto-created at runtime
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`

### Protected App APIs
- `GET /dashboard`
- `GET /history`
- `GET /profile`
- `PUT /profile`
- `GET /api_invoices.php`
- `POST /api_invoices.php`

---

## ⚙️ Local Setup

### Option 1: Run with PHP (Recommended)

**Requirements:**
- PHP 8.1+

**Run:**

```bash
php -S 0.0.0.0:8000 router.php
```

Open: `http://localhost:8000/login.html`

### Option 2: Run with Docker

```bash
docker build -t swiftinvoice .
docker run -p 8080:8080 swiftinvoice
```

Open: `http://localhost:8080/login.html`

---

## 🚀 Deploy on Render

This repo is Docker-ready.

1. Push code to GitHub
2. Create a new **Web Service** in Render
3. Connect your repo
4. Render detects `Dockerfile` and builds automatically
5. Deploy 🎉

Container start command:

```bash
php -S 0.0.0.0:8080 router.php
```

### 💾 Data Persistence Note

SQLite data is saved in local file storage (`swiftinvoice.db`).
If your Render instance uses ephemeral storage, data can reset during restart/redeploy.
For production persistence, use Render persistent disk or migrate to a managed DB.

---

## 🔐 Security Notes

- Passwords are never stored in plain text
- Password hashing uses bcrypt
- Session authentication protects private endpoints
- Unauthenticated requests return:

```json
{"success": false, "error": "Not logged in"}
```

---

## 🛠️ Troubleshooting

### Buttons not working
- Hard refresh with `Ctrl+F5`
- Check browser console for JS errors
- Confirm latest commit is deployed on Render

### Login loop / redirect issue
- Clear browser local storage for this domain
- Log in again

### Route not found
- Ensure app starts with `router.php`
- Root `/` should serve `login.html`

---

## 📌 Roadmap Ideas

- 📤 Export invoice as PDF
- 📧 Send invoice via email
- 📦 Product/service templates
- 🌐 Multi-user role management
- ☁️ Cloud database integration

---

## 📄 License

Currently for educational and business utility use.
Add a formal `LICENSE` file (MIT/Apache-2.0) if you want open-source distribution.

---

### Made with ❤️ using PHP + JS + SQLite

### Developed by Tamal Kar
