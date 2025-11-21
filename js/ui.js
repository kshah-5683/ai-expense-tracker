import { monthFormatter } from "./utils.js";

// --- DOM References ---
export const els = {
    trackerView: document.getElementById('main-tracker-view'),
    dashboardView: document.getElementById('main-dashboard-view'),
    trackerTabBtn: document.getElementById('tracker-tab-button'),
    dashboardTabBtn: document.getElementById('dashboard-tab-button'),
    expenseInput: document.getElementById('expense-input'),
    analyzeBtn: document.getElementById('analyze-button'),
    fileUploadBtn: document.getElementById('file-upload-button'),
    fileUploadInput: document.getElementById('file-upload-input'),
    fileUploadSpinner: document.getElementById('file-upload-spinner'),
    fileUploadLabel: document.getElementById('file-upload-label'),
    totalExpense: document.getElementById('total-expense'),
    monthlyBreakdown: document.getElementById('monthly-breakdown'),
    dailyBreakdown: document.getElementById('daily-breakdown'),
    expenseTableBody: document.getElementById('expense-table-body'),
    budgetInput: document.getElementById('budget-input'),
    budgetProgress: document.getElementById('budget-progress'),
    budgetSpentText: document.getElementById('budget-spent-text'),
    budgetRemainingText: document.getElementById('budget-remaining-text'),
    budgetProgressBar: document.getElementById('budget-progress-bar'),
    downloadDropdown: document.getElementById('download-dropdown-button'),
    downloadMenu: document.getElementById('download-menu'),
    downloadPdfBtn: document.getElementById('download-pdf-button'),
    downloadCsvBtn: document.getElementById('download-csv-button'),
    yearFilter: document.getElementById('dashboard-year-filter'),
    monthFilter: document.getElementById('dashboard-month-filter'),
    authModal: document.getElementById('auth-modal'),
    loginBtn: document.getElementById('login-button'),
    userInfoDisplay: document.getElementById('user-info-display'),
    userIdDisplay: document.getElementById('user-id-display'),
    logoutBtn: document.getElementById('logout-button'),
    forgotPasswordLink: document.getElementById('forgot-password-link'),
    loginEmailInput: document.getElementById('login-email'),
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
    editId: document.getElementById('edit-expense-id'),
    editDate: document.getElementById('edit-date'),
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
    errorIndicator: document.getElementById('error-indicator'),
    errorMessage: document.getElementById('error-message'),
    closeErrorBtn: document.getElementById('close-error-button'),
    searchInput: document.getElementById('search-input'),
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
    els.errorMessage.textContent = '';
}

export function toggleAuthModal(show) {
    els.authModal.classList.toggle('hidden', !show);
    if (!show) els.authError.textContent = '';
}

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
        els.expenseTableBody.innerHTML = '<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500 dark:text-gray-400">Log in to see your expenses.</td></tr>';
    }
}

