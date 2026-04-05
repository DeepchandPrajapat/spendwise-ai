import { getStatusAndColor } from "./utils.js";
const BUDGET_HISTORY_API = "https://spendwise-ai-mn0e.onrender.com/api/budget/history";

async function fetchBudgetHistory() {
    const res = await fetch(BUDGET_HISTORY_API);
    const data = await res.json();

    displayBudgetHistory(data);
}

function displayBudgetHistory(budgets) {
    const tbody = document.getElementById("history-table-body");
    tbody.innerHTML = "";

    if (budgets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-6 text-gray-400">
                    No data available
                </td>
            </tr>
        `;
        return;
    }

    budgets.forEach(budget => {
        console.log("Percent:", budget.percent, typeof budget.percent);

        const remaining = budget.budget - budget.spent;

        const percentValue = Math.round(budget.percent);
        const percent = Math.min(percentValue, 100);

        const result = getStatusAndColor(percentValue);

        const status = result.status;
        const statusColor = result.text;

        const row = document.createElement("tr");
        row.classList.add("border-t", "hover:bg-gray-50");

        row.innerHTML = `
            <td class="px-4 py-3">${budget.month_name} ${budget.year}</td>
            <td class="px-4 py-3">₹${budget.budget}</td>
            <td class="px-4 py-3">₹${budget.spent}</td>
            <td class="px-4 py-3">₹${remaining}</td>

            <td class="px-4 py-3 w-40">
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        class="h-2 rounded-full transition-all duration-500"
                        style="width: ${percent}%">
                    </div>
                </div>
            </td>

            <td class="px-4 py-3 font-medium ${statusColor}">
                ${status}
            </td>
        `;

        // 🎨 Progress bar color
        const bar = row.querySelector("div div");
        bar.classList.add(result.color);

        tbody.appendChild(row);
    });
}

fetchBudgetHistory();