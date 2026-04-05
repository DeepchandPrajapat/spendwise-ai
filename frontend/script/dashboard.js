import { getStatusAndColor } from "./utils.js";
const API_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/";
const INSIGHTS_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/ai-insights";
const BUDGET_URL = "https://spendwise-ai-mn0e.onrender.com/api/budget";

let expenses = [];


async function loadDashboard() {
    const response = await fetch(API_URL);
    expenses = await response.json();

    updateMonthlyCard();
    updateTotalSpending(expenses);
    updateMonthSpending(expenses);
    showRecentExpenses(expenses);
    drawPieChart(expenses);
}

function updateTotalSpending(expenses) {
    let total = 0;

    expenses.forEach((expense) => {
        total += expense.amount;
    });

    document.getElementById("total-spending").textContent = "₹" + total;
}

function updateMonthSpending(expenses) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let total = 0;

    expenses.forEach((expense) => {
        const expenseDate = new Date(expense.created_at);
        if (expenseDate.getMonth() === currentMonth && 
            expenseDate.getFullYear() === currentYear) {
            total += expense.amount;
        }
    });

    document.getElementById("monthly-amount").textContent = "₹" + total;
}

function showRecentExpenses(expenses) {
    const tbody = document.getElementById("recent-expenses");
    tbody.innerHTML = "";

    const recent = expenses.slice(0, 5); // show only top 5 recent expenses

    recent.forEach((expense) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-4 py-3">${expense.category}</td>
            <td class="px-4 py-3">${expense.description || "-"}</td>
            <td class="px-4 py-3">₹${expense.amount}</td>
            <td class="px-4 py-3">${new Date(expense.created_at).toLocaleDateString("en-IN")}</td>
        `;
        tbody.appendChild(row);
    });
}

function drawPieChart(expenses) {
    // step 1 - calculate total per category
    const categoryTotals = {};

    expenses.forEach((expense) => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    // step 2 - separate labels and values
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    // step 3 - draw the chart
    const ctx = document.getElementById("pie-chart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#3B82F6",
                    "#8B5CF6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#EC4899"
                ]
            }]
        }
    });
}

async function fetchInsights() {
    const insightText = document.getElementById("insight-text");
    const recommendationText = document.getElementById("recommendation-text");
    const alertText = document.getElementById("alert-text");

    try {
        const response = await fetch(INSIGHTS_URL);
        const data = await response.json();

        insightText.textContent = data.insight;
        recommendationText.textContent = data.recommendation;
        alertText.textContent = data.alert;

    } catch (error) {
        insightText.textContent = "Could not load insights.";
        recommendationText.textContent = "Please try again.";
        alertText.textContent = "No alerts at this time.";
    }
}

async function fetchBudget(month, year) {
    const res = await fetch(`${BUDGET_URL}?month=${month}&year=${year}`);
    const data = await res.json();
    return data.amount;
}

function openBudgetModal() {
    const modal = document.getElementById("budget-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeBudgetModal() {
    const modal = document.getElementById("budget-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function saveBudget() {
    const amount = document.getElementById("budget-input").value;

    const now = new Date();
    const month = now.getMonth()+1;
    const year = now.getFullYear();

    await fetch(BUDGET_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount: Number(amount),
            month,
            year
        })
    });

    closeBudgetModal();
    updateMonthlyCard();
}

async function updateMonthlyCard() {
    const now = new Date();
    const month = now.getMonth()+1;
    const year = now.getFullYear();

    const budget = await fetchBudget(month, year);

    const monthlyExpenses = expenses.filter(exp => {
        const date = new Date(exp.created_at);
        return date.getMonth()+1 === month && date.getFullYear() === year;
    });

    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const percent = budget > 0 ? (totalSpent / budget) * 100 : 0;

    document.getElementById("monthly-amount").textContent = `₹${totalSpent.toFixed(2)}`;

    document.getElementById("budget-text").textContent =
        budget > 0
            ? `${Math.round(percent)}% of budget used`
            : "Set your monthly budget";

    const bar = document.getElementById("budget-bar");
    bar.style.width = Math.min(percent, 100) + "%";

    const percentValue = Math.round(percent);
    const result = getStatusAndColor(percentValue);

    bar.className = `${result.color} h-2 rounded-full`;
}

// run on page load
loadDashboard();
fetchInsights();
updateMonthlyCard();
