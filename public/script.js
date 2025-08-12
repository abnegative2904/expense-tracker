document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("expense-form");
    const amountInput = document.getElementById("amount");
    const expenseTypeInput = document.getElementById("expense_type");
    const noteInput = document.getElementById("note");
    const tableBody = document.querySelector("#expense-table tbody");
    const monthSelect = document.getElementById("month-select");
    const ctx = document.getElementById("expense-chart").getContext("2d");
    let chart;

    // Load months into dropdown
    function populateMonths() {
        const now = new Date();
        monthSelect.innerHTML = "";
        for (let i = 0; i < 12; i++) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const option = document.createElement("option");
            option.value = month.toISOString().slice(0, 7);
            option.textContent = month.toLocaleString('default', { month: 'long', year: 'numeric' });
            monthSelect.appendChild(option);
        }
    }

    populateMonths();

    // Fetch expenses by month
    async function loadExpenses(month) {
        const res = await fetch(`/expenses?month=${month}`);
        const expenses = await res.json();
        renderTable(expenses);
        renderChart(expenses);
    }

    // Render table
    function renderTable(expenses) {
        tableBody.innerHTML = "";
        expenses.forEach(exp => {
            const row = `<tr>
                <td>₹${exp.amount}</td>
                <td>${exp.expense_type}</td>
                <td>${exp.note || ""}</td>
                <td>${new Date(exp.expense_date).toLocaleDateString()}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    // Render pie chart
    function renderChart(expenses) {
        const typeTotals = {};
        expenses.forEach(exp => {
            typeTotals[exp.expense_type] = (typeTotals[exp.expense_type] || 0) + parseFloat(exp.amount);
        });

        const labels = Object.keys(typeTotals);
        const data = Object.values(typeTotals);

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4CAF50','#9966FF']
                }]
            }
        });
    }

    // Add expense
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amount = amountInput.value;
        const expense_type = expenseTypeInput.value;
        const note = noteInput.value;

        if (!amount || !expense_type) return alert("Please fill all required fields");

        await fetch("/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, expense_type, note })
        });

        amountInput.value = "";
        expenseTypeInput.value = "";
        noteInput.value = "";

        loadExpenses(monthSelect.value);
    });

    monthSelect.addEventListener("change", () => {
        loadExpenses(monthSelect.value);
    });

    loadExpenses(monthSelect.value);
});
