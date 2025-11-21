export function attachExpenseListener(userId, onData, onError) {
    const collectionPath = `artifacts/${APP_ID}/users/${userId}/expenses`;
    const q = query(collection(db, collectionPath));

    return onSnapshot(q, (querySnapshot) => {
        const expenses = [];
        querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
        });
        // Sort descending by date immediately upon receipt
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        onData(expenses);
    }, (error) => {
        console.error("Firestore listener error:", error);
        onError(error);
    });
}

// Real-time listener for the budget document
export function attachBudgetListener(userId, onData, onError) {
    const budgetDocPath = `artifacts/${APP_ID}/users/${userId}/settings/budget`;
    return onSnapshot(doc(db, budgetDocPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            onData(docSnapshot.data().amount || 0);
        } else {
            onData(0);
        }
    }, (error) => {
        console.error("Budget listener error:", error);
        onError(error);
    });
}

export async function addExpense(userId, expenseData) {
    const collectionPath = `artifacts/${APP_ID}/users/${userId}/expenses`;
    await addDoc(collection(db, collectionPath), expenseData);
}

export async function updateExpense(userId, expenseId, expenseData) {
    const docPath = `artifacts/${APP_ID}/users/${userId}/expenses/${expenseId}`;
    await setDoc(doc(db, docPath), expenseData, { merge: true });
}

export async function deleteExpense(userId, expenseId) {
    const docPath = `artifacts/${APP_ID}/users/${userId}/expenses/${expenseId}`;
    await deleteDoc(doc(db, docPath));
}

export async function saveBudget(userId, amount) {
    const docPath = `artifacts/${APP_ID}/users/${userId}/settings/budget`;
    await setDoc(doc(db, docPath), { amount: amount });
}

// --- File Parsing ---

// Ensure PDF worker is set up (moved from original HTML head for modularity)
if (typeof window.pdfjsLib !== 'undefined') {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
}

export async function parseFile(file) {
    if (file.type === 'text/plain') {
        return await file.text();
    } else if (file.type === 'application/pdf') {
        return await readPdfFile(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await readDocxFile(file);
    } else {
        throw new Error("Unsupported file type. Please upload .txt, .pdf, or .docx");
    }
}

async function readPdfFile(file) {
    if (!window.pdfjsLib) throw new Error("PDF library is not loaded.");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        allText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    return allText;
}

async function readDocxFile(file) {
    if (!window.mammoth) throw new Error("Word document library (mammoth.js) is not loaded.");
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
}