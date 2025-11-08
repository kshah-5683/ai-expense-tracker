import * as UI from './ui.js';
import * as Auth from './auth.js';
import * as Data from './data.js';
import * as Charts from './charts.js';
import * as Export from './export.js';
import { debounce, buildCategoryOverrides } from './utils.js';

// --- Application State ---
// Centralized state management replaces scattered global variables
const state = {
    currentUser: null,
    allExpenses: [],
    monthlyBudget: 0,
    // Store unsubscribe functions to detach listeners on logout
    categoryOverrides: {},
    unsubExpenses: null,
    unsubBudget: null,
    // Temporary storage for the expense currently being deleted
    expenseIdToDelete: null
};

// --- Event Handlers ---

async function handleAnalyzeClick() {
    const rawText = UI.els.expenseInput.value;
    if (!rawText.trim()) {
        UI.showError("Please paste in your expense notes first.");
        return;
    }
    if (!state.currentUser) {
        UI.showError("You must be logged in to analyze expenses.");
        return;
    }

    UI.hideError();
    UI.showLoading(true);

    try {
        const expenses = await Data.analyzeTextWithAI(rawText);
        if (!expenses || expenses.length === 0) {
            throw new Error("The AI could not find any expenses in your notes.");
        }
        // Before saving, check if we have a better category in our memory
        expenses.forEach(exp => {
            const normalizedItem = exp.item.toLowerCase().trim();
            if (state.categoryOverrides[normalizedItem]) {
                // Found a known item! Override the AI's guess with user's preference.
                console.log(`Applying learned category for '${exp.item}': ${state.categoryOverrides[normalizedItem]}`);
                exp.category = state.categoryOverrides[normalizedItem];
            }
        });
        // Save all found expenses to Firestore
        const savePromises = expenses.map(exp => Data.addExpense(state.currentUser.uid, exp));
        await Promise.all(savePromises);
        
        UI.els.expenseInput.value = ''; // Clear input on success
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
        const text = await Data.parseFile(file);
        // Append parsed text to the textarea
        UI.els.expenseInput.value = (UI.els.expenseInput.value + '\n\n' + text).trim();
    } catch (error) {
        console.error("File read error:", error);
        UI.showError(error.message);
    } finally {
        UI.showFileLoading(false);
        // Reset file input so the same file can be selected again if needed
        UI.els.fileUploadInput.value = null;
    }
}

// Debounce budget saving to avoid too many Firestore writes while typing
const handleBudgetInput = debounce((e) => {
    if (!state.currentUser) return;
    const amount = parseFloat(e.target.value) || 0;
    Data.saveBudget(state.currentUser.uid, amount);
    // Note: No need to manually update UI here, the real-time listener will catch the change
}, 1000);

// --- Initialization & State Management ---

// Called whenever new data arrives from Firestore
const updateApplicationData = debounce(() => {
    // 1. Rebuild category learning from history
    state.categoryOverrides = buildCategoryOverrides(state.allExpenses);

    // 2. Update Tracker View
    UI.renderExpenseTable(state.allExpenses);
    UI.renderSummaries(state.allExpenses, state.monthlyBudget);

    // 3. Update Dashboard View
    Charts.updateDashboard(state.allExpenses, UI.els.yearFilter, UI.els.monthFilter);
}, 250);

