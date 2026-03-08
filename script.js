// SwiftInvoice Dashboard & Invoicing - PHP Backend Version
const API_BASE_URL = window.location.origin;
const PROFILE_KEY = "swiftInvoiceProfile";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Handle Logout
  const logoutBtn = document.querySelector('a[href="login.html"]');
  if (logoutBtn && logoutBtn.textContent.includes("Log out")) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      localStorage.removeItem(PROFILE_KEY);
      window.location.href = "login.html";
    });
  }

  // Dashboard functionality
  const totalSalesEl = document.getElementById("totalSales");
  const invoiceCountEl = document.getElementById("invoiceCount");
  const recentInvoiceList = document.getElementById("recentInvoiceList");

  if (totalSalesEl) {
    loadDashboard();
    window.addEventListener('focus', loadDashboard);
  }

  // Profile page functionality
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    loadProfileData();
    profileForm.addEventListener("submit", saveProfile);
  }

  // Invoice generator functionality
  const addItemBtn = document.getElementById("addItemBtn");
  if (addItemBtn) {
    loadBusinessProfile();
    document.getElementById("invoiceDate").valueAsDate = new Date();
    addItemBtn.addEventListener("click", addInvoiceItem);
    document.getElementById("generatePreviewBtn").addEventListener("click", generatePreview);
    document.getElementById("printInvoiceBtn").addEventListener("click", printInvoice);
    addInvoiceItem();
  }

  // History page
  const historyTableBody = document.getElementById("historyTableBody");
  if (historyTableBody) {
    loadHistory();
    window.addEventListener('focus', loadHistory);
  }

  // --- DASHBOARD FUNCTIONS ---
  async function loadDashboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      const data = await response.json();

      if (data.success) {
        const stats = data.stats;
        totalSalesEl.textContent = "₹" + (stats.total_sales || 0).toLocaleString("en-IN");
        invoiceCountEl.textContent = stats.invoice_count || 0;

        if (recentInvoiceList) {
          if (!data.recent_invoices || data.recent_invoices.length === 0) {
            recentInvoiceList.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">No invoices yet. <a href="invoice.html">Create one now.</a></div>`;
          } else {
            recentInvoiceList.innerHTML = data.recent_invoices.map(inv => `
              <div class="invoice-row">
                <div class="invoice-info">
                  <div class="invoice-id">Invoice #${String(inv.invoice_number).padStart(6, '0')}</div>
                  <div class="invoice-customer">${inv.customer_name}</div>
                </div>
                <div class="invoice-date">${new Date(inv.invoice_date).toLocaleDateString()}</div>
                <div class="invoice-amount">₹${inv.total_amount.toLocaleString("en-IN")}</div>
                <div class="invoice-status ${inv.status.toLowerCase()}">${inv.status}</div>
              </div>
            `).join("");
          }
        }
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  }

  // --- PROFILE FUNCTIONS ---
  async function loadProfileData() {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`);
      const data = await response.json();

      if (data.success && data.profile) {
        const profile = data.profile;
        document.getElementById("fullName").value = profile.full_name || "";
        document.getElementById("userPassword").value = "";
        document.getElementById("shopName").value = profile.shop_name || "";
        document.getElementById("gstNumber").value = profile.gst_number || "";
        document.getElementById("phoneNumber").value = profile.phone || "";
        document.getElementById("location").value = profile.location || "";
        document.getElementById("email").value = profile.email || "";
      }
      updateProfileView();
    } catch (error) {
      console.error("Profile load error:", error);
    }
  }

  function updateProfileView() {
    const profile = {
      name: document.getElementById("fullName").value,
      password: document.getElementById("userPassword").value,
      shopName: document.getElementById("shopName").value,
      gst: document.getElementById("gstNumber").value,
      phone: document.getElementById("phoneNumber").value,
      location: document.getElementById("location").value,
      email: document.getElementById("email").value
    };
    if (document.getElementById("viewName")) {
      document.getElementById("viewName").textContent = profile.name || "-";
      document.getElementById("viewEmail").textContent = profile.email || "-";
      document.getElementById("viewPassword").textContent = profile.password ? "••••" : "-";
      document.getElementById("viewPhone").textContent = profile.phone || "-";
      document.getElementById("viewGst").textContent = profile.gst || "-";
      document.getElementById("viewShop").textContent = profile.shopName || "-";
      document.getElementById("viewLocation").textContent = profile.location || "-";
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    const profileData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      shopName: document.getElementById("shopName").value,
      gstNumber: document.getElementById("gstNumber").value,
      location: document.getElementById("location").value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile saved successfully!");
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
      } else {
        alert("Error: " + (data.error || "Failed to save"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Connection error");
    }
  }

  // Attach listeners to profile inputs
  setTimeout(() => {
    const fields = ["fullName", "userPassword", "shopName", "gstNumber", "phoneNumber", "location", "email"];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateProfileView);
    });
  }, 100);

  // --- INVOICE FUNCTIONS ---
  async function loadBusinessProfile() {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
    document.getElementById("bizShopName").textContent = profile.shopName || "-";
    document.getElementById("bizGst").textContent = profile.gst || "-";
    document.getElementById("bizPhone").textContent = profile.phone || "-";
    document.getElementById("bizLocation").textContent = profile.location || "-";
    document.getElementById("bizEmail").textContent = profile.email || "-";
  }

  let itemCount = 0;

  function addInvoiceItem() {
    const invoiceItems = document.getElementById("invoiceItems");
    itemCount++;
    const row = document.createElement("tr");
    row.id = `item-${itemCount}`;
    row.innerHTML = `
      <td><input type="text" class="item-desc" placeholder="Item description"></td>
      <td><input type="number" class="item-qty" min="1" value="1"></td>
      <td><input type="number" class="item-price" min="0" step="0.01" value="0"></td>
      <td class="item-amount">₹0.00</td>
      <td><button type="button" class="btn-icon btn-danger" onclick="removeItem('item-${itemCount}')"><i class="fa-solid fa-trash"></i></button></td>
    `;
    invoiceItems.appendChild(row);
    row.querySelector(".item-qty").addEventListener("input", calculateTotals);
    row.querySelector(".item-price").addEventListener("input", calculateTotals);
  }

  function removeItem(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
    calculateTotals();
  }

  window.removeItem = removeItem;

  function calculateTotals() {
    let subtotal = 0;
    document.querySelectorAll("#invoiceItems tr").forEach(row => {
      const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      const amount = qty * price;
      row.querySelector(".item-amount").textContent = "₹" + amount.toFixed(2);
      subtotal += amount;
    });

    const gstRate = parseFloat(document.getElementById("gstRate").value) || 0;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;

    document.getElementById("summarySubtotal").textContent = "₹" + subtotal.toFixed(2);
    document.getElementById("summaryGst").textContent = "₹" + gstAmount.toFixed(2);
    document.getElementById("summaryTotal").textContent = "₹" + total.toFixed(2);
  }

  function generatePreview() {
    const items = [];
    document.querySelectorAll("#invoiceItems tr").forEach(row => {
      items.push({
        desc: row.querySelector(".item-desc").value,
        qty: parseFloat(row.querySelector(".item-qty").value) || 0,
        price: parseFloat(row.querySelector(".item-price").value) || 0
      });
    });

    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const gstRate = parseFloat(document.getElementById("gstRate").value) || 0;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;
    const invoiceNo = Math.floor(Math.random() * 100000);
    const invoiceDate = document.getElementById("invoiceDate").value;
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

    const preview = `
      <div class="invoice-preview" style="font-family: Arial; padding: 20px; background: white; color: #333;">
        <div style="text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #0066cc; font-size: 28px;">INVOICE</h1>
          <p style="color: #666; margin: 5px 0;">Professional Business Invoice</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f5f5f5;">
          <div><label style="font-weight: bold; color: #333;">Invoice Number:</label> <span style="color: #0066cc; font-weight: bold;">#${String(invoiceNo).padStart(6, '0')}</span></div>
          <div><label style="font-weight: bold; color: #333;">Invoice Date:</label> <span style="color: #0066cc; font-weight: bold;">${new Date(invoiceDate).toLocaleDateString()}</span></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="color: #0066cc; font-size: 13px;">FROM (SELLER)</h3>
            <p><strong>${profile.shopName || 'Your Business'}</strong></p>
            <p>${profile.location || 'Business Location'}</p>
            <p>GST: <strong>${profile.gst || 'N/A'}</strong></p>
            <p>Phone: <strong>${profile.phone || 'N/A'}</strong></p>
          </div>
          <div>
            <h3 style="color: #0066cc; font-size: 13px;">BILL TO (CUSTOMER)</h3>
            <p><strong>${document.getElementById("customerName").value || 'Customer'}</strong></p>
            <p>Email: <strong>${document.getElementById("customerEmail").value || 'N/A'}</strong></p>
            <p>Phone: <strong>${document.getElementById("customerPhone").value || 'N/A'}</strong></p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead style="background: #0066cc; color: white;">
            <tr><th style="padding: 12px; text-align: left;">Description</th><th>Qty</th><th>Unit Price</th><th style="text-align: right;">Amount</th></tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${item.desc || 'Item ' + (idx + 1)}</td>
                <td style="padding: 10px; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 20px;">
          <div style="width: 250px; margin-left: auto;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
              <span>Subtotal:</span> <strong>₹${subtotal.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
              <span>GST (${gstRate}%):</span> <strong>₹${gstAmount.toFixed(2)}</strong>
            </div>
            <div style="background: #0066cc; color: white; padding: 12px; margin-top: 10px; display: flex; justify-content: space-between; font-weight: bold;">
              <span>Total:</span> <strong>₹${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div style="padding: 12px; background: #f5f5f5; margin-bottom: 20px;">
          <label style="font-weight: bold;">Payment Method:</label> <strong style="color: #0066cc;">${document.querySelector('input[name="paymentMethod"]:checked').value}</strong>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px;">
          <div style="text-align: center;">
            <div style="border-top: 2px solid #333; height: 60px;"></div>
            <p style="font-weight: bold; font-size: 12px;">Authorized By</p>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 2px solid #333; height: 60px;"></div>
            <p style="font-weight: bold; font-size: 12px;">Customer Signature</p>
          </div>
        </div>
      </div>
    `;

    const previewPanel = document.getElementById("previewPanel");
    previewPanel.innerHTML = preview;
    previewPanel.classList.remove("hidden");
    document.getElementById("printInvoiceBtn").classList.remove("hidden");

    // Save to server
    saveInvoiceToServer(invoiceNo, invoiceDate, items, subtotal, gstRate, gstAmount, total);
    calculateTotals();
  }

  async function saveInvoiceToServer(invoiceNo, invoiceDate, items, subtotal, gstRate, gstAmount, total) {
    const invoiceData = {
      id: invoiceNo,
      date: invoiceDate,
      customer: document.getElementById("customerName").value,
      customerEmail: document.getElementById("customerEmail").value,
      customerPhone: document.getElementById("customerPhone").value,
      amount: total,
      items: items,
      subtotal: subtotal,
      gstRate: gstRate,
      gstAmount: gstAmount,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api_invoices.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification(invoiceNo, total);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  }

  function showNotification(invoiceNo, amount) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #2E7D32; color: white;
      padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 9999; font-weight: bold; max-width: 350px; font-family: Arial;
    `;
    notification.innerHTML = `
      <div style="margin-bottom: 12px; font-size: 16px;">✅ Invoice Created!</div>
      <div style="margin-bottom: 12px; font-size: 13px; font-weight: normal; background: rgba(255,255,255,0.2); padding: 8px; border-radius: 4px;">
        <div><strong>Invoice ID:</strong> #${String(invoiceNo).padStart(6, '0')}</div>
        <div><strong>Amount:</strong> ₹${amount.toLocaleString("en-IN")}</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button onclick="window.location.href='index.html'" style="background: white; color: #2E7D32; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📊 Dashboard</button>
        <button onclick="window.location.href='history.html'" style="background: white; color: #2E7D32; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📋 History</button>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.4s';
      setTimeout(() => notification.remove(), 400);
    }, 8000);
  }

  function printInvoice() {
    const invoiceContent = document.querySelector('.invoice-preview');
    if (!invoiceContent) {
      alert("Please generate preview first!");
      return;
    }

    const printWindow = window.open('', '', 'height=900,width=900');
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Invoice Print</title>
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; }
        @page { size: A4; margin: 0; }
      </style></head><body>
      ${invoiceContent.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  // --- HISTORY FUNCTIONS ---
  async function loadHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      const data = await response.json();

      if (data.success) {
        renderHistoryTable(data.invoices || []);
      }
    } catch (error) {
      console.error("History load error:", error);
    }
  }

  function renderHistoryTable(invoices) {
    if (!historyTableBody) return;

    if (!invoices || invoices.length === 0) {
      historyTableBody.innerHTML = `
        <tr><td colspan="5" style="text-align: center; padding: 30px; color: #999;">
          No invoices found. <a href="invoice.html">Create your first invoice.</a>
        </td></tr>
      `;
      return;
    }

    historyTableBody.innerHTML = invoices.map(inv => `
      <tr>
        <td>#${String(inv.invoice_number).padStart(6, '0')}</td>
        <td>${inv.customer_name}</td>
        <td>${new Date(inv.invoice_date).toLocaleDateString()}</td>
        <td>₹${inv.total_amount.toLocaleString("en-IN")}</td>
        <td>
          <button class="btn-icon btn-info" onclick="alert('View Invoice #${String(inv.invoice_number).padStart(6, '0')}')"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>
    `).join("");
  }
});
