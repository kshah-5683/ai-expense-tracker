export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
});

// ... existing exports (debounce, monthFormatter) ...

// Scans history to find the user's preferred category for specific items.
// Uses the most recent entry for any given item as the source of truth.
export function buildCategoryOverrides(expensesDescending) {
    const overrides = {};
    // expensesDescending is already sorted newest-first.
    expensesDescending.forEach(exp => {
        if (!exp.item || !exp.category) return;
        const normalizedItem = exp.item.toLowerCase().trim();
        
        // If we haven't seen this item yet, this is the most recent time
        // the user categorized it, so we trust this one.
        if (!overrides[normalizedItem]) {
            overrides[normalizedItem] = exp.category;
        }
    });
    return overrides;
}

export function generateKnowledgeBase(expenses) {
    const uniqueMap = new Map();
    // Iterate newest first (expenses are already sorted by date desc)
    // to ensure we capture the most recent user preference for an item.
    expenses.forEach(exp => {
        if (exp.item && exp.category) {
             const key = exp.item.toLowerCase().trim();
             if (!uniqueMap.has(key)) {
                 // Store the exact original casing for better AI context
                 uniqueMap.set(key, `"${exp.item}": "${exp.category}"`);
             }
        }
    });
    // Join them into a single string to inject into the prompt
    return Array.from(uniqueMap.values()).join(' | ');
}