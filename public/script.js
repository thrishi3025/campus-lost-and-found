const itemForm = document.getElementById("itemForm");
const reportSection = document.getElementById("reportSection");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");
const itemsList = document.getElementById("itemsList");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");

function openForm(type) {
    reportSection.hidden = false;
    document.getElementById("itemType").value = type;
    formTitle.textContent = "Report " + type + " Item";
    message.textContent = "";
    reportSection.scrollIntoView({ behavior: "smooth" });
}

function closeForm() {
    reportSection.hidden = true;
    itemForm.reset();
    message.textContent = "";
}

// Submit a claim for a Found item
async function submitClaim(itemId) {
    const reason = prompt("Why are you claiming this item?");

    if (!reason || !reason.trim()) {
        alert("Please enter a claim reason.");
        return;
    }

    try {
        const response = await fetch("/api/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemId: itemId,
                reason: reason.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Claim submission failed");
        }

        alert("Claim submitted successfully!");
    } catch (error) {
        alert(error.message);
    }
}

// Load items with all filters
async function loadItems() {
    itemsList.innerHTML = "<p>Loading items...</p>";

    try {
        const params = new URLSearchParams();

        params.append("search", searchInput.value.trim());
        params.append("type", typeFilter.value);
        params.append("category", categoryFilter.value);
        params.append("location", locationFilter.value.trim());

        const response = await fetch("/api/items?" + params.toString(), {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load items");
        }

        const items = await response.json();

        itemsList.innerHTML = "";

        if (items.length === 0) {
            itemsList.innerHTML = "<p>No matching items found.</p>";
            return;
        }

        items.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "item-card";

            const title = document.createElement("h3");
            title.textContent = item.itemName;

            const type = document.createElement("p");
            type.textContent = "Type: " + item.type;

            const category = document.createElement("p");
            category.textContent = "Category: " + item.category;

            const description = document.createElement("p");
            description.textContent = "Description: " + item.description;

            const location = document.createElement("p");
            location.textContent = "Location: " + item.location;

            const date = document.createElement("p");
            date.textContent = "Date: " + item.date;

            card.appendChild(title);
            card.appendChild(type);
            card.appendChild(category);
            card.appendChild(description);
            card.appendChild(location);
            card.appendChild(date);

            // Add Claim button only for Found items
            if (item.type === "Found") {
                const claimButton = document.createElement("button");

                claimButton.textContent = "Claim This Item";
                claimButton.className = "claim-btn";

                claimButton.addEventListener("click", function () {
                    submitClaim(item._id);
                });

                card.appendChild(claimButton);
            }

            itemsList.appendChild(card);
        });

    } catch (error) {
        itemsList.innerHTML =
            "<p>Could not load items. Please try again.</p>";

        console.error("Loading error:", error);
    }
}

// Search using all filters
function searchItems() {
    loadItems();
}

// Clear all filters
function resetFilters() {
    searchInput.value = "";
    typeFilter.value = "";
    categoryFilter.value = "";
    locationFilter.value = "";

    loadItems();
}

// Press Enter to search
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchItems();
    }
});

locationFilter.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchItems();
    }
});

// Submit a new Lost or Found report
itemForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(itemForm);
    const item = Object.fromEntries(formData.entries());

    message.textContent = "Submitting report...";

    try {
        const response = await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not save report");
        }

        message.textContent = "Report saved successfully!";

        itemForm.reset();
        resetFilters();

        reportSection.hidden = true;

        document.getElementById("itemsSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        message.textContent =
            error.message || "Could not save report";
    }
});

// Display all items when the page opens
loadItems();

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Logout failed");
            }

            alert("Logged out successfully!");
            window.location.href = "login.html";

        } catch (error) {
            alert(error.message);
        }
    });
}
