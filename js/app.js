import * as UI from './ui.js';
import * as Auth from './auth.js';
import * as Data from './data.js';
import * as Charts from './charts.js';
import * as Export from './export.js';
import { debounce, generateKnowledgeBase } from './utils.js';

// --- Application State ---
const state = {
    currentUser: null,
    allExpenses: [],
    monthlyBudget: 0,
    unsubExpenses: null,
    unsubBudget: null,
    expenseIdToDelete: null,
    pendingAttachments: []
};

// --- Event Handlers ---

async function handleAnalyzeClick() {
    const rawText = UI.els.expenseInput.value;
    if (!rawText.trim() && state.pendingAttachments.length === 0) {
        UI.showError("Please paste in your expense notes or upload an image first.");
        return;
    }
    if (!state.currentUser) {
        UI.showError("You must be logged in to analyze expenses.");
        return;
    }

    UI.hideError();
    UI.showLoading(true);

    try {
        const historyContext = generateKnowledgeBase(state.allExpenses);
        const expenses = await Data.analyzeTextWithAI(rawText, historyContext, state.pendingAttachments);

        if (!expenses || expenses.length === 0) {
            throw new Error("The AI could not find any expenses in your notes.");
        }

        const savePromises = expenses.map(exp => Data.addExpense(state.currentUser.uid, exp));
        await Promise.all(savePromises);

        UI.els.expenseInput.value = '';
        state.pendingAttachments = [];
        renderAttachments();
    } catch (error) {
        console.error("Analysis failed:", error);
        UI.showError(`Analysis failed: ${error.message}`);
    } finally {
        UI.showLoading(false);
    }
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    UI.hideError();
    UI.showFileLoading(true);

    try {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result.split(',')[1];
                state.pendingAttachments.push({
                    mimeType: file.type,
                    data: base64String,
                    previewUrl: event.target.result
                });
                renderAttachments();
                UI.showFileLoading(false);
            };
            reader.readAsDataURL(file);
        } else {
            const text = await Data.parseFile(file);
            UI.els.expenseInput.value = (UI.els.expenseInput.value + '\n\n' + text).trim();
            UI.showFileLoading(false);
        }
    } catch (error) {
        console.error("File read error:", error);
        UI.showError(error.message);
        UI.showFileLoading(false);
    } finally {
        UI.els.fileUploadInput.value = null;
    }
}

function renderAttachments() {
    const container = document.getElementById('attachments-preview');
    if (!container) return;

    container.innerHTML = '';
    state.pendingAttachments.forEach((att, index) => {
        const chip = document.createElement('div');
        chip.className = "relative inline-block";

        const img = document.createElement('img');
        img.src = att.previewUrl;
        img.className = "h-20 w-20 object-cover rounded-md border border-gray-300 shadow-sm";

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = "&times;";
        removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none";
        removeBtn.onclick = () => {
            state.pendingAttachments.splice(index, 1);
            renderAttachments();
        };

        chip.appendChild(img);
        chip.appendChild(removeBtn);
        container.appendChild(chip);
    });
}

const handleBudgetInput = debounce((e) => {
    if (!state.currentUser) return;
    const amount = parseFloat(e.target.value) || 0;
    Data.saveBudget(state.currentUser.uid, amount);
}, 1000);

// --- Initialization & State Management ---

const updateApplicationData = debounce(() => {
    UI.renderExpenseTable(state.allExpenses);
    UI.renderSummaries(state.allExpenses, state.monthlyBudget);
    Charts.updateDashboard(state.allExpenses, UI.els.yearFilter, UI.els.monthFilter);
}, 250);

