const API_URL = "http://127.0.0.1:5000/api/expenses/";

// fetch and display expenses
async function fetchExpenses(){
    const response = await fetch(API_URL);
    const expenses = await response.json();

    // grab the <ul> from HTML
    const list = document.getElementById("expense-list");

    // clear it first
    list.innerHTML = "";

    // loop and display each expense
    expenses.forEach((expense) => {
        const li = document.createElement("li");
        li.textContent = `${expense.category} - ${expense.amount} - ${expense.description}`;
        list.appendChild(li);
    });
}

// handle form submission
document.getElementById("expense-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: Number(amount),
      category: category,
      description: description
    })
  });

  // clear form
  e.target.reset();

  // refresh list
  fetchExpenses();
});

// load expenses on page load
fetchExpenses();
