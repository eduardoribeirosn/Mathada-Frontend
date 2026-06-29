// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoDashboard();
});

// Adicione isso no topo do seu dashboard.js
const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// ... resto do seu código ...

async function carregarDadosDoDashboard() {
    const totalProductsElement = document.getElementById('totalProducts');
    const recentListElement = document.getElementById('recentList');

    try {
        const response = await fetch('http://localhost:5150/api/v1/products');
        
        if (!response.ok) throw new Error('Falha ao buscar produtos');

        const products = await response.json();

        totalProductsElement.textContent = products.length;
        recentListElement.innerHTML = ''; 

        if (products.length === 0) {
            recentListElement.innerHTML = '<li style="justify-content: center; color: #6B7280;">Nenhum produto cadastrado ainda.</li>';
            return;
        }

        const ultimosProdutos = products.slice(-3).reverse(); 

        ultimosProdutos.forEach(produto => {
            const li = document.createElement('li');
            
            // 1. Lógica da Imagem (Pequena)
            let imagemHTML = produto.image 
                // ? `<img src="${produto.image}" alt="${produto.name}" class="recent-product-thumb">`
                ? `<img src="http://localhost:5150${produto.image}" alt="${produto.name}" class="recent-product-thumb">`
                : `<div class="recent-product-thumb">📦</div>`;

            // 2. Lógica do Preço (Mostra o de promoção se estiver ativo)
            let precoExibido = produto.price;
            let classePreco = 'recent-product-price';
            
            if (produto.promotionalIsActive && produto.promocionalPrice > 0) {
                precoExibido = produto.promocionalPrice;
                classePreco += ' promo'; // Adiciona a classe vermelha
            }

            // 3. Monta a nova estrutura visual
            li.innerHTML = `
                ${imagemHTML}
                <div class="recent-product-name" title="${produto.name}">${produto.name}</div>
                <div class="${classePreco}">${formatarMoeda.format(precoExibido)}</div>
            `;
            
            recentListElement.appendChild(li);
        });

    } catch (error) {
        console.error('Erro:', error);
        totalProductsElement.textContent = "Erro";
        recentListElement.innerHTML = '<li style="justify-content: center; color: red;">Não foi possível carregar os produtos.</li>';
    }
}

// Lógica básica de Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'login.html'; // Volta para o login
});