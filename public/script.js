let expenses = [];
let expenseChart;

// Fetch and display expenses
async function loadExpenses() {
    const res = await fetch('/expenses');
    expenses = await res.json();

    renderList();
    renderMonthlySummary();
}

// Render expense list
function renderList() {
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `<span>${exp.name} (${exp.category || 'Uncategorized'})</span> <span>₹${exp.amount}</span>`;
        list.appendChild(li);
    });
}

// Render monthly total and chart
function renderMonthlySummary() {
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date || Date.now());
        return expDate.getMonth() === currentMonth;
    });

    const total = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    document.getElementById('monthly-total').textContent = total.toFixed(2);

    updateLimitProgress(total);

    // Pie chart by category
    const categoryData = {};
    monthlyExpenses.forEach(exp => {
        const category = exp.category || 'Uncategorized';
        categoryData[category] = (categoryData[category] || 0) + parseFloat(exp.amount);
    });

    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff']
            }]
        }
    });
}

// Add new expense
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount, category })
    });

    e.target.reset();
    loadExpenses();
});

// Limit functions
function setLimit() {
    const limit = document.getElementById('limit-input').value;
    localStorage.setItem('monthlyLimit', limit);
    renderMonthlySummary();
}

function updateLimitProgress(total) {
    const limit = parseFloat(localStorage.getItem('monthlyLimit') || 0);
    const progress = document.getElementById('limit-progress');
    if (limit > 0) {
        const percent = Math.min((total / limit) * 100, 100).toFixed(0);
        progress.style.width = percent + '%';
        progress.textContent = percent + '%';
        progress.className = `progress-bar ${percent > 80 ? 'bg-danger' : 'bg-success'}`;
    } else {
        progress.style.width = '0%';
        progress.textContent = '0%';
    }
}

// Load on page start
loadExpenses();