function setupUserDataListeners(userId) {
    // Detach previous listeners if they exist
    if (state.unsubExpenses) state.unsubExpenses();
    if (state.unsubBudget) state.unsubBudget();

    // Attach new listeners
    state.unsubExpenses = Data.attachExpenseListener(userId, (expenses) => {
        state.allExpenses = expenses;
        updateApplicationData();
    }, (error) => UI.showError("Error syncing data. Please refresh."));

    state.unsubBudget = Data.attachBudgetListener(userId, (amount) => {
        state.monthlyBudget = amount;
        // Only update the input if the user isn't currently typing in it
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
    
    UI.els.budgetInput.value = '';
    updateApplicationData(); // Will render empty states
}

// --- Main Entry Point ---
function init() {
    UI.initTheme();
    // 1. Attach Global Event Listeners
    UI.els.themeToggleBtn.addEventListener('click', UI.toggleTheme);
    UI.els.analyzeBtn.addEventListener('click', handleAnalyzeClick);
    UI.els.closeErrorBtn.addEventListener('click', UI.hideError);
    UI.els.fileUploadBtn.addEventListener('click', () => UI.els.fileUploadInput.click());
    UI.els.fileUploadInput.addEventListener('change', handleFileUpload);
    UI.els.budgetInput.addEventListener('input', handleBudgetInput);

    // Tab Navigation
    UI.els.trackerTabBtn.addEventListener('click', () => UI.switchMainTab('tracker'));
    UI.els.dashboardTabBtn.addEventListener('click', () => {
        UI.switchMainTab('dashboard');
        // Ensure charts resize correctly when becoming visible
        Charts.updateCharts(state.allExpenses, UI.els.yearFilter.value, UI.els.monthFilter.value);
    });

    // Dashboard Filters
    UI.els.yearFilter.addEventListener('change', (e) => {
        // If switching back to "All Years", reset month filter to "all"
        if (e.target.value === 'all') {
            UI.els.monthFilter.value = 'all';
        }
        Charts.updateDashboard(state.allExpenses, UI.els.yearFilter, UI.els.monthFilter);
    });
    UI.els.monthFilter.addEventListener('change', (e) => {
        // If a specific month is chosen, force year to 'all' to avoid conflicting filters
        if (e.target.value !== 'all') UI.els.yearFilter.value = 'all';
        Charts.updateCharts(state.allExpenses, UI.els.yearFilter.value, e.target.value);
    });

    // Download Menu
    UI.els.downloadDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        UI.els.downloadMenu.classList.toggle('hidden');
    });
    window.addEventListener('click', () => UI.els.downloadMenu.classList.add('hidden'));
    UI.els.downloadPdfBtn.addEventListener('click', () => {
        try { Export.generatePDF(state.allExpenses); } catch(e) { UI.showError(e.message); }
    });
    UI.els.downloadCsvBtn.addEventListener('click', () => {
        try { Export.generateCSV(state.allExpenses); } catch(e) { UI.showError(e.message); }
    });

    // Auth Events
    UI.els.loginBtn.addEventListener('click', () => UI.toggleAuthModal(true));
    UI.els.closeAuthModalBtn.addEventListener('click', () => UI.toggleAuthModal(false));
    UI.els.loginTab.addEventListener('click', () => UI.switchAuthTab('login'));
    UI.els.registerTab.addEventListener('click', () => UI.switchAuthTab('register'));
    UI.els.logoutBtn.addEventListener('click', Auth.logoutUser);

    UI.els.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await Auth.loginUser(e.target.email.value, e.target.password.value); }
        catch (error) { UI.els.authError.textContent = error.message; }
    });
    UI.els.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await Auth.registerUser(e.target.email.value, e.target.password.value); }
        catch (error) { UI.els.authError.textContent = error.message; }
    });

    // Edit Modal Events
    UI.els.closeEditModalBtn.addEventListener('click', () => UI.toggleEditModal(false));
    UI.els.cancelEditBtn.addEventListener('click', () => UI.toggleEditModal(false));
    UI.els.editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!state.currentUser) return;
        
        const updatedData = {
            date: UI.els.editDate.value,
            item: UI.els.editItem.value,
            category: UI.els.editCategory.value,
            price: parseFloat(UI.els.editPrice.value) || 0
        };

        try {
            await Data.updateExpense(state.currentUser.uid, UI.els.editId.value, updatedData);
            UI.toggleEditModal(false);
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update expense.");
        }
    });

    // Delete Modal Events
    UI.els.closeDeleteModalBtn.addEventListener('click', () => UI.toggleDeleteModal(false));
    UI.els.deleteCancelBtn.addEventListener('click', () => UI.toggleDeleteModal(false));
    UI.els.deleteConfirmBtn.addEventListener('click', async () => {
        if (state.currentUser && state.expenseIdToDelete) {
            await Data.deleteExpense(state.currentUser.uid, state.expenseIdToDelete);
        }
        UI.toggleDeleteModal(false);
        state.expenseIdToDelete = null;
    });

    // Event Delegation for dynamic table buttons
    UI.els.expenseTableBody.addEventListener('click', (e) => {
        // Handle Delete Click
        const deleteBtn = e.target.closest('.delete-expense-btn');
        if (deleteBtn) {
            state.expenseIdToDelete = deleteBtn.dataset.id;
            UI.toggleDeleteModal(true, deleteBtn.dataset.item);
            return;
        }
        // Handle Edit Click
        const editBtn = e.target.closest('.edit-expense-btn');
        if (editBtn) {
            const expenseData = {
                id: editBtn.dataset.id,
                date: editBtn.dataset.date,
                item: editBtn.dataset.item,
                category: editBtn.dataset.category,
                price: editBtn.dataset.price
            };
            UI.toggleEditModal(true, expenseData);
        }
    });

    // 2. Initialize Auth State Listener (Kickstarts the app)
    Auth.initAuthListener(
        (user) => {
            // On Login
            console.log("User authenticated:", user.uid);
            state.currentUser = user;
            UI.updateAuthUI(user);
            setupUserDataListeners(user.uid);
        },
        () => {
            // On Logout
            console.log("User signed out");
            clearApplicationState();
            UI.updateAuthUI(null);
        }
    );
}

// Start the app when DOM is ready
window.onload = init;