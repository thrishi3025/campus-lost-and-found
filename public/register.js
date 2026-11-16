
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Creating your account...";

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const responseText = await response.text();

        console.log("Status:", response.status);
        console.log("Response:", responseText);

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                "Server returned HTML instead of JSON. Check the browser console."
            );
        }

        if (!response.ok) {
            throw new Error(result.message || "Registration failed");
        }

        message.textContent = result.message;
        registerForm.reset();

    } catch (error) {
        message.textContent = error.message;
        console.error("Registration error:", error);
    }
});
