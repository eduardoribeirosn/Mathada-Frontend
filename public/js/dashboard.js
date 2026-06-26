// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoDashboard();
});

async function carregarDadosDoDashboard() {
    const totalProductsElement = document.getElementById('totalProducts');
    const recentListElement = document.getElementById('recentList');

    try {
        // 1. Busca os dados na sua API (Ajuste a porta se necessário)
        const response = await fetch('http://localhost:5150/api/v1/products');
        
        if (!response.ok) {
            throw new Error('Falha ao buscar produtos');
        }

        // Converte a resposta do C# para um Array de Objetos no JS
        const products = await response.json();

        // 2. Atualiza o contador de produtos
        totalProductsElement.textContent = products.length;

        // 3. Renderiza os últimos produtos
        recentListElement.innerHTML = ''; // Limpa o "Carregando..."

        if (products.length === 0) {
            recentListElement.innerHTML = '<li>Nenhum produto cadastrado ainda.</li>';
            return;
        }

        // Pega apenas os 3 últimos produtos do array
        // (Assumindo que a API retorna os mais novos por último. Se não, use .reverse() ou ordene no C#)
        const ultimosProdutos = products.slice(-3).reverse(); 

        // Cria a <li> no HTML para cada produto
        ultimosProdutos.forEach(produto => {
            const li = document.createElement('li');
            // Aqui usamos crases (Template Literals) para misturar string e variáveis facilmente
            li.textContent = `- ${produto.name}`; 
            recentListElement.appendChild(li);
        });

    } catch (error) {
        console.error('Erro:', error);
        totalProductsElement.textContent = "Erro";
        recentListElement.innerHTML = '<li class="error-text">Não foi possível carregar os produtos. Verifique se a API está rodando.</li>';
    }
}

// Lógica básica de Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'login.html'; // Volta para o login
});