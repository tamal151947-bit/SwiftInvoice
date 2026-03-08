// Simple invoice management - no server, offline only
const CURRENT_USER_KEY = "swiftInvoiceCurrentUser";
const INVOICES_KEY = "swiftInvoiceData";
const PROFILE_KEY = "swiftInvoiceProfile";

// Initialize demo data
function initializeDemoData() {
  if (!localStorage.getItem(INVOICES_KEY)) {
    const demoInvoices = [
      {
        id: 1,
        date: "2025-02-15",
        customer: "Acme Corporation",
        amount: 15000,
        status: "Paid",
        items: [{ desc: "Consulting Services", qty: 10, price: 1000 }]
      },
      {
        id: 2,
        date: "2025-02-10",
        customer: "Tech Solutions Ltd",
        amount: 8500,
        status: "Pending",
        items: [{ desc: "Software License", qty: 1, price: 8500 }]
      },
      {
        id: 3,
        date: "2025-02-05",
        customer: "Global Retail Inc",
        amount: 22000,
        status: "Paid",
        items: [{ desc: "Products", qty: 50, price: 440 }]
      }
    ];
    localStorage.setItem(INVOICES_KEY, JSON.stringify(demoInvoices));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  initializeDemoData();

  // Dashboard stats
  const totalSalesEl = document.getElementById("totalSales");
  const invoiceCountEl = document.getElementById("invoiceCount");
  const recentInvoiceList = document.getElementById("recentInvoiceList");

  function refreshDashboard() {
    console.log("Refreshing dashboard...");
    if (totalSalesEl) {
      const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
      console.log("Loaded invoices:", invoices.length, invoices);
      
      const totalSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      totalSalesEl.textContent = "₹" + totalSales.toLocaleString("en-IN");
      invoiceCountEl.textContent = invoices.length;

      // Recent invoices table
      if (recentInvoiceList) {
        if (invoices.length === 0) {
          recentInvoiceList.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">No invoices yet. <a href="invoice.html">Create one now.</a></div>`;
        } else {
          recentInvoiceList.innerHTML = invoices.map(inv => `
            <div class="invoice-row">
              <div class="invoice-info">
                <div class="invoice-id">Invoice #${String(inv.id).padStart(6, '0')}</div>
                <div class="invoice-customer">${inv.customer}</div>
              </div>
              <div class="invoice-date">${new Date(inv.date).toLocaleDateString()}</div>
              <div class="invoice-amount">₹${inv.amount.toLocaleString("en-IN")}</div>
              <div class="invoice-status ${inv.status.toLowerCase()}">${inv.status}</div>
            </div>
          `).join("");
        }
      }
    }
  }

  // Refresh dashboard on page focus (when user comes back from another page)
  window.addEventListener('focus', refreshDashboard);
  
  // Initial refresh
  refreshDashboard();

  // Profile page
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    loadProfileData();
    profileForm.addEventListener("submit", saveProfile);
  }

  // Invoice generator
  const addItemBtn = document.getElementById("addItemBtn");
  const invoiceItems = document.getElementById("invoiceItems");
  const generatePreviewBtn = document.getElementById("generatePreviewBtn");
  const printInvoiceBtn = document.getElementById("printInvoiceBtn");
  const previewPanel = document.getElementById("previewPanel");

  if (addItemBtn) {
    // Load business profile on invoice page
    loadBusinessProfile();

    // Set today's date
    document.getElementById("invoiceDate").valueAsDate = new Date();

    addItemBtn.addEventListener("click", addInvoiceItem);
    generatePreviewBtn.addEventListener("click", generatePreview);
    printInvoiceBtn.addEventListener("click", printInvoice);

    // Initialize first item row
    addInvoiceItem();
  }
});

function loadBusinessProfile() {
  const profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  document.getElementById("bizShopName").textContent = profile.shopName || "-";
  document.getElementById("bizGst").textContent = profile.gst || "-";
  document.getElementById("bizPhone").textContent = profile.phone || "-";
  document.getElementById("bizLocation").textContent = profile.location || "-";
  document.getElementById("bizEmail").textContent = profile.email || "-";
}

