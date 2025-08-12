const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const monthName = document.getElementById("month-name");
const daysLeft = document.getElementById("days-left");
const statusMessage = document.getElementById("status-message");
const progressFill = document.getElementById("progress-fill");
const limitInput = document.getElementById("limit");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyLimit = localStorage.getItem("monthlyLimit") || 0;
let chart;

// Set initial month & days left
const now = new Date();
const month = now.toLocaleString("default", { month: "long" });
monthName.textContent = month;
daysLeft.textContent = daysInMonth(now.getMonth() + 1, now.getFullYear()) - now.getDate();

// Event listener
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    expenses.push({ name, amount, category, date: new Date() });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    form.reset();
    renderExpenses();
});

// Render expenses
function renderExpenses() {
    expenseList.innerHTML = "";
    let totalSpent = 0;
    let categoryTotals = {};

    expenses.forEach(exp => {
        const li = document.createElement("li");
        li.textContent = `${exp.name} - ₹${exp.amount} (${exp.category})`;
        expenseList.appendChild(li);

        totalSpent += exp.amount;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    updateProgress(totalSpent);
    updateStatus(totalSpent);
    renderChart(categoryTotals);
}

// Chart.js Pie Chart
function renderChart(data) {
    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("expenseChart"), {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#e84118', '#00a8ff', '#9c88ff', '#fbc531', '#4cd137']
            }]
        }
    });
}

// Update Progress Bar
function updateProgress(totalSpent) {
    if (monthlyLimit > 0) {
        let percentage = Math.min((totalSpent / monthlyLimit) * 100, 100);
        progressFill.style.width = percentage + "%";
        progressFill.style.background = percentage > 80 ? "red" : "#44bd32";
    }
}

// Update Status Message
function updateStatus(totalSpent) {
    if (!monthlyLimit) {
        statusMessage.textContent = "Set a monthly limit to track spending.";
        return;
    }
    if (totalSpent < monthlyLimit * 0.5) {
        statusMessage.textContent = "✅ Dad can chill now!";
    } else if (totalSpent < monthlyLimit) {
        statusMessage.textContent = "⚠️ Keep an eye on spending.";
    } else {
        statusMessage.textContent = "🚨 Time to call Dad!";
    }
}

// Set Limit
function setLimit() {
    monthlyLimit = parseFloat(limitInput.value);
    localStorage.setItem("monthlyLimit", monthlyLimit);
    renderExpenses();
}

// Days in month helper
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

// Initial load
renderExpenses();
