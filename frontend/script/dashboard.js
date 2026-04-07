
const API_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/";
const INSIGHTS_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/ai-insights";
const BUDGET_URL = "https://spendwise-ai-mn0e.onrender.com/api/budget";

let expenses = [];


async function loadDashboard() {
    const response = await fetch(API_URL);
    expenses = await response.json();

    updateMonthlyCard();
    updateTotalSpending(expenses);
    drawSparkline(expenses);
    updateMonthSpending(expenses);
    showRecentExpenses(expenses);
    drawPieChart(expenses);
}

function updateTotalSpending(expenses) {
    let total = 0;

    expenses.forEach((expense) => {
        total += expense.amount;
    });

    animateValue("total-spending", 0, total, 1700);
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

    const canvas = document.getElementById("pie-chart");
    const parent = canvas.parentElement;

    //  Current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();


    const monthlyExpenses = expenses.filter(expense => {
        if (!expense.created_at) return false;

        const date = new Date(expense.created_at);

        return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        );
    });

    // Calculate totals
    const categoryTotals = {};

    monthlyExpenses.forEach(expense => {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    // Handle empty state
    if (labels.length === 0) {
        parent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-56 text-gray-400 text-sm">
                <p>No expenses this month</p>
            </div>
        `;
        return;
    }

    // Destroy old chart if exists
    if (window.pieChartInstance) {
        window.pieChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");

// chart creation
    window.pieChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#2D9CDB", // blue
                    "#EB5E8A", // pink
                    "#6C6FBF",  // indigo                    
                    "#2FBF9F", // teal green
                    "#8BC34A", // light green
                    "#F5A623", // orange-yellow
                    "#FF6F3C", // orange
                    "#9B59B6"// purple
                ],
                borderColor: "#ffffff", 
                borderWidth: 1,        
                hoverOffset: 8          
            }]
        },
        options: {
            cutout: "40%",

            devicePixelRatio:2, 

            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "rectRounded",

                        font: {
                            size: 14,
                            weight: "600",
                            family: "Inter, sans-serif"
                        },

                        color: "#1F2937"
                    }
                }
            },

            responsive: true,
            maintainAspectRatio: false
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

function updateMonthTitle() {
    const now = new Date();

    const monthName = now.toLocaleString("en-IN", { month: "long" });

    const title = document.getElementById("month-title");
    if (title) {
        title.textContent = `Monthly Spending (${monthName})`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector("main");
    const btn = document.getElementById("toggle-btn");

    const isHidden = sidebar.classList.contains("hidden");

    if (!isHidden) {
        // Sidebar is OPEN → adjust layout
        main.classList.add("ml-56");
        btn.classList.add("bg-emerald-100");
    } else {
        // Sidebar is CLOSED
        main.classList.remove("ml-56");
        btn.classList.remove("bg-emerald-100");
    }
});

function animateValue(id, start, end, duration) {
    let range = end - start;
    let current = start;
    let increment = end / (duration / 16);

    const obj = document.getElementById(id);

    const timer = setInterval(() => {
        current += increment;

        if (current >= end) {
            current = end;
            clearInterval(timer);
        }

        obj.textContent = "₹" + Math.floor(current);
    }, 16);
}

function getLast7DaysData(expenses) {
    const today = new Date();

    const days = [];

    // create last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);

        const key = d.toISOString().split("T")[0];
        days.push({ key, total: 0 });
    }

    // fill totals
    expenses.forEach(e => {
        if (!e.created_at) return;

        const date = new Date(e.created_at).toISOString().split("T")[0];

        const day = days.find(d => d.key === date);
        if (day) {
            day.total += e.amount;
        }
    });

    return {
        labels: days.map(d => d.key),
        values: days.map(d => d.total)
    };
}

function drawSparkline(expenses) {
    const canvas = document.getElementById("sparkline-chart");
    const ctx = canvas.getContext("2d");

    if (window.sparklineChart) {
        window.sparklineChart.destroy();
    }

    const { labels, values } = getLast7DaysData(expenses);

    // 🔥 gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

    window.sparklineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                data: values,
                borderColor: "#10B981",
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

updateGreeting();
loadDashboard();
updateMonthTitle();
fetchInsights();
updateMonthlyCard();