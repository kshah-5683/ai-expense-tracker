import { monthFormatter } from "./utils.js";

let categoryPieChart = null;
let trendBarChart = null;
let trendYAxisChart = null;

const CHART_COLORS = [
    '#069494', '#FFCE1B', '#FF69B4', '#ADEBB3', 
    '#AD56C4', '#FF857A', '#CCFF00', '#BE5103'
];

function getThemeTextColor() {
    return document.documentElement.classList.contains('dark') ? '#A39EBB' : '#64748B';
}

// --- MAIN UPDATE FUNCTION ---
export function updateDashboard(allEntries, yearFilterEl, monthFilterEl) {
    // 1. Populate filters using ALL entries (so you can find income entries too)
    populateFilters(allEntries, yearFilterEl, monthFilterEl);
    // 2. Update charts based on current selection
    updateCharts(allEntries, yearFilterEl.value, monthFilterEl.value);
}

// --- FILTER POPULATION ---
function populateFilters(allEntries, yearFilterEl, monthFilterEl) {
    const currentYear = yearFilterEl.value;
    const currentMonth = monthFilterEl.value;
    const years = new Set();
    const months = new Set();

    allEntries.forEach(entry => {
        try {
            if (!entry.date) return; // Skip invalid entries
            const date = new Date(entry.date + 'T00:00:00Z');
            if (isNaN(date.getTime())) return;
            
            const yearStr = date.getFullYear().toString();
            years.add(yearStr);
            if (currentYear === 'all' || yearStr === currentYear) {
                months.add(date.toISOString().slice(0, 7));
            }
        } catch (e) { console.warn("Filter Date Error:", e); }
    });

    yearFilterEl.innerHTML = '<option value="all">All Years</option>';
    Array.from(years).sort().reverse().forEach(year => {
        yearFilterEl.innerHTML += `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
    });

    if (currentYear === 'all') {
        monthFilterEl.innerHTML = '<option value="all">Select a Year First</option>';
        monthFilterEl.disabled = true;
        monthFilterEl.classList.add('bg-gray-100', 'cursor-not-allowed', 'dark:bg-gray-700');
    } else {
        monthFilterEl.disabled = false;
        monthFilterEl.classList.remove('bg-gray-100', 'cursor-not-allowed', 'dark:bg-gray-700');
        monthFilterEl.innerHTML = '<option value="all">All Months</option>';
        Array.from(months).sort().reverse().forEach(month => {
            const dateObj = new Date(month + '-02T00:00:00Z');
            const label = dateObj.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
            monthFilterEl.innerHTML += `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${label}</option>`;
        });
    }
}

// --- CHART UPDATES ---
export function updateCharts(allEntries, selectedYear, selectedMonth) {
    // 1. Filter by Date
    let filtered = allEntries.filter(e => e.date); // Ensure date exists
    if (selectedYear !== "all") filtered = filtered.filter(e => e.date.startsWith(selectedYear));
    if (selectedMonth !== "all") filtered = filtered.filter(e => e.date.startsWith(selectedMonth));

    // 2. Split Data
    const incomeEntries = filtered.filter(e => e.type === 'income');
    const expenseEntries = filtered.filter(e => !e.type || e.type === 'expense');

    // 3. Update Net Balance Display
    const totalIncome = incomeEntries.reduce((sum, e) => sum + (e.price || 0), 0);
    const totalExpense = expenseEntries.reduce((sum, e) => sum + (e.price || 0), 0);
    const netBalance = totalIncome - totalExpense;
    
    const totalEl = document.getElementById('dashboard-total-expense');
    totalEl.textContent = `₹${netBalance.toFixed(2)}`;
    // Dynamic coloring for net balance
    totalEl.className = 'text-3xl font-bold transition-colors ' + 
        (netBalance >= 0 ? 'text-indigo-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400');

    // 4. Render Charts
    renderPieChart(expenseEntries); // Pie = Expenses Only
    renderTrendChart(incomeEntries, expenseEntries, selectedMonth); // Trend = Both
}

function renderPieChart(expenseEntries) {
    const ctx = document.getElementById('category-pie-chart').getContext('2d');
    const dataMap = {};
    expenseEntries.forEach(e => dataMap[e.category || 'Other'] = (dataMap[e.category || 'Other'] || 0) + e.price);
    const sorted = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);

    if (categoryPieChart) categoryPieChart.destroy();
    categoryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sorted.map(e => e[0]),
            datasets: [{ data: sorted.map(e => e[1]), backgroundColor: CHART_COLORS }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: getThemeTextColor() } } }
        }
    });
}

function renderTrendChart(incomeEntries, expenseEntries, selectedMonth) {
    const mainCtx = document.getElementById('trend-bar-chart').getContext('2d');
    const axisCtx = document.getElementById('trend-yaxis-overlay').getContext('2d');
    const chartArea = document.getElementById('trend-chart-area');

    // 1. Prepare Combined Data (grouped by date)
    const trendMap = {};
    [...incomeEntries, ...expenseEntries].forEach(e => {
         const key = (selectedMonth !== 'all') ? e.date : e.date.slice(0, 7);
         if (!trendMap[key]) trendMap[key] = { income: 0, expense: 0 };
         if (e.type === 'income') trendMap[key].income += e.price;
         else trendMap[key].expense += e.price;
    });

    const sortedKeys = Object.keys(trendMap).sort();
    const incomeData = sortedKeys.map(k => trendMap[k].income);
    const expenseData = sortedKeys.map(k => trendMap[k].expense);
    
    // 2. Calculate Max for Y-Axis (looking at both datasets)
    const maxVal = Math.max(...incomeData, ...expenseData, 0) * 1.1;

    // 3. Responsive Scroll
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    if (isSmallScreen) {
        const visibleWidth = chartArea.parentElement.clientWidth;
        const dataPoints = sortedKeys.length;
        // Show 6 months or 7 days max at a time
        const divisor = selectedMonth === 'all' ? 6 : 7;
        if (dataPoints > divisor) {
            chartArea.style.width = `${(visibleWidth / divisor) * dataPoints}px`;
        } else {
             chartArea.style.width = '100%';
        }
    } else {
        chartArea.style.width = '100%';
    }

    // 4. Render
    const commonLayout = { padding: { top: 10, bottom: 10, left: 0, right: 10 } };
    const themeText = getThemeTextColor();

    // Y-Axis Overlay
    if (trendYAxisChart) trendYAxisChart.destroy();
    trendYAxisChart = new Chart(axisCtx, {
        type: 'bar', data: { labels: [], datasets: [] },
        options: {
            responsive: true, maintainAspectRatio: false, layout: { padding: { top: 10, bottom: 10 } },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: {
                    beginAtZero: true, suggestedMax: maxVal, afterFit: (s) => { s.width = 50; },
                    ticks: { color: themeText, maxTicksLimit: 6, callback: v => v >= 1000 ? (v/1000).toFixed(1).replace(/\.0$/, '') + 'k' : v },
                    grid: { display: false }
                }
            }
        }
    });

    // Main Chart (Dual Dataset)
    if (trendBarChart) trendBarChart.destroy();
    trendBarChart = new Chart(mainCtx, {
        type: 'bar',
        data: {
            labels: sortedKeys,
            datasets: [
                { label: 'Income', data: incomeData, backgroundColor: '#22C55E', borderRadius: 4 }, // Green
                { label: 'Expense', data: expenseData, backgroundColor: '#069494', borderRadius: 4 }  // Teal
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, layout: commonLayout,
            plugins: { legend: { display: false } }, // Hide default legend, maybe add custom one later if needed
            scales: {
                x: {
                    type: 'time',
                    time: { unit: selectedMonth !== 'all' ? 'day' : 'month', displayFormats: { month: 'MMM yyyy', day: 'dd MMM' } },
                    ticks: { color: themeText, autoSkip: false, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true, suggestedMax: maxVal, display: false,
                    grid: { color: document.documentElement.classList.contains('dark') ? '#3F3B52' : '#E2E8F0', drawBorder: false }
                }
            }
        }
    });
}