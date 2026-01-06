/* =====================================================
   GOLD LOAN API (LOCAL STORAGE ONLY)
   No backend | No DB
===================================================== */

const STORAGE_KEY = "gold_loans";
const COUNTER_KEY = "gold_loan_counter";

/* ===============================
   Helpers
================================ */

// Read loans
const readLoans = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

// Save loans
const saveLoans = (loans) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
};

// Generate Loan ID (GL-2026-0001)
const generateLoanId = () => {
  const year = new Date().getFullYear();
  let counter = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10);
  counter++;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return `GL-${year}-${String(counter).padStart(4, "0")}`;
};

// Fake delay (UX feel)
const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ===============================
   API Functions
================================ */

const goldLoanApi = {
  /* ---------- GET ALL LOANS ---------- */
  getAllLoans: async () => {
    await delay();
    return {
      success: true,
      data: readLoans()
    };
  },

  /* ---------- GET LOAN BY ID ---------- */
  getLoanById: async (loanId) => {
    await delay();
    const loan = readLoans().find((l) => l.id === loanId);
    return loan
      ? { success: true, data: loan }
      : { success: false, message: "Loan not found" };
  },

  /* ---------- CREATE LOAN ---------- */
  createLoan: async (loanData) => {
    await delay();

    if (!loanData.customerName || !loanData.phoneNumber || !loanData.loanAmount) {
      return { success: false, message: "Missing required fields" };
    }

    const loans = readLoans();

    const newLoan = {
      id: generateLoanId(),
      customerName: loanData.customerName,
      customerId: loanData.customerId || "",
      phoneNumber: loanData.phoneNumber,
      address: loanData.address || "",

      goldItems: loanData.goldItems || [],
      goldRate: loanData.goldRate || 6000,
      loanToValue: loanData.loanToValue || 75,

      loanAmount: Number(loanData.loanAmount),
      interestRate: Number(loanData.interestRate || 2),
      tenure: Number(loanData.tenure || 12),

      dueDate:
        loanData.dueDate ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],

      status: "ACTIVE",
      payments: [],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    loans.push(newLoan);
    saveLoans(loans);

    return { success: true, data: newLoan };
  },

  /* ---------- UPDATE LOAN ---------- */
  updateLoan: async (loanId, updateData) => {
    await delay();
    const loans = readLoans();
    const index = loans.findIndex((l) => l.id === loanId);

    if (index === -1) {
      return { success: false, message: "Loan not found" };
    }

    loans[index] = {
      ...loans[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveLoans(loans);
    return { success: true, data: loans[index] };
  },

  /* ---------- ADD PAYMENT ---------- */
  addPayment: async (loanId, paymentData) => {
    await delay();
    const loans = readLoans();
    const loan = loans.find((l) => l.id === loanId);

    if (!loan) return { success: false, message: "Loan not found" };

    if (!paymentData.amount || paymentData.amount <= 0) {
      return { success: false, message: "Invalid payment amount" };
    }

    loan.payments.push({
      id: `PAY-${Date.now()}`,
      amount: Number(paymentData.amount),
      type: paymentData.type || "Interest",
      mode: paymentData.mode || "Cash",
      date: paymentData.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    });

    loan.updatedAt = new Date().toISOString();
    saveLoans(loans);

    return { success: true, data: loan };
  },

  /* ---------- CLOSE LOAN ---------- */
  closeLoan: async (loanId) => {
    await delay();
    const loans = readLoans();
    const loan = loans.find((l) => l.id === loanId);

    if (!loan) return { success: false, message: "Loan not found" };

    loan.status = "CLOSED";
    loan.closedAt = new Date().toISOString();
    loan.updatedAt = new Date().toISOString();

    saveLoans(loans);
    return { success: true, data: loan };
  },

  /* ---------- DELETE LOAN ---------- */
  deleteLoan: async (loanId) => {
    await delay();
    const loans = readLoans();
    const filtered = loans.filter((l) => l.id !== loanId);

    if (filtered.length === loans.length) {
      return { success: false, message: "Loan not found" };
    }

    saveLoans(filtered);
    return { success: true };
  },

  /* ---------- SEARCH LOANS ---------- */
  searchLoans: async (term) => {
    await delay();
    const q = term.toLowerCase();
    const results = readLoans().filter(
      (l) =>
        l.id.toLowerCase().includes(q) ||
        l.customerName.toLowerCase().includes(q) ||
        l.phoneNumber.includes(q)
    );
    return { success: true, data: results };
  },

  /* ---------- STATS (USED IN CONTEXT) ---------- */
  getLoanStats: async () => {
    await delay();
    const loans = readLoans();
    const active = loans.filter((l) => l.status === "ACTIVE");

    return {
      success: true,
      data: {
        totalLoans: loans.length,
        activeLoans: active.length,
        totalAmount: active.reduce((s, l) => s + l.loanAmount, 0),
        monthlyInterest: active.reduce(
          (s, l) => s + (l.loanAmount * l.interestRate) / 100,
          0
        )
      }
    };
  },

  /* ---------- CLEAR (DEV ONLY) ---------- */
  clearAllLoans: async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNTER_KEY);
    return { success: true };
  }
};

export default goldLoanApi;
