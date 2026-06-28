document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    // Fechar os dropdowns se a dona clicar fora deles
    document.addEventListener('click', fecharTodosDropdowns);
});

const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

async function carregarProdutos() {
    const grid = document.getElementById('productGrid');

    try {
        const response = await fetch('http://localhost:5150/api/v1/products');
        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const products = await response.json();
        grid.innerHTML = ''; // Limpa o "Carregando..."

        if (products.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #6B7280;">Nenhum produto cadastrado.</div>`;
            return;
        }

        products.forEach(produto => {
            console.log(produto);
            const card = document.createElement('div');
            // Se o produto estiver inativo, adiciona a classe que deixa ele cinza
            card.className = `product-card ${!produto.isActive ? 'produto-inativo' : ''}`;
            
            // Lógica de visualização de Preço
            let priceHTML = '';
            let textoBotaoPromocao = produto.promotionalIsActive ? "Desativar Promoção" : "Ativar Promoção";
            let textoBotaoProduto = produto.isActive ? "Pausar Produto" : "Ativar Produto";

            if (produto.promotionalIsActive && produto.promotionalPrice > 0) {
                // Riscado + Vermelho
                priceHTML = `
                    <div class="price-container">
                        <span class="preco-riscado">${formatarMoeda.format(produto.price)}</span>
                        <span class="preco-promocao">${formatarMoeda.format(produto.promotionalPrice)}</span>
                    </div>
                `;
            } else {
                // Normal
                priceHTML = `
                    <div class="price-container">
                        <span class="preco-normal">${formatarMoeda.format(produto.price)}</span>
                    </div>
                `;
            }

            // Lógica da Imagem (Mostra ícone se não tiver imagem salva)
            let imagemHTML = produto.image 
                ? `<img src="${produto.image}" alt="${produto.name}" class="product-image">`
                // ? `<img src="http://localhost:5150/api/v1/${produto.image}" alt="${produto.name}" class="product-image">`
                : `<div class="product-image">📦</div>`;

            card.innerHTML = `
                ${imagemHTML}
                
                <button class="action-menu-btn" onclick="toggleDropdown(event, 'dropdown-${produto.idProduct}')">⋮</button>
                
                <div class="action-dropdown" id="dropdown-${produto.idProduct}">
                    <button onclick="editarProduto(${produto.idProduct})">✏️ Editar</button>
                    <button onclick="alternarStatusProduto(${produto.idProduct})">🔄 ${textoBotaoProduto}</button>
                    <button onclick="alternarPromocao(${produto.idProduct})">🏷️ ${textoBotaoPromocao}</button>
                    <button class="danger-text" onclick="excluirProduto(${produto.idProduct}, '${produto.name}')">🗑️ Excluir</button>
                </div>

                <div class="product-card-body">
                    <h3 class="product-name">${produto.name}</h3>
                    ${priceHTML}
                </div>
            `;
            
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro:', error);
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao carregar os dados.</div>`;
    }
}

// === Funções de Controle do Dropdown (Três pontinhos) ===

function toggleDropdown(event, dropdownId) {
    event.stopPropagation(); // Impede que o clique acione o "fecharTodosDropdowns"
    
    const dropdown = document.getElementById(dropdownId);
    const estaAberto = dropdown.classList.contains('show');
    
    // Primeiro fecha todos os que estiverem abertos
    fecharTodosDropdowns();
    
    // Se não estava aberto, abre o que foi clicado
    if (!estaAberto) {
        dropdown.classList.add('show');
    }
}

function fecharTodosDropdowns() {
    const dropdowns = document.querySelectorAll('.action-dropdown');
    dropdowns.forEach(menu => menu.classList.remove('show'));
}

// === Funções de Ação ===

async function excluirProduto(id, nomeProduto) {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nomeProduto}"?`)) return;
    try {
        const response = await fetch(`http://localhost:5150/api/v1/products/${id}`, { method: 'DELETE' });
        if (response.ok) carregarProdutos();
        else alert('Erro ao excluir.');
    } catch (error) { alert('Erro de conexão.'); }
}

function editarProduto(id) {
    alert(`Editar produto ID: ${id}. Lógica futura do modal vai aqui.`);
}

async function alternarStatusProduto(id) {
    // alert(`Aqui o JS fará um PUT /products/${id}/status para ativar/desativar.`);
    const response = await fetch(`http://localhost:5150/api/v1/products/IsActive/${id}`, { method: 'PUT' });

    if (response.ok) {
        alert('Status alterado com sucesso!');
        carregarProdutos()
    } else {
        alert('Erro ao alterar produto.');
    }
}

async function alternarPromocao(id) {
    // alert(`Aqui o JS fará um PUT /products/${id}/promo para ativar/desativar a promoção.`);
    const response = await fetch(`http://localhost:5150/api/v1/products/PromotionalIsActive/${id}`, { method: 'PUT' });

    if (response.ok) {
        alert('Status de Promoção alterado com sucesso!');
        carregarProdutos()
    } else {
        alert('Erro ao alterar Promoção do produto.');
    }
}

// Lógica básica para voltar ao menu
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'dashboard-admin.html'; // Volta para a dashboard inicial
});