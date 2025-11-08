import { monthFormatter } from "./utils.js";

// Centralized repository of all DOM elements used in the app
export const els = {
    // Inputs & Buttons
    expenseInput: document.getElementById('expense-input'),
    analyzeBtn: document.getElementById('analyze-button'),
    fileUploadBtn: document.getElementById('file-upload-button'),
    fileUploadInput: document.getElementById('file-upload-input'),
    fileUploadSpinner: document.getElementById('file-upload-spinner'),
    fileUploadLabel: document.getElementById('file-upload-label'),

    // Error Handling
    errorIndicator: document.getElementById('error-indicator'),
    errorMessage: document.getElementById('error-message'),
    closeErrorBtn: document.getElementById('close-error-button'),

    // Views & Tabs
    mainTrackerView: document.getElementById('main-tracker-view'),
    mainDashboardView: document.getElementById('main-dashboard-view'),
    trackerTabBtn: document.getElementById('tracker-tab-button'),
    dashboardTabBtn: document.getElementById('dashboard-tab-button'),

    // Tracker Data Displays
    totalExpense: document.getElementById('total-expense'),
    monthlyBreakdown: document.getElementById('monthly-breakdown'),
    dailyBreakdown: document.getElementById('daily-breakdown'),
    expenseTableBody: document.getElementById('expense-table-body'),
    allTimeTotal: document.getElementById('all-time-total'),

    // Budget UI
    budgetInput: document.getElementById('budget-input'),
    budgetProgress: document.getElementById('budget-progress'),
    budgetSpentText: document.getElementById('budget-spent-text'),
    budgetRemainingText: document.getElementById('budget-remaining-text'),
    budgetProgressBar: document.getElementById('budget-progress-bar'),

    // Downloads
    downloadDropdown: document.getElementById('download-dropdown-button'),
    downloadMenu: document.getElementById('download-menu'),
    downloadPdfBtn: document.getElementById('download-pdf-button'),
    downloadCsvBtn: document.getElementById('download-csv-button'),

    // Dashboard Filters
    yearFilter: document.getElementById('dashboard-year-filter'),
    monthFilter: document.getElementById('dashboard-month-filter'),

    // Auth & User Info
    loginBtn: document.getElementById('login-button'),
    userInfoDisplay: document.getElementById('user-info-display'),
    userIdDisplay: document.getElementById('user-id-display'),
    logoutBtn: document.getElementById('logout-button'),
    forgotPasswordLink: document.getElementById('forgot-password-link'),
    loginEmailInput: document.getElementById('login-email'),

    // Modals
    authModal: document.getElementById('auth-modal'),
    authError: document.getElementById('auth-error'),
    closeAuthModalBtn: document.getElementById('close-modal-button'),
    loginTab: document.getElementById('login-tab'),
    registerTab: document.getElementById('register-tab'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),

    editModal: document.getElementById('edit-modal'),
    editForm: document.getElementById('edit-form'),
    closeEditModalBtn: document.getElementById('close-edit-modal-button'),
    cancelEditBtn: document.getElementById('cancel-edit-button'),
    // Edit form inputs
    editId: document.getElementById('edit-expense-id'),
    editDate: document.getElementById('edit-date'),
    editType: document.getElementById('edit-type'),
    editItem: document.getElementById('edit-item'),
    editCategory: document.getElementById('edit-category'),
    editPrice: document.getElementById('edit-price'),

    deleteModal: document.getElementById('delete-modal'),
    deleteModalText: document.getElementById('delete-modal-text'),
    deleteConfirmBtn: document.getElementById('delete-confirm-button'),
    deleteCancelBtn: document.getElementById('delete-cancel-button'),
    closeDeleteModalBtn: document.getElementById('close-delete-modal-button'),

    themeToggleBtn: document.getElementById('theme-toggle'),
    themeDarkIcon: document.getElementById('theme-toggle-dark-icon'),
    themeLightIcon: document.getElementById('theme-toggle-light-icon'),

    //credit income 
    incomeDisplay: document.getElementById('income-display'),
    expenseDisplay: document.getElementById('expense-display'),

};

