const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const responseText = await response.text();
        console.log("Login response:", response.status, responseText);

        const result = JSON.parse(responseText);

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        message.textContent = "Login successful!";

        window.location.href = "index.html";

    } catch (error) {
        message.textContent = error.message || "Login failed";
    }
});
