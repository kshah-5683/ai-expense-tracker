import { monthFormatter } from "./utils.js";

// Global chart instances to allow destroying and redrawing
let categoryPieChart = null;
let trendBarChart = null;
let trendYAxisChart = null;

const CHART_COLORS = [
    '#069494', // Teal (Primary)
    '#FFCE1B', // Mustard Yellow (Retro Sunset)
    '#FF69B4', // Bubblegum Pink
    '#ADEBB3', // Mint Green (Lotus Garden)
    '#AD56C4', // Violet (Hydrangea)
    '#FF857A', // Coral (Lotus Garden)
    '#CCFF00', // Electric Lime
    '#BE5103'  // Burnt Orange (Retro Sunset)
];

// Helper to get current theme text color for charts
function getThemeTextColor() {
    const isDark = document.documentElement.classList.contains('dark');
    // Returns Muted Lavender for dark mode, Slate Gray for light mode
    return isDark ? '#A39EBB' : '#64748B';
}

// Updates dropdowns based on available data, then updates charts
export function updateDashboard(allExpenses, yearFilterEl, monthFilterEl) {
    populateFilters(allExpenses, yearFilterEl, monthFilterEl);
    updateCharts(allExpenses, yearFilterEl.value, monthFilterEl.value);
}

// Only updates charts (used when changing filters)
export function updateCharts(allExpenses, selectedYear, selectedMonth) {
    let filtered = allExpenses;
    if (selectedYear !== "all") {
        filtered = filtered.filter(exp => exp.date.startsWith(selectedYear));
    }
    if (selectedMonth !== "all") {
        filtered = filtered.filter(exp => exp.date.startsWith(selectedMonth));
    }

    // Update dashboard total text
    const total = filtered.reduce((sum, exp) => sum + (exp.price || 0), 0);
    document.getElementById('dashboard-total-expense').textContent = `₹${total.toFixed(2)}`;

    renderPieChart(filtered);
    renderTrendChart(filtered, selectedMonth);
}

function populateFilters(expenses, yearFilterEl, monthFilterEl) {
    const currentYearVal = yearFilterEl.value;
    const currentMonthVal = monthFilterEl.value;

    const years = new Set();
    const months = new Set();

    expenses.forEach(exp => {
        try {
            const date = new Date(exp.date + 'T00:00:00Z');
            if (isNaN(date.getTime())) return;
            
            const yearStr = date.getFullYear().toString();
            years.add(yearStr);

            // Only collect months if a specific year is selected
            if (currentYearVal !== 'all' && yearStr === currentYearVal) {
                months.add(date.toISOString().slice(0, 7)); // YYYY-MM
            }
        } catch (e) {}
    });

    // Repopulate Year Filter
    yearFilterEl.innerHTML = '<option value="all">All Years</option>';
    Array.from(years).sort().reverse().forEach(year => {
        yearFilterEl.innerHTML += `<option value="${year}" ${year === currentYearVal ? 'selected' : ''}>${year}</option>`;
    });

    // Handle Month Filter State
    if (currentYearVal === 'all') {
        // DISABLE if "All Years" is selected
        monthFilterEl.innerHTML = '<option value="all">Select a Year First</option>';
        monthFilterEl.disabled = true;
        monthFilterEl.classList.add('bg-gray-100', 'cursor-not-allowed'); // Visual feedback
    } else {
        // ENABLE and populate if a specific year is selected
        monthFilterEl.disabled = false;
        monthFilterEl.classList.remove('bg-gray-100', 'cursor-not-allowed');
        
        monthFilterEl.innerHTML = '<option value="all">All Months</option>';
        Array.from(months).sort().reverse().forEach(month => {
            const dateObj = new Date(month + '-02T00:00:00Z');
            // Just show the month name since the year is already known
            const label = dateObj.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
            monthFilterEl.innerHTML += `<option value="${month}" ${month === currentMonthVal ? 'selected' : ''}>${label}</option>`;
        });
    }
}