export function switchAuthTab(tab) {
    els.authError.textContent = '';
    if (tab === 'login') {
        els.loginTab.classList.add('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.loginTab.classList.remove('border-transparent', 'text-gray-500');
        els.registerTab.classList.remove('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.registerTab.classList.add('border-transparent', 'text-gray-500');
        els.loginForm.classList.remove('hidden');
        els.registerForm.classList.add('hidden');
    } else {
        els.registerTab.classList.add('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.registerTab.classList.remove('border-transparent', 'text-gray-500');
        els.loginTab.classList.remove('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.loginTab.classList.add('border-transparent', 'text-gray-500');
        els.registerForm.classList.remove('hidden');
        els.loginForm.classList.add('hidden');
    }
}

export function switchMainTab(tab) {
    if (tab === 'tracker') {
        els.trackerTabBtn.classList.add('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.trackerTabBtn.classList.remove('border-transparent', 'text-gray-500');
        els.dashboardTabBtn.classList.remove('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.dashboardTabBtn.classList.add('border-transparent', 'text-gray-500');
        els.trackerView.classList.remove('hidden');
        els.dashboardView.classList.add('hidden');
    } else {
        els.dashboardTabBtn.classList.add('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.dashboardTabBtn.classList.remove('border-transparent', 'text-gray-500');
        els.trackerTabBtn.classList.remove('border-teal-500', 'text-teal-600', 'dark:text-teal-400');
        els.trackerTabBtn.classList.add('border-transparent', 'text-gray-500');
        els.dashboardView.classList.remove('hidden');
        els.trackerView.classList.add('hidden');
    }
}

// --- Modals (Edit/Delete) ---
export function toggleEditModal(show, expense = null) {
    els.editModal.classList.toggle('hidden', !show);
    if (show && expense) {
        els.editId.value = expense.id;
        els.editDate.value = expense.date;
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
        els.expenseTableBody.innerHTML = '<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500 dark:text-gray-400">No expenses logged yet.</td></tr>';
        return;
    }

    expenses.forEach(exp => {
        const tr = document.createElement('tr');
        tr.className = 'expense-row transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">${exp.date}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">${exp.item}</td>
            <td class="py-3 px-4 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    ${exp.category}
                </span>
            </td>
            <td class="py-3 px-4 text-sm text-right font-medium text-pink-600 dark:text-pink-400">
                ₹${(exp.price || 0).toFixed(2)}
            </td>
            <td class="py-3 px-4 text-center flex justify-center space-x-2">
                <button class="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 edit-expense-btn" 
                        data-id="${exp.id}" data-date="${exp.date}" data-item="${exp.item}" 
                        data-category="${exp.category}" data-price="${exp.price}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button class="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 delete-expense-btn" data-id="${exp.id}" data-item="${exp.item}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </td>
        `;
        els.expenseTableBody.appendChild(tr);
    });
}

export function renderSummaries(expenses, monthlyBudget) {
    const monthly = {};
    const daily = {};
    const currentMonthISO = new Date().toISOString().slice(0, 7);
    let currentMonthTotal = 0;

    expenses.forEach(exp => {
        try {
            const date = new Date(exp.date + 'T00:00:00Z');
            if (isNaN(date.getTime())) return;

            const month = date.toISOString().slice(0, 7);
            const day = date.toISOString().slice(0, 10);

            monthly[month] = (monthly[month] || 0) + exp.price;
            daily[day] = (daily[day] || 0) + exp.price;

            if (month === currentMonthISO) {
                currentMonthTotal += exp.price;
            }
        } catch (e) { }
    });

    // --- Update Current Month & Budget UI ---
    els.totalExpense.textContent = `₹${currentMonthTotal.toFixed(2)}`;

    // Remove ALL potential old color classes
    els.totalExpense.classList.remove('text-indigo-600', 'text-green-600', 'text-yellow-500', 'text-red-600', 'text-teal-600', 'text-pink-600', 'dark:text-teal-400', 'dark:text-pink-400');
    els.budgetProgressBar.classList.remove('bg-indigo-600', 'bg-green-600', 'bg-yellow-500', 'bg-red-600', 'bg-teal-500', 'bg-pink-500');

    if (monthlyBudget > 0) {
        const remaining = monthlyBudget - currentMonthTotal;
        const percentage = Math.min((currentMonthTotal / monthlyBudget) * 100, 100);

        els.budgetSpentText.textContent = `Spent: ₹${currentMonthTotal.toFixed(2)}`;
        els.budgetRemainingText.textContent = `Remaining: ₹${remaining.toFixed(2)}`;
        els.budgetProgressBar.style.width = `${percentage}%`;

        // APPLY NEW THEME COLORS
        if (percentage < 75) {
            // Healthy: Teal
            els.totalExpense.classList.add('text-teal-600', 'dark:text-teal-400');
            els.budgetProgressBar.classList.add('bg-teal-500');
        } else if (percentage < 100) {
            // Warning: Yellow (remains same)
            els.totalExpense.classList.add('text-yellow-500');
            els.budgetProgressBar.classList.add('bg-yellow-500');
        } else {
            // Over Budget: Pink
            els.totalExpense.classList.add('text-pink-600', 'dark:text-pink-400');
            els.budgetProgressBar.classList.add('bg-pink-500');
        }
        els.budgetProgress.classList.remove('hidden');
    } else {
        // No budget: Default to Teal
        els.totalExpense.classList.add('text-teal-600', 'dark:text-teal-400');
        els.budgetProgress.classList.add('hidden');
    }

    renderBreakdownList(els.monthlyBreakdown, monthly, monthFormatter);
    renderBreakdownList(els.dailyBreakdown, daily, null, 10);
}

function renderBreakdownList(containerEl, dataMap, formatter = null, limit = Infinity) {
    containerEl.innerHTML = '';
    const sortedKeys = Object.keys(dataMap).sort().reverse();

    if (sortedKeys.length === 0) {
        containerEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No data yet.</p>';
    } else {
        sortedKeys.slice(0, limit).forEach(key => {
            let label = key;
            if (formatter) {
                const dateObj = new Date(key + (key.length === 7 ? '-02T00:00:00Z' : 'T00:00:00Z'));
                label = formatter.format(dateObj);
            }

            const el = document.createElement('div');
            el.className = "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700";
            el.innerHTML = `
                <span class="font-medium text-gray-800 dark:text-gray-200">${label}</span>
                <span class="text-gray-700 dark:text-gray-300">₹${dataMap[key].toFixed(2)}</span>
            `;
            containerEl.appendChild(el);
        });
    }
}

// --- Theme ---
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

export function initTheme() {
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