function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  document.getElementById("fullName").value = profile.name || "";
  document.getElementById("userPassword").value = profile.password || "";
  document.getElementById("shopName").value = profile.shopName || "";
  document.getElementById("gstNumber").value = profile.gst || "";
  document.getElementById("phoneNumber").value = profile.phone || "";
  document.getElementById("location").value = profile.location || "";
  document.getElementById("email").value = profile.email || "";
  updateProfileView();
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
  document.getElementById("viewName").textContent = profile.name || "-";
  document.getElementById("viewEmail").textContent = profile.email || "-";
  document.getElementById("viewPassword").textContent = profile.password ? "••••" : "-";
  document.getElementById("viewPhone").textContent = profile.phone || "-";
  document.getElementById("viewGst").textContent = profile.gst || "-";
  document.getElementById("viewShop").textContent = profile.shopName || "-";
  document.getElementById("viewLocation").textContent = profile.location || "-";
}

function saveProfile(e) {
  e.preventDefault();
  const profile = {
    name: document.getElementById("fullName").value,
    password: document.getElementById("userPassword").value,
    shopName: document.getElementById("shopName").value,
    gst: document.getElementById("gstNumber").value,
    phone: document.getElementById("phoneNumber").value,
    location: document.getElementById("location").value,
    email: document.getElementById("email").value
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  alert("Profile saved successfully!");
}

// Add listeners to profile inputs for real-time view updates
setTimeout(() => {
  const fields = ["fullName", "userPassword", "shopName", "gstNumber", "phoneNumber", "location", "email"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateProfileView);
  });
}, 100);

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
  
  // Add calculation listeners
  row.querySelector(".item-qty").addEventListener("input", calculateTotals);
  row.querySelector(".item-price").addEventListener("input", calculateTotals);
}

