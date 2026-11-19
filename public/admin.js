
const adminClaims = document.getElementById("adminClaims");

// Load dashboard statistics
async function loadAdminStats() {
    try {
        const response = await fetch("/api/admin/stats");
        const stats = await response.json();

        if (!response.ok) {
            throw new Error(stats.message || "Could not load statistics");
        }

        document.getElementById("totalItems").textContent = stats.totalItems;
        document.getElementById("lostItems").textContent = stats.lostItems;
        document.getElementById("foundItems").textContent = stats.foundItems;
        document.getElementById("totalClaims").textContent = stats.totalClaims;

    } catch (error) {
        console.error("Statistics error:", error);

        document.getElementById("totalItems").textContent = "Error";
        document.getElementById("lostItems").textContent = "Error";
        document.getElementById("foundItems").textContent = "Error";
        document.getElementById("totalClaims").textContent = "Error";
    }
}

// Load all student claims
async function loadAdminClaims() {
    try {
        const response = await fetch("/api/admin/claims");
        const claims = await response.json();

        if (!response.ok) {
            throw new Error(claims.message || "Could not load claims");
        }

        if (claims.length === 0) {
            adminClaims.innerHTML = "<p>No student claims found.</p>";
            return;
        }

        adminClaims.innerHTML = "";

        claims.forEach(claim => {
            const claimCard = document.createElement("div");
            claimCard.className = "item-card";

            claimCard.innerHTML = `
                <h3>${claim.itemName}</h3>
                <p><strong>Student:</strong> ${claim.studentName}</p>
                <p><strong>Email:</strong> ${claim.studentEmail}</p>
                <p><strong>Reason:</strong> ${claim.reason}</p>
                <p><strong>Status:</strong> ${claim.status}</p>
                <div>
                    <button onclick="updateClaim('${claim._id}', 'Approved')">
                        Approve
                    </button>

                    <button onclick="updateClaim('${claim._id}', 'Rejected')">
                        Reject
                    </button>
                </div>
            `;

            adminClaims.appendChild(claimCard);
        });

    } catch (error) {
        adminClaims.textContent = error.message;
    }
}

// Approve or reject a claim
async function updateClaim(id, status) {
    try {
        const response = await fetch(`/api/admin/claims/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update claim");
        }

        alert(data.message);

        loadAdminClaims();
        loadAdminStats();

    } catch (error) {
        alert(error.message);
    }
}

// Check admin login
async function checkAdminLogin() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();

        if (data.user.role !== "admin") {
            adminClaims.textContent = "Admin access only.";
            return;
        }

        // Load both dashboard sections
        loadAdminStats();
        loadAdminClaims();

    } catch (error) {
        window.location.href = "login.html";
    }
}

checkAdminLogin();
