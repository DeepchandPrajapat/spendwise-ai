const API_URL = "https://spendwise-ai-mn0e.onrender.com/api/expenses/";

//show/hide custom category
document.getElementById("category").addEventListener("change", function() {
    const customDiv = document.getElementById("custom-category-div");
    if (this.value === "Other") {
        customDiv.classList.remove("hidden");
    } else {
        customDiv.classList.add("hidden");
    }
});

 //form submission
document.getElementById("expense-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const customCategory = document.getElementById("custom-category").value; // NEW
    const description = document.getElementById("description").value;

    const finalCategory = category === "Other" ? customCategory : category; // NEW

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: Number(amount),
            category: finalCategory,
            description: description
        })
    });

    window.location.href = "expenses.html";
});