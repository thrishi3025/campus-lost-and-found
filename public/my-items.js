const myItemsList = document.getElementById("myItemsList");

// Load items reported by the logged-in student
async function loadMyItems() {
    try {
        const response = await fetch("/api/my-items");
        const items = await response.json();

        if (!response.ok) {
            throw new Error(items.message || "Could not load your items");
        }

        if (items.length === 0) {
            myItemsList.innerHTML = "<p>You have not reported any items yet.</p>";
            return;
        }

        myItemsList.innerHTML = "";

        items.forEach(item => {
            const itemCard = document.createElement("div");
            itemCard.className = "item-card";

            itemCard.innerHTML = `
                <h3>${item.itemName}</h3>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Date:</strong> ${item.date}</p>
            `;

            myItemsList.appendChild(itemCard);
        });

    } catch (error) {
        myItemsList.textContent = error.message;
    }
}

async function checkLogin() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        loadMyItems();

    } catch (error) {
        window.location.href = "login.html";
    }
}

checkLogin();