function setupUserDataListeners(userId) {
    if (state.unsubExpenses) state.unsubExpenses();
    if (state.unsubBudget) state.unsubBudget();

    state.unsubExpenses = Data.attachExpenseListener(userId, (expenses) => {
        state.allExpenses = expenses;
        updateApplicationData();
    }, (error) => UI.showError("Error syncing data. Please refresh."));

    state.unsubBudget = Data.attachBudgetListener(userId, (amount) => {
        state.monthlyBudget = amount;
        if (document.activeElement !== UI.els.budgetInput) {
            UI.els.budgetInput.value = amount > 0 ? amount : '';
        }
        updateApplicationData();
    }, (error) => console.error("Could not load budget", error));
}

function clearApplicationState() {
    state.currentUser = null;
    state.allExpenses = [];
    state.monthlyBudget = 0;
    if (state.unsubExpenses) state.unsubExpenses();
    if (state.unsubBudget) state.unsubBudget();

    if (UI.els.budgetInput) {
        UI.els.budgetInput.value = '';
    }
    updateApplicationData();
}

// --- Main Entry Point ---
function init() {
    UI.initTheme();

    if (UI.els.themeToggleBtn) {
        UI.els.themeToggleBtn.addEventListener('click', () => {
            UI.toggleTheme();
            Charts.updateCharts(state.allExpenses, UI.els.yearFilter?.value, UI.els.monthFilter?.value);
        });
    }

    if (UI.els.analyzeBtn) {
        UI.els.analyzeBtn.addEventListener('click', handleAnalyzeClick);
    }

    if (UI.els.closeErrorBtn) {
        UI.els.closeErrorBtn.addEventListener('click', UI.hideError);
    }

    if (UI.els.fileUploadBtn && UI.els.fileUploadInput) {
        UI.els.fileUploadBtn.addEventListener('click', () => UI.els.fileUploadInput.click());
        UI.els.fileUploadInput.addEventListener('change', handleFileUpload);
    }

    if (UI.els.budgetInput) {
        UI.els.budgetInput.addEventListener('input', handleBudgetInput);
    }

    if (UI.els.trackerTabBtn) {
        UI.els.trackerTabBtn.addEventListener('click', () => UI.switchMainTab('tracker'));
    }

    if (UI.els.dashboardTabBtn) {
        UI.els.dashboardTabBtn.addEventListener('click', () => {
            UI.switchMainTab('dashboard');
            Charts.updateCharts(state.allExpenses, UI.els.yearFilter?.value, UI.els.monthFilter?.value);
        });
    }

    if (UI.els.yearFilter) {
        UI.els.yearFilter.addEventListener('change', (e) => {
            if (e.target.value === 'all' && UI.els.monthFilter) {
                UI.els.monthFilter.value = 'all';
            }
            Charts.updateDashboard(state.allExpenses, UI.els.yearFilter, UI.els.monthFilter);
        });
    }

    if (UI.els.monthFilter) {
        UI.els.monthFilter.addEventListener('change', (e) => {
            if (e.target.value !== 'all' && UI.els.yearFilter) {
                UI.els.yearFilter.value = 'all';
            }
            Charts.updateCharts(state.allExpenses, UI.els.yearFilter?.value, e.target.value);
        });
    }

    if (UI.els.downloadDropdown && UI.els.downloadMenu) {
        UI.els.downloadDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.els.downloadMenu.classList.toggle('hidden');
        });
        window.addEventListener('click', () => UI.els.downloadMenu.classList.add('hidden'));
    }

    if (UI.els.downloadPdfBtn) {
        UI.els.downloadPdfBtn.addEventListener('click', () => {
            try { Export.generatePDF(state.allExpenses); } catch (e) { UI.showError(e.message); }
        });
    }

    if (UI.els.downloadCsvBtn) {
        UI.els.downloadCsvBtn.addEventListener('click', () => {
            try { Export.generateCSV(state.allExpenses); } catch (e) { UI.showError(e.message); }
        });
    }

    if (UI.els.loginBtn) {
        UI.els.loginBtn.addEventListener('click', () => UI.toggleAuthModal(true));
    }

    if (UI.els.closeAuthModalBtn) {
        UI.els.closeAuthModalBtn.addEventListener('click', () => UI.toggleAuthModal(false));
    }

    if (UI.els.loginTab) {
        UI.els.loginTab.addEventListener('click', () => UI.switchAuthTab('login'));
    }

    if (UI.els.registerTab) {
        UI.els.registerTab.addEventListener('click', () => UI.switchAuthTab('register'));
    }

    if (UI.els.logoutBtn) {
        UI.els.logoutBtn.addEventListener('click', Auth.logoutUser);
    }

    if (UI.els.loginForm) {
        UI.els.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try { await Auth.loginUser(e.target.email.value, e.target.password.value); }
            catch (error) { if (UI.els.authError) UI.els.authError.textContent = error.message; }
        });
    }

    if (UI.els.registerForm) {
        UI.els.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try { await Auth.registerUser(e.target.email.value, e.target.password.value); }
            catch (error) { if (UI.els.authError) UI.els.authError.textContent = error.message; }
        });
    }

    if (UI.els.forgotPasswordLink) {
        UI.els.forgotPasswordLink.addEventListener('click', async () => {
            const email = UI.els.loginEmailInput?.value.trim();
            if (!email) {
                if (UI.els.authError) UI.els.authError.textContent = "Please enter your email address first.";
                return;
            }
            try {
                await Auth.sendPasswordReset(email);
                alert(`Password reset email sent to ${email}. Check your inbox.`);
            } catch (error) {
                console.error("Reset failed:", error);
                if (UI.els.authError) UI.els.authError.textContent = error.message;
            }
        });
    }

    if (UI.els.closeEditModalBtn) {
        UI.els.closeEditModalBtn.addEventListener('click', () => UI.toggleEditModal(false));
    }

    if (UI.els.cancelEditBtn) {
        UI.els.cancelEditBtn.addEventListener('click', () => UI.toggleEditModal(false));
    }

    if (UI.els.editForm) {
        UI.els.editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const updatedData = {
                date: UI.els.editDate?.value,
                item: UI.els.editItem?.value,
                category: UI.els.editCategory?.value,
                price: parseFloat(UI.els.editPrice?.value) || 0
            };

            try {
                await Data.updateExpense(state.currentUser.uid, UI.els.editId?.value, updatedData);
                UI.toggleEditModal(false);
            } catch (error) {
                console.error("Update failed:", error);
                alert("Failed to update expense.");
            }
        });
    }

    // Search Functionality - FIXED
    if (UI.els.searchInput) {
        UI.els.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (!query) {
                UI.renderExpenseTable(state.allExpenses);
                return;
            }

            if (window.Fuse) {
                const fuse = new window.Fuse(state.allExpenses, {
                    keys: ['item', 'category'],
                    threshold: 0.4
                });

                const result = fuse.search(query);
                // FIX: Fuse.js returns { item: actualObject }, so we extract .item
                const filteredExpenses = result.map(r => r.item);
                UI.renderExpenseTable(filteredExpenses);
            } else {
                // Fallback if Fuse.js not loaded
                const filtered = state.allExpenses.filter(exp =>
                    exp.item.toLowerCase().includes(query.toLowerCase()) ||
                    exp.category.toLowerCase().includes(query.toLowerCase())
                );
                UI.renderExpenseTable(filtered);
            }
        });
    }
    // Handle monthly breakdown item clicks
    document.addEventListener('click', (e) => {
        const monthlyItem = e.target.closest('.monthly-breakdown-item');
        if (monthlyItem) {
            const year = monthlyItem.getAttribute('data-year');
            const month = monthlyItem.getAttribute('data-month');
            if (year && month) {
                UI.navigateToDashboardWithFilters(year, month);
            }
        }
    });

    // Setup Auth Listener
    Auth.initAuthListener((user) => {
        state.currentUser = user;
        UI.updateAuthUI(user);
        if (user) {
            setupUserDataListeners(user.uid);
        } else {
            clearApplicationState();
        }
    });
}

window.onload = init;