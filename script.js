// script.js — לוגיקת עגלת קניות בסיסית ושמירה ב־localStorage
document.addEventListener("DOMContentLoaded", function () {
  const addButtons = document.querySelectorAll(".add-to-cart");
  const cartButton = document.getElementById("open-cart");
  const cartDialog = document.getElementById("cart-dialog");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const closeCartBtn = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout");
  const contactForm = document.getElementById("contact-form");
  const sendContactBtn = document.getElementById("send-contact");
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");

  // מאחסנים עגלה כ-array של פריטים
  let cart = JSON.parse(localStorage.getItem("pizza_cart") || "[]");

  // עדכון כפתור עגלה במספר פריטים
  function updateCartButton() {
    const qty = cart.reduce((s, p) => s + p.qty, 0);
    cartButton.textContent = `עגלת קניות (${qty})`;
  }

  // שמירה ו־render
  function saveCart() {
    localStorage.setItem("pizza_cart", JSON.stringify(cart));
    updateCartButton();
    renderCartItems();
  }

  // מציג פריטים בדיאלוג
  function renderCartItems() {
    cartItemsEl.innerHTML = "";
    if (cart.length === 0) {
      cartItemsEl.innerHTML = "<p>העגלה ריקה.</p>";
      cartTotalEl.textContent = "₪0";
      return;
    }
    let total = 0;
    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const name = document.createElement("div");
      name.innerHTML = `<strong>${escapeHtml(item.name)}</strong><div style="color: #666; font-size:0.9rem">₪${item.price} x ${item.qty}</div>`;
      const actions = document.createElement("div");
      actions.className = "qty-controls";
      // כפתורי כמות
      const minus = document.createElement("button");
      minus.textContent = "−";
      minus.className = "btn";
      minus.addEventListener("click", () => {
        if (item.qty > 1) item.qty--;
        else cart = cart.filter((i) => i.id !== item.id);
        saveCart();
      });
      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.className = "btn";
      plus.addEventListener("click", () => {
        item.qty++;
        saveCart();
      });
      const remove = document.createElement("button");
      remove.textContent = "הסר";
      remove.className = "btn";
      remove.addEventListener("click", () => {
        cart = cart.filter((i) => i.id !== item.id);
        saveCart();
      });

      actions.appendChild(minus);
      actions.appendChild(plus);
      actions.appendChild(remove);

      row.appendChild(name);
      row.appendChild(actions);
      cartItemsEl.appendChild(row);

      total += item.price * item.qty;
    });
    cartTotalEl.textContent = `₪${total}`;
  }

  // הוספת פריט לעגלה
  function addToCart(id, name, price) {
    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }
    saveCart();
  }

  // הגנת XSS פשוטה
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"'`=\/]/g, function (s) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
      }[s];
    });
  }

  // שליפת פריטים מתוך ה־DOM והוספה לאירועים
  addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".menu-card");
      const id = card.getAttribute("data-id");
      const name = card.getAttribute("data-name");
      const price = parseFloat(card.getAttribute("data-price"));
      addToCart(id, name, price);
      // אנימציה קלה — ניתן להרחיב
      btn.textContent = "נוסף ✓";
      setTimeout(() => (btn.textContent = "הוסף לעגלה"), 900);
    });
  });

  // פתיחת דיאלוג עגלה
  cartButton.addEventListener("click", () => {
    renderCartItems();
    if (typeof cartDialog.showModal === "function") {
      cartDialog.showModal();
    } else {
      // לגיבוי בדפדפנים ישנים
      cartDialog.style.display = "block";
    }
  });

  closeCartBtn.addEventListener("click", () => {
    cartDialog.close();
  });

  clearCartBtn.addEventListener("click", () => {
    if (!confirm("לרוקן את כל העגלה?")) return;
    cart = [];
    saveCart();
  });

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("העגלה ריקה.");
      return;
    }
    // סימולציית תשלום — כאן תשתלב API בפועל
    alert("תודה! ההזמנה נשלחה. צוותנו יצור עמך קשר לאישור ההזמנה.");
    cart = [];
    saveCart();
    cartDialog.close();
  });

  // שמירת טופס יצירת קשר (הדגמה בלבד)
  sendContactBtn.addEventListener("click", () => {
    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    if (!name || !phone) {
      alert("אנא מלא שם ומספר טלפון.");
      return;
    }
    // כאן אפשר לשלוח לשרת עם fetch
    alert(`תודה ${name}! קיבלנו את פנייתך, נחזור אליך בקרוב.`);
    contactForm.reset();
  });

  // שמירת העגלה בעת שגרה
  saveCart();

  // ניווט רספונסיבי
  navToggle &&
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      if (navList.style.display === "flex") navList.style.display = "none";
      else navList.style.display = "flex";
    });

  // סגירת הדיאלוג בעת לחיצה מחוץ לתוכן (גישה עדינה)
  cartDialog.addEventListener("click", (e) => {
    const rect = cartDialog.getBoundingClientRect();
    // אם המשתמש לחץ מחוץ לאזור הדיאלוג — סגור
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) cartDialog.close();
  });
});