// --- General UI Actions ---
export function showLoading(isLoading) {
    if (isLoading) {
        els.analyzeBtn.disabled = true;
        els.analyzeBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing...`;
    } else {
        els.analyzeBtn.disabled = false;
        els.analyzeBtn.textContent = 'Analyze Expenses';
    }
}

export function showFileLoading(isLoading) {
    if (isLoading) {
        els.fileUploadLabel.classList.add('hidden');
        els.fileUploadSpinner.classList.remove('hidden');
    } else {
        els.fileUploadLabel.classList.remove('hidden');
        els.fileUploadSpinner.classList.add('hidden');
    }
}

export function showError(message) {
    els.errorMessage.textContent = message;
    els.errorIndicator.classList.remove('hidden');
}

export function hideError() {
    els.errorIndicator.classList.add('hidden');
}

// --- Tab Navigation ---
export function switchMainTab(tab) {
    if (tab === 'tracker') {
        els.trackerTabBtn.classList.add('border-indigo-500', 'text-indigo-600');
        els.trackerTabBtn.classList.remove('border-transparent', 'text-gray-500');
        els.dashboardTabBtn.classList.remove('border-indigo-500', 'text-indigo-600');
        els.dashboardTabBtn.classList.add('border-transparent', 'text-gray-500');
        els.mainTrackerView.classList.remove('hidden');
        els.mainDashboardView.classList.add('hidden');
    } else {
        els.dashboardTabBtn.classList.add('border-indigo-500', 'text-indigo-600');
        els.dashboardTabBtn.classList.remove('border-transparent', 'text-gray-500');
        els.trackerTabBtn.classList.remove('border-indigo-500', 'text-indigo-600');
        els.trackerTabBtn.classList.add('border-transparent', 'text-gray-500');
        els.mainDashboardView.classList.remove('hidden');
        els.mainTrackerView.classList.add('hidden');
    }
}

// --- Auth UI ---
export function updateAuthUI(user) {
    if (user) {
        els.userIdDisplay.textContent = user.email;
        els.userInfoDisplay.classList.remove('hidden');
        els.loginBtn.classList.add('hidden');
        toggleAuthModal(false);
        hideError();
    } else {
        els.userInfoDisplay.classList.add('hidden');
        els.loginBtn.classList.remove('hidden');
        toggleAuthModal(true);
        switchMainTab('tracker');
        // Show empty state in table
        els.expenseTableBody.innerHTML = '<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500">Log in to see your expenses.</td></tr>';
    }
}

export function toggleAuthModal(show) {
    els.authModal.classList.toggle('hidden', !show);
    if (!show) els.authError.textContent = '';
}

export function switchAuthTab(tab) {
    els.authError.textContent = '';
    if (tab === 'login') {
        els.loginTab.classList.add('border-indigo-500', 'text-indigo-600');
        els.loginTab.classList.remove('border-transparent', 'text-gray-500');
        els.registerTab.classList.remove('border-indigo-500', 'text-indigo-600');
        els.registerTab.classList.add('border-transparent', 'text-gray-500');
        els.loginForm.classList.remove('hidden');
        els.registerForm.classList.add('hidden');
    } else {
        els.registerTab.classList.add('border-indigo-500', 'text-indigo-600');
        els.registerTab.classList.remove('border-transparent', 'text-gray-500');
        els.loginTab.classList.remove('border-indigo-500', 'text-indigo-600');
        els.loginTab.classList.add('border-transparent', 'text-gray-500');
        els.registerForm.classList.remove('hidden');
        els.loginForm.classList.add('hidden');
    }
}

// --- Modals (Edit/Delete) ---
export function toggleEditModal(show, expense = null) {
    els.editModal.classList.toggle('hidden', !show);
    if (show && expense) {
        els.editId.value = expense.id;
        els.editDate.value = expense.date;
        els.editType.value = expense.type || 'expense';
        els.editItem.value = expense.item;
        els.editCategory.value = expense.category;
        els.editPrice.value = expense.price;
    }
}

export function toggleDeleteModal(show, itemName = '') {
    els.deleteModal.classList.toggle('hidden', !show);
    if (show) {
        els.deleteModalText.textContent = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
    }
}

// --- Main Data Rendering ---
export function renderExpenseTable(expenses) {
    els.expenseTableBody.innerHTML = '';
    if (expenses.length === 0) {
        els.expenseTableBody.innerHTML = '<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500 dark:text-gray-400">No entries logged yet.</td></tr>';
        return;
    }

    expenses.forEach(exp => {
        const isIncome = exp.type === 'income';
        
        // 1. Define color ONLY for the amount
        const amountClass = isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const sign = isIncome ? '+' : '-';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        
        tr.innerHTML = `
            <td class="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">${exp.date}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">${exp.item}</td>
            <td class="py-3 px-4 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    ${exp.category}
                </span>
            </td>
            <td class="py-3 px-4 text-sm text-right font-medium ${amountClass}">
                ${sign}₹${(exp.price || 0).toFixed(2)}
            </td>
            <td class="py-3 px-4 text-center flex justify-center space-x-2">
                <button class="text-gray-400 hover:text-indigo-600 edit-expense-btn" data-id="${exp.id}" data-all='${JSON.stringify(exp)}'>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button class="text-gray-400 hover:text-red-600 delete-expense-btn" data-id="${exp.id}" data-item="${exp.item}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </td>
        `;
        els.expenseTableBody.appendChild(tr);
    });
}

export function renderSummaries(expenses, monthlyBudget) {
    const currentMonthISO = new Date().toISOString().slice(0, 7);
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyMap = {};
    const dailyMap = {};

    // 1. Single loop to calculate all necessary totals
    expenses.forEach(exp => {
        // Handle Income
        if (exp.type === 'income') {
            if (exp.date.startsWith(currentMonthISO)) {
                totalIncome += (exp.price || 0);
            }
            return; // Don't add income to expense breakdowns
        }

        // Handle Expenses
        // A. Current Month Total for Budgeting
        if (exp.date.startsWith(currentMonthISO)) {
            totalExpense += (exp.price || 0);
        }

        // B. Populate Breakdown Lists (All time)
        try {
            const month = exp.date.slice(0, 7); // YYYY-MM
            const day = exp.date.slice(0, 10);   // YYYY-MM-DD
            monthlyMap[month] = (monthlyMap[month] || 0) + exp.price;
            dailyMap[day] = (dailyMap[day] || 0) + exp.price;
        } catch (e) {
            console.warn("Invalid date format:", exp.date);
        }
    });

    // 2. Update Current Month UI
    // Update Mini-Displays if they exist (safe check)
    if (els.incomeDisplay) els.incomeDisplay.textContent = `+₹${totalIncome.toFixed(2)}`;
    if (els.expenseDisplay) els.expenseDisplay.textContent = `-₹${totalExpense.toFixed(2)}`;

    // Update Main Net Balance Display
    const netBalance = totalIncome - totalExpense;
    els.totalExpense.textContent = `₹${netBalance.toFixed(2)}`;
    // Optional: Color the Net Balance based on positivity
    els.totalExpense.classList.remove('text-indigo-600', 'text-green-600', 'text-red-600', 'dark:text-teal-400', 'dark:text-green-400', 'dark:text-red-400');
    if (netBalance >= 0) {
         els.totalExpense.classList.add('text-indigo-600', 'dark:text-teal-400'); // Neutral/Good
    } else {
         els.totalExpense.classList.add('text-red-600', 'dark:text-red-400'); // Negative balance warning
    }

    // 3. Budget Progress Logic (Expenses vs Budget)
    els.budgetProgressBar.classList.remove('bg-indigo-600', 'bg-green-600', 'bg-yellow-500', 'bg-red-600');

    if (monthlyBudget > 0) {
        const remaining = monthlyBudget - totalExpense;
        // Ensure percentage stays between 0 and 100 for CSS width
        const percentage = Math.min(Math.max((totalExpense / monthlyBudget) * 100, 0), 100);

        els.budgetSpentText.textContent = `Spent: ₹${totalExpense.toFixed(2)}`;
        els.budgetRemainingText.textContent = `Remaining: ₹${remaining.toFixed(2)}`;
        els.budgetProgressBar.style.width = `${percentage}%`;

        // Color logic based on percentage spent
        if (percentage < 75) {
            els.budgetProgressBar.classList.add('bg-green-600');
        } else if (percentage < 100) {
            els.budgetProgressBar.classList.add('bg-yellow-500');
        } else {
            els.budgetProgressBar.classList.add('bg-red-600');
        }
        els.budgetProgress.classList.remove('hidden');
    } else {
        els.budgetProgress.classList.add('hidden');
    }

    // 4. Render Side Breakdown Lists
    renderBreakdownList(els.monthlyBreakdown, monthlyMap, monthFormatter);
    renderBreakdownList(els.dailyBreakdown, dailyMap, null, 10);
}

// Helper for rendering the small side lists
function renderBreakdownList(containerEl, dataMap, formatter = null, limit = Infinity) {
    containerEl.innerHTML = '';
    const sortedKeys = Object.keys(dataMap).sort().reverse();

    if (sortedKeys.length === 0) {
        containerEl.innerHTML = '<p class="text-gray-500 text-sm">No data yet.</p>';
    } else {
        sortedKeys.slice(0, limit).forEach(key => {
            let label = key;
            if (formatter) {
                // Create date object, ensuring we don't get timezone shifts by forcing a mid-day time or using UTC explicitly if the input is just YYYY-MM
                const dateObj = new Date(key + (key.length === 7 ? '-02T00:00:00Z' : 'T00:00:00Z'));
                label = formatter.format(dateObj);
            }
            
            const el = document.createElement('div');
            el.className = "flex justify-between items-center py-2 border-b";
            el.innerHTML = `
                <span class="font-medium">${label}</span>
                <span class="text-gray-700">₹${dataMap[key].toFixed(2)}</span>
            `;
            containerEl.appendChild(el);
        });
    }
}

// --- Theme ---
export function toggleTheme() {
    // Toggle class on HTML tag
    document.documentElement.classList.toggle('dark');
    
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

export function initTheme() {
    // Check local storage or system preference
    const userPref = localStorage.getItem('color-theme');
    const systemPrefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (userPref === 'dark' || (!userPref && systemPrefDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    }
}

function updateThemeIcons(isDark) {
    els.themeDarkIcon.classList.toggle('hidden', isDark);
    els.themeLightIcon.classList.toggle('hidden', !isDark);
}