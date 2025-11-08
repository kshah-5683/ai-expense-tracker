import { monthFormatter } from "./utils.js";

// Global chart instances to allow destroying and redrawing
let categoryPieChart = null;
let trendBarChart = null;

const CHART_COLORS = [
    '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#3B82F6', '#22C55E', '#D97706', '#DC2626', '#7C3AED', '#6366F1'
];

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

// js/charts.js

// ... (imports and other code remain the same)

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
                legend: { position: 'right' },
                title: { display: true, text: 'Category Breakdown' }
            }
        }
    });
}

function renderTrendChart(filteredExpenses, selectedMonth) {
    const ctx = document.getElementById('trend-bar-chart').getContext('2d');
    const trendData = {};
    
    filteredExpenses.forEach(exp => {
         // If a specific month is selected, group by day. Otherwise group by month.
         const key = (selectedMonth !== 'all') ? exp.date : exp.date.slice(0, 7);
         trendData[key] = (trendData[key] || 0) + exp.price;
    });

    const sortedTrend = Object.entries(trendData).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    if (trendBarChart) trendBarChart.destroy();
    trendBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTrend.map(e => e[0]),
            datasets: [{
                label: 'Expenses Over Time',
                data: sortedTrend.map(e => e[1]),
                backgroundColor: '#4F46E5',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: selectedMonth !== 'all' ? 'Daily Expense Trend' : 'Monthly Expense Trend' 
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: selectedMonth !== 'all' ? 'day' : 'month',
                        tooltipFormat: selectedMonth !== 'all' ? 'yyyy-MM-dd' : 'yyyy-MM'
                    },
                    title: { display: true, text: 'Date' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount (₹)' }
                }
            }
        }
    });
}