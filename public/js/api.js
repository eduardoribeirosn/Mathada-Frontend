const API_URL = "https://localhost:5150";

async function api(url, options = {}) {
    const response = await fetch(
        `${API_URL}${url}`,
        options
    );

    if (!response.ok) {
        throw new Error("Erro na requisição");
    }

    return response.json();
}