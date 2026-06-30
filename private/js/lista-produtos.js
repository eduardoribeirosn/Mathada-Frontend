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
                // ? `<img src="${produto.image}" alt="${produto.name}" class="product-image">`
                ? `<img src="http://localhost:5150${produto.image}" alt="${produto.name}" class="product-image">`
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
    // Redireciona para a nova tela, passando o ID na URL
    window.location.href = `editar-produto.html?id=${id}`;
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

// === Lógica do Modal de Categorias ===

const modalCategoria = document.getElementById('modalCategoria');
const inputNomeCategoria = document.getElementById('nomeCategoria');
const erroCategoria = document.getElementById('erroCategoria');

function abrirModalCategoria() {
    modalCategoria.classList.add('show');
    inputNomeCategoria.value = ''; // Limpa o campo sempre que abrir
    erroCategoria.style.display = 'none';
    inputNomeCategoria.focus(); // Coloca o cursor piscando direto no input
}

function fecharModalCategoria() {
    modalCategoria.classList.remove('show');
}

// Fecha o modal se clicar fora da caixinha branca
modalCategoria.addEventListener('click', function(event) {
    if (event.target === modalCategoria) {
        fecharModalCategoria();
    }
});

async function salvarCategoria() {
    const nome = inputNomeCategoria.value.trim();
    const btnSalvar = document.getElementById('btnSalvarCategoria');

    if (!nome) {
        erroCategoria.textContent = 'O nome da categoria é obrigatório.';
        erroCategoria.style.display = 'block';
        return;
    }

    // Feedback visual de carregamento
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';
    erroCategoria.style.display = 'none';

    try {
        // Envia o POST para a sua API C# criar a categoria no MySQL
        const response = await fetch('http://localhost:5150/api/v1/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nome })
        });

        if (response.ok) {
            fecharModalCategoria();
            alert(`Categoria "${nome}" criada com sucesso!`);
            // Como estamos na tela de produtos, não precisamos recarregar nada aqui, 
            // mas o aviso dá a certeza de que funcionou.
        } else {
            erroCategoria.textContent = 'Erro ao salvar categoria no banco.';
            erroCategoria.style.display = 'block';
        }
    } catch (error) {
        erroCategoria.textContent = 'Erro de conexão com a API.';
        erroCategoria.style.display = 'block';
    } finally {
        // Volta o botão ao normal
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar';
    }
}

function verifyLogin() {
    let item = sessionStorage.getItem("NAME_USER")
    if (!item) {
        window.location.href = 'login.html'
        setTimeout(() => {
            alert("Para acessar esta tela, você deve estar logado!")
        }, 50);
    }
}