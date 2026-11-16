const dashboardStats = document.getElementById("dashboardStats");

async function loadDashboard() {
    try {
        const [itemsResponse, claimsResponse] = await Promise.all([
            fetch("/api/my-items"),
            fetch("/api/my-claims")
        ]);

        const items = await itemsResponse.json();
        const claims = await claimsResponse.json();

        if (!itemsResponse.ok) {
            throw new Error(items.message || "Could not load items");
        }

        if (!claimsResponse.ok) {
            throw new Error(claims.message || "Could not load claims");
        }

        const totalItems = items.length;

        const lostItems = items.filter(
            item => item.type === "Lost"
        ).length;

        const foundItems = items.filter(
            item => item.type === "Found"
        ).length;

        const totalClaims = claims.length;

        dashboardStats.innerHTML = `
            <div class="item-card">
                <h3>Total Items Reported</h3>
                <p>${totalItems}</p>
            </div>

            <div class="item-card">
                <h3>Lost Items</h3>
                <p>${lostItems}</p>
            </div>

            <div class="item-card">
                <h3>Found Items</h3>
                <p>${foundItems}</p>
            </div>

            <div class="item-card">
                <h3>Total Claims</h3>
                <p>${totalClaims}</p>
            </div>
        `;

    } catch (error) {
        dashboardStats.textContent = error.message;
    }
}

async function checkLogin() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        loadDashboard();

    } catch (error) {
        window.location.href = "login.html";
    }
}

checkLogin();