function renderPieChart(filteredExpenses) {
    const ctx = document.getElementById('category-pie-chart').getContext('2d');
    const categoryData = {};
    filteredExpenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryData[cat] = (categoryData[cat] || 0) + exp.price;
    });

    const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

    if (categoryPieChart) categoryPieChart.destroy();
    categoryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedCategories.map(e => e[0]),
            datasets: [{
                label: 'Expenses by Category',
                data: sortedCategories.map(e => e[1]),
                backgroundColor: CHART_COLORS,
            }]
        },
        options: {
            responsive: true,
            // Ensures the chart doesn't stretch weirdly when centering
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        color: getThemeTextColor()
                    }
                },
            }
        }
    });
}

function renderTrendChart(filteredExpenses, selectedMonth) {
    const mainCtx = document.getElementById('trend-bar-chart').getContext('2d');
    const axisCtx = document.getElementById('trend-yaxis-overlay').getContext('2d');
    const chartArea = document.getElementById('trend-chart-area');

    // 1. Update Title
    const titleEl = document.getElementById('trend-chart-title');
    if (titleEl) {
        titleEl.textContent = selectedMonth !== 'all' ? 'Daily Expense Trend' : 'Monthly Expense Trend';
    }

    // 2. Process Data
    const trendData = {};
    filteredExpenses.forEach(exp => {
         const key = (selectedMonth !== 'all') ? exp.date : exp.date.slice(0, 7);
         trendData[key] = (trendData[key] || 0) + exp.price;
    });
    const sortedTrend = Object.entries(trendData).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const labels = sortedTrend.map(e => e[0]);
    const dataValues = sortedTrend.map(e => e[1]);

    // 3. Calculate common Y-axis Max
    const maxValue = Math.max(...dataValues, 0);
    const suggestedMax = maxValue * 1.1; // 10% headroom

    // 4. Responsive Scroll Logic
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    if (isSmallScreen) {
        const dataPoints = labels.length;
        const visibleWidth = chartArea.parentElement.clientWidth;
        let requiredWidth = visibleWidth;
        if (selectedMonth === 'all') {
            if (dataPoints > 6) requiredWidth = (visibleWidth / 6) * dataPoints;
        } else {
            if (dataPoints > 7) requiredWidth = (visibleWidth / 7) * dataPoints;
        }
        chartArea.style.width = `${requiredWidth}px`;
    } else {
        chartArea.style.width = '100%';
    }

    // Shared config
    const commonLayout = { padding: { top: 10, bottom: 10, left: 0, right: 0 } };
    const themeTextColor = getThemeTextColor();
    const themeGridColor = document.documentElement.classList.contains('dark') ? '#3F3B52' : '#E2E8F0';

    // --- RENDER 1: FIXED Y-AXIS OVERLAY ---
    if (trendYAxisChart) trendYAxisChart.destroy();
    trendYAxisChart = new Chart(axisCtx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: commonLayout,
            plugins: { legend: { display: false }, title: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
                    afterFit: (scale) => { scale.width = 50; },
                    ticks: { 
                        color: themeTextColor,
                        maxTicksLimit: 6,
                        callback: function(value) {
                             if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
                             return value;
                        }
                    },
                    grid: { drawBorder: false, display: false },
                    // ADDED: Y-Axis Title
                    title: { 
                        display: true, 
                        text: 'Amount (₹)', 
                        color: themeTextColor,
                        font: { size: 10 } // Kept small to fit in the overlay
                    }
                }
            }
        }
    });

    // --- RENDER 2: MAIN SCROLLABLE CHART ---
    if (trendBarChart) trendBarChart.destroy();
    trendBarChart = new Chart(mainCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: '#069494',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: commonLayout,
            plugins: { legend: { display: false }, title: { display: false } },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: selectedMonth !== 'all' ? 'day' : 'month',
                        tooltipFormat: 'PP',
                        // ADDED: Friendly date formats
                        displayFormats: {
                            month: 'MMM yyyy', // e.g., Nov 2025
                            day: 'dd MMM'      // e.g., 08 Nov
                        }
                    },
                    ticks: {
                        color: themeTextColor,
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
                    display: false, // Hide Y labels here (they are in the overlay)
                    grid: { color: themeGridColor, drawBorder: false }
                }
            }
        }
    });
}