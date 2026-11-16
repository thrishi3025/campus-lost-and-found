const claimsList = document.getElementById("claimsList");

async function loadMyClaims() {
    try {
        const response = await fetch("/api/my-claims");
        const claims = await response.json();

        if (!response.ok) {
            throw new Error(claims.message || "Could not load claims");
        }

        if (claims.length === 0) {
            claimsList.innerHTML = "<p>You have not submitted any claims yet.</p>";
            return;
        }

        claimsList.innerHTML = "";

        claims.forEach(claim => {
            const claimCard = document.createElement("div");
            claimCard.className = "item-card";

            claimCard.innerHTML = `
                <h3>${claim.itemName}</h3>
                <p><strong>Reason:</strong> ${claim.reason}</p>
                <p><strong>Status:</strong> ${claim.status}</p>
                <p><strong>Submitted:</strong> ${new Date(claim.createdAt).toLocaleDateString()}</p>
            `;

            claimsList.appendChild(claimCard);
        });

    } catch (error) {
        claimsList.textContent = error.message;
    }
}

async function checkLogin() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        loadMyClaims();

    } catch (error) {
        window.location.href = "login.html";
    }
}

checkLogin();
