export function generateCSV(expenses) {
    if (expenses.length === 0) {
        throw new Error("No expenses to download.");
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Item,Category,Amount\n";
    
    expenses.forEach(exp => {
        const row = [
            exp.date,
            `"${exp.item.replace(/"/g, '""')}"`, // Escape quotes
            exp.category,
            exp.price
        ].join(",");
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function generatePDF(expenses) {
    if (expenses.length === 0) {
        throw new Error("No expenses to download.");
    }
    
    // Rely on the global window.jspdf from the CDN script in HTML
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const tableColumn = ["Date", "Item", "Category", "Amount (₹)"];
    const tableRows = expenses.map(exp => [
        exp.date,
        exp.item,
        exp.category,
        exp.price.toFixed(2)
    ]);
    
    const total = expenses.reduce((sum, exp) => sum + (exp.price || 0), 0);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        didDrawPage: function (data) {
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text("Expense Log", data.settings.margin.left, 15);
        },
        didDrawCell: (data) => {
            // Add total row at the end
            if (data.section === 'body' && data.row.index === expenses.length - 1) {
                 doc.setFontSize(12);
                 doc.setFont('helvetica', 'bold');
                 doc.text('Total:', data.settings.margin.left, data.cursor.y + 10);
                 doc.text(`₹${total.toFixed(2)}`, data.table.columns[3].dataKey, data.cursor.y + 10, { align: 'right' });
            }
        }
    });

    doc.save(`expenses_${new Date().toISOString().slice(0,10)}.pdf`);
}