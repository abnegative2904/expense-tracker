const apiBase = "/api/expenses"; // Adjust backend route if needed

document.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
    populateMonths();

    document.getElementById("expense-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const expense = {
            amount: document.getElementById("amount").value,
            expense_type: document.getElementById("expense_type").value,
            note: document.getElementById("note").value,
            expense_date: new Date().toISOString().split("T")[0] // Auto date
        };

        await fetch(apiBase, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        e.target.reset();
        loadExpenses();
    });

    document.getElementById("month-filter").addEventListener("change", loadExpenses);
});

async function loadExpenses() {
    const month = document.getElementById("month-filter").value;
    const res = await fetch(`${apiBase}?month=${month}`);
    const expenses = await res.json();

    const list = document.getElementById("expense-list");
    list.innerHTML = "";
    expenses.forEach(exp => {
        const li = document.createElement("li");
        li.textContent = `${exp.expense_date}: ₹${exp.amount} - ${exp.expense_type} (${exp.note || "No note"})`;
        list.appendChild(li);
    });

    renderChart(expenses);
}

function populateMonths() {
    const monthFilter = document.getElementById("month-filter");
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const option = document.createElement("option");
        option.value = date.toISOString().slice(0, 7);
        option.textContent = date.toLocaleString("default", { month: "long", year: "numeric" });
        monthFilter.appendChild(option);
    }
}

function renderChart(expenses) {
    const ctx = document.getElementById("expense-chart").getContext("2d");
    const data = {};
    expenses.forEach(e => {
        data[e.expense_type] = (data[e.expense_type] || 0) + e.amount;
    });

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56",
                    "#4BC0C0", "#9966FF", "#FF9F40",
                    "#E7E9ED", "#FF4444", "#44FF44", "#4444FF"
                ]
            }]
        }
    });
}