function removeItem(id) {
  document.getElementById(id).remove();
  calculateTotals();
}

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
    <div class="invoice-preview">
      <style>
        .invoice-preview { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; width: 210mm; margin: 0 auto; background: white; padding: 20mm; }
        .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
        .invoice-header h1 { margin: 0; font-size: 28px; color: #0066cc; }
        .invoice-subtitle { color: #666; font-size: 12px; margin-top: 5px; }
        
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .detail-box { }
        .detail-box h3 { margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #0066cc; text-transform: uppercase; }
        .detail-box p { margin: 5px 0; font-size: 13px; }
        .detail-box strong { color: #333; }
        
        .invoice-metadata { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .meta-item { }
        .meta-item label { font-weight: bold; color: #333; font-size: 12px; }
        .meta-item span { display: block; font-size: 14px; color: #0066cc; font-weight: bold; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table thead { background: #0066cc; color: white; }
        .items-table th { padding: 12px; text-align: left; font-size: 12px; font-weight: bold; }
        .items-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #ddd; }
        .items-table tbody tr:last-child td { border-bottom: none; }
        .amount-col { text-align: right; }
        
        .summary-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px; }
        .summary-box { margin-left: auto; width: 250px; }
        .summary-box .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ddd; }
        .summary-box .total-row { background: #0066cc; color: white; padding: 12px; margin-top: 10px; font-weight: bold; display: flex; justify-content: space-between; border-radius: 3px; font-size: 14px; }
        
        .payment-section { padding: 12px; background: #f5f5f5; border-radius: 5px; font-size: 13px; margin-bottom: 30px; }
        .payment-section label { font-weight: bold; color: #333; }
        
        .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
        .signature-box { text-align: center; }
        .signature-line { border-top: 2px solid #333; margin-bottom: 5px; height: 60px; }
        .signature-label { font-size: 12px; font-weight: bold; color: #333; }
        
        .footer-text { text-align: center; font-size: 11px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
      </style>

      <div class="invoice-header">
        <h1>INVOICE</h1>
        <div class="invoice-subtitle">Professional Business Invoice</div>
      </div>

      <div class="invoice-metadata">
        <div class="meta-item">
          <label>Invoice Number:</label>
          <span>#${String(invoiceNo).padStart(6, '0')}</span>
        </div>
        <div class="meta-item">
          <label>Invoice Date:</label>
          <span>${new Date(invoiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div class="invoice-details">
        <div class="detail-box">
          <h3>📋 From (Seller)</h3>
          <p><strong>${profile.shopName || 'Your Business'}</strong></p>
          <p>${profile.location || 'Business Location'}</p>
          <p>GST: <strong>${profile.gst || 'N/A'}</strong></p>
          <p>Phone: <strong>${profile.phone || 'N/A'}</strong></p>
          <p>Email: <strong>${profile.email || 'N/A'}</strong></p>
        </div>

        <div class="detail-box">
          <h3>👤 Bill To (Customer)</h3>
          <p><strong>${document.getElementById("customerName").value || 'Customer Name'}</strong></p>
          <p>Email: <strong>${document.getElementById("customerEmail").value || 'N/A'}</strong></p>
          <p>Phone: <strong>${document.getElementById("customerPhone").value || 'N/A'}</strong></p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: left;">Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td>${item.desc || 'Item ' + (idx + 1)}</td>
              <td style="text-align: center;">${item.qty}</td>
              <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">₹${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary-section">
        <div></div>
        <div class="summary-box">
          <div class="row">
            <span>Subtotal:</span>
            <strong>₹${subtotal.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>GST (${gstRate}%):</span>
            <strong>₹${gstAmount.toFixed(2)}</strong>
          </div>
          <div class="total-row">
            <span>Total Amount:</span>
            <strong>₹${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div class="payment-section">
        <label>💳 Payment Method:</label>
        <span style="margin-left: 10px; color: #0066cc; font-weight: bold;">
          ${document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Not Specified'}
        </span>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized By</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Customer Signature</div>
        </div>
      </div>

      <div class="footer-text">
        <p>Thank you for your business! This is a computer-generated invoice.</p>
        <p>Terms & Conditions: Payment should be made within 30 days of invoice date.</p>
      </div>
    </div>
  `;

  const previewPanel = document.getElementById("previewPanel");
  previewPanel.innerHTML = preview;
  previewPanel.classList.remove("hidden");
  document.getElementById("printInvoiceBtn").classList.remove("hidden");
  
  // SAVE invoice to localStorage - IMPORTANT!
  try {
    const allInvoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    
    // Store only essential data to avoid exceeding localStorage limit
    const newInvoice = {
      id: invoiceNo,
      date: invoiceDate,
      customer: document.getElementById("customerName").value || "Unnamed Customer",
      amount: total,
      status: "Pending",
      items: items.map(i => ({ desc: i.desc, qty: i.qty, price: i.price })),
      gstRate: gstRate,
      subtotal: subtotal,
      gstAmount: gstAmount,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
    
    // Remove old invoice with same ID if exists
    const filtered = allInvoices.filter(inv => inv.id !== invoiceNo);
    
    // Keep only last 50 invoices to save space
    if (filtered.length >= 50) {
      filtered.pop();
    }
    
    // Add new invoice at the beginning
    filtered.unshift(newInvoice);
    
    // Save
    localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
    
    // Verify it was saved
    const verify = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    console.log("✅ Invoice saved successfully!");
    console.log("Total invoices in storage:", verify.length);
    console.log("New invoice:", newInvoice);
    
    // Show success notification
    showInvoiceSavedNotification(invoiceNo, total);
    
  } catch (error) {
    console.error("Error saving invoice:", error);
    alert("❌ Storage full! Clearing old invoices...");
    
    // Clear old invoices if storage is full
    try {
      localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
      const newInvoice = {
        id: invoiceNo,
        date: invoiceDate,
        customer: document.getElementById("customerName").value || "Unnamed Customer",
        amount: total,
        status: "Pending",
        items: items.map(i => ({ desc: i.desc, qty: i.qty, price: i.price })),
        gstRate: gstRate,
        subtotal: subtotal,
        gstAmount: gstAmount,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
      };
      localStorage.setItem(INVOICES_KEY, JSON.stringify([newInvoice]));
      showInvoiceSavedNotification(invoiceNo, total);
      console.log("Invoice saved after clearing storage");
    } catch (clearError) {
      console.error("Critical error:", clearError);
      alert("Sorry, storage issue. Try clearing browser data.");
    }
  }
  
  calculateTotals();
}

function showInvoiceSavedNotification(invoiceNo, amount) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2E7D32;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 9999;
    font-weight: bold;
    max-width: 350px;
    font-family: Arial, sans-serif;
  `;
  notification.innerHTML = `
    <div style="margin-bottom: 12px; font-size: 16px;">✅ Invoice Created!</div>
    <div style="margin-bottom: 12px; font-size: 13px; font-weight: normal; background: rgba(255,255,255,0.2); padding: 8px; border-radius: 4px;">
      <div><strong>Invoice ID:</strong> #${String(invoiceNo).padStart(6, '0')}</div>
      <div><strong>Amount:</strong> ₹${amount.toLocaleString("en-IN")}</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <button onclick="window.location.href='index.html'; return false;" style="background: white; color: #2E7D32; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📊 Dashboard</button>
      <button onclick="window.location.href='history.html'; return false;" style="background: white; color: #2E7D32; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📋 History</button>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.4s ease';
    setTimeout(() => notification.remove(), 400);
  }, 10000);
}

function printInvoice() {
  // Get the invoice content
  const invoiceContent = document.querySelector('.invoice-preview');
  if (!invoiceContent) {
    alert("Please generate preview first!");
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '', 'height=900,width=900');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Print</title>
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; }
        @page { size: A4; margin: 0; }
        @media print {
          body { margin: 0; padding: 0; }
          * { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      ${invoiceContent.innerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 250);
}

// History page
const historyTableBody = document.getElementById("historyTableBody");
if (historyTableBody) {
  function loadHistoryData() {
    console.log("Loading history data...");
    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    console.log("Loaded invoices for history:", invoices.length, invoices);
    renderHistoryTable(invoices);
    
    // Attach event listeners
    const customerSearchEl = document.getElementById("historyCustomerSearch");
    const dateSearchEl = document.getElementById("historyDateSearch");
    const clearFiltersBtn = document.getElementById("clearHistoryFilters");

    if (customerSearchEl && !customerSearchEl.dataset.listenerAttached) {
      customerSearchEl.addEventListener("input", () => filterHistory(invoices));
      customerSearchEl.dataset.listenerAttached = "true";
    }
    
    if (dateSearchEl && !dateSearchEl.dataset.listenerAttached) {
      dateSearchEl.addEventListener("change", () => filterHistory(invoices));
      dateSearchEl.dataset.listenerAttached = "true";
    }
    
    if (clearFiltersBtn && !clearFiltersBtn.dataset.listenerAttached) {
      clearFiltersBtn.addEventListener("click", () => {
        customerSearchEl.value = "";
        dateSearchEl.value = "";
        renderHistoryTable(invoices);
      });
      clearFiltersBtn.dataset.listenerAttached = "true";
    }
  }
  
  // Load history on initial page load
  loadHistoryData();
  
  // Reload history when page gets focus (user returns from invoice page)
  window.addEventListener('focus', loadHistoryData);
}

function renderHistoryTable(invoices) {
  const historyTableBody = document.getElementById("historyTableBody");
  if (!historyTableBody) return;

  if (invoices.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 30px; color: #999;">
          No invoices found. <a href="invoice.html">Create your first invoice.</a>
        </td>
      </tr>
    `;
    return;
  }

  historyTableBody.innerHTML = invoices.map(inv => `
    <tr>
      <td>#${String(inv.id).padStart(6, '0')}</td>
      <td>${inv.customer}</td>
      <td>${new Date(inv.date).toLocaleDateString()}</td>
      <td>₹${inv.amount.toLocaleString("en-IN")}</td>
      <td>
        <button class="btn-icon btn-info" onclick="alert('View Invoice #${String(inv.id).padStart(6, '0')}')"><i class="fa-solid fa-eye"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteInvoice(${inv.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function filterHistory(allInvoices) {
  const customerSearch = document.getElementById("historyCustomerSearch").value.toLowerCase();
  const dateSearch = document.getElementById("historyDateSearch").value;

  const filtered = allInvoices.filter(inv => {
    const matchCustomer = inv.customer.toLowerCase().includes(customerSearch);
    const matchDate = !dateSearch || inv.date === dateSearch;
    return matchCustomer && matchDate;
  });

  renderHistoryTable(filtered);
}

function deleteInvoice(invoiceId) {
  if (confirm("Are you sure you want to delete this invoice?")) {
    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    const updated = invoices.filter(inv => inv.id !== invoiceId);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
    renderHistoryTable(updated);
    alert("Invoice deleted successfully!");
  }
}
