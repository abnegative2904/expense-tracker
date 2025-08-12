// Ye function backend se expenses fetch karega aur list me show karega
async function loadExpenses() {
    const res = await fetch('/expenses');
    const expenses = await res.json();
    
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.textContent = `${exp.name} - ₹${exp.amount}`;
        list.appendChild(li);
    });
}

// Form submit hone pe backend ko data bhejna
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;

    await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount })
    });

    e.target.reset();
    loadExpenses();
});

// Page load hone par expenses list load karo
loadExpenses();
