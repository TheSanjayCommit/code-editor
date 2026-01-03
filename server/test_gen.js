async function test() {
    try {
        console.log("Sending request...");
        const res = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: "generate a signup page" })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed Status:", res.status);
            console.error("Error Data:", data);
        } else {
            console.log("Success:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

test();
