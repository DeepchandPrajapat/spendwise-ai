const API_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/";
let allExpenses = [];

async function fetchExpenses() {
    const response = await fetch(API_URL);
    allExpenses = await response.json();
    displayExpenses(allExpenses);
}

function displayExpenses(expenses) {
    const tbody = document.getElementById("expenses-table-body");
    tbody.innerHTML = "";

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-400">
                    No expenses found!
                </td>
            </tr>
        `;
        return;
    }

    expenses.forEach((expense) => {
        const row = document.createElement("tr");
        row.classList.add("border-t", "border-gray-100", "hover:bg-gray-50", "transition");
        row.innerHTML = `
            <td class="px-4 py-3">${expense.category}</td>
            <td class="px-4 py-3">${expense.description || "-"}</td>
            <td class="px-4 py-3 font-medium text-gray-800">₹${expense.amount}</td>
            <td class="px-4 py-3">${new Date(expense.created_at).toLocaleDateString("en-IN")}</td>
            <td class="px-4 py-3">
                <button onclick="deleteExpense(${expense.id})" 
                    class="text-red-500 hover:text-red-700 transition mr-3">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button onclick="editExpense(${expense.id})"
                    class="text-emerald-500 hover:text-emerald-700 transition">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById("filter-category").addEventListener("change", function() {
    const selected = this.value;

    if (selected === "") {
        displayExpenses(allExpenses);
    } else {
        const filtered = allExpenses.filter((expense) => {
            return expense.category === selected;
        });
        displayExpenses(filtered);
    }
});

async function deleteExpense(id) {
    const confirmed = confirm("Are you sure you want to delete this expense?");
    
    if (!confirmed) return;

    await fetch(API_URL + id, {
        method: "DELETE"
    });

    fetchExpenses();
}

function editExpense(id) {
    const expense = allExpenses.find((e) => e.id === id);

    const tbody = document.getElementById("expenses-table-body");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach((row, index) => {
        if (allExpenses[index].id === id) {
            row.innerHTML = `
                <td class="px-4 py-3">
                    <input type="text" value="${expense.category}" id="edit-category-${id}"
                        class="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                </td>
                <td class="px-4 py-3">
                    <input type="text" value="${expense.description || ""}" id="edit-description-${id}"
                        class="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                </td>
                <td class="px-4 py-3">
                    <input type="number" value="${expense.amount}" id="edit-amount-${id}"
                        class="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                </td>
                <td class="px-4 py-3">${new Date(expense.created_at).toLocaleDateString("en-IN")}</td>
                <td class="px-4 py-3">
                    <button onclick="saveExpense(${id})"
                        class="text-emerald-500 hover:text-emerald-700 transition mr-3">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button onclick="cancelEdit()"
                        class="text-red-500 hover:text-red-700 transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </td>
            `;
        }
    });
}

async function saveExpense(id) {
    const category = document.getElementById(`edit-category-${id}`).value;
    const description = document.getElementById(`edit-description-${id}`).value;
    const amount = document.getElementById(`edit-amount-${id}`).value;

    await fetch(API_URL + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category: category,
            description: description,
            amount: Number(amount)
        })
    });

    fetchExpenses();
}

function cancelEdit() {
    fetchExpenses();
}

fetchExpenses();