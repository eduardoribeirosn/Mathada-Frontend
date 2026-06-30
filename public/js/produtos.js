document.addEventListener('DOMContentLoaded', () => {
    inicializarCatalogo();
});

const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Variável global para guardar os produtos e não precisar chamar a API toda hora
let todosOsProdutos = []; 

async function inicializarCatalogo() {
    await carregarCategorias();
    await buscarProdutos();
    configurarEventosFiltro();
}

async function buscarProdutos() {
    const grid = document.getElementById('catalogoGrid');
    try {
        const response = await fetch('http://localhost:5150/api/v1/products');
        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const dados = await response.json();
        
        // Guarda apenas os ativos na memória
        todosOsProdutos = dados.filter(p => p.isActive);
        
        // Renderiza tudo na primeira vez
        renderizarProdutos(todosOsProdutos);

    } catch (error) {
        console.error(error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Erro ao carregar o catálogo.</p>`;
    }
}

async function carregarCategorias() {
    const container = document.getElementById('listaCategoriasFiltro');
    try {
        const response = await fetch('http://localhost:5150/api/v1/category');
        const categorias = await response.json();
        
        container.innerHTML = `
            <div class="filtro-radio">
                <input type="radio" id="cat_todas" name="categoriaFiltro" value="todas" checked>
                <label for="cat_todas">Todas as Categorias</label>
            </div>
        `;

        categorias.forEach(cat => {
            container.innerHTML += `
                <div class="filtro-radio">
                    <input type="radio" id="cat_${cat.idCategory || cat.id}" name="categoriaFiltro" value="${cat.idCategory || cat.id}">
                    <label for="cat_${cat.idCategory || cat.id}">${cat.name}</label>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Erro ao carregar categorias.</p>';
    }
}

// === MOTOR DE FILTRAGEM ===
function configurarEventosFiltro() {
    const btnFiltrarPreco = document.getElementById('btnFiltrarPreco');
    const btnLimpar = document.getElementById('btnLimparFiltros');
    const radioCategorias = document.getElementById('listaCategoriasFiltro');

    // Escuta mudança nas categorias
    radioCategorias.addEventListener('change', aplicarFiltros);
    
    // Escuta clique no botão de preço
    btnFiltrarPreco.addEventListener('click', aplicarFiltros);

    // Limpar tudo
    btnLimpar.addEventListener('click', () => {
        document.getElementById('cat_todas').checked = true;
        document.getElementById('precoMin').value = '';
        document.getElementById('precoMax').value = '';
        aplicarFiltros();
    });
}

function aplicarFiltros() {
    // 1. Pega a categoria selecionada
    const categoriaSelecionada = document.querySelector('input[name="categoriaFiltro"]:checked').value;
    
    // 2. Pega os preços (converte pra número ou deixa Infinity/0 se estiver vazio)
    const precoMin = parseFloat(document.getElementById('precoMin').value) || 0;
    const precoMax = parseFloat(document.getElementById('precoMax').value) || Infinity;

    // 3. Filtra o Array da memória
    const produtosFiltrados = todosOsProdutos.filter(produto => {
        
        // Define qual preço vamos usar para comparar (o promocional ou o normal)
        const precoReal = (produto.promotionalIsActive && produto.promotionalPrice > 0) 
            ? produto.promotionalPrice 
            : produto.price;

        // Verifica Faixa de Preço
        const passaPreco = precoReal >= precoMin && precoReal <= precoMax;

        // Verifica Categoria (Assumindo que o produto tem um array categoryIds)
        let passaCategoria = true;
        if (categoriaSelecionada !== 'todas') {
            const catIdNum = parseInt(categoriaSelecionada);
            // Verifica se o ID selecionado está dentro do array de categorias do produto
            // passaCategoria = produto.categoryIds && produto.categoryIds.includes(catIdNum);
            passaCategoria = produto.fkCategory == catIdNum;
        }

        return passaPreco && passaCategoria;
    });

    // 4. Mostra o botão de limpar se algum filtro foi usado
    const btnLimpar = document.getElementById('btnLimparFiltros');
    if (categoriaSelecionada !== 'todas' || document.getElementById('precoMin').value || document.getElementById('precoMax').value) {
        btnLimpar.style.display = 'block';
    } else {
        btnLimpar.style.display = 'none';
    }

    // 5. Manda desenhar na tela
    renderizarProdutos(produtosFiltrados);
}

// === DESENHAR NA TELA ===
function renderizarProdutos(arrayProdutos) {
    const grid = document.getElementById('catalogoGrid');
    grid.innerHTML = '';

    if (arrayProdutos.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6B7280;">Nenhum produto encontrado com estes filtros.</p>`;
        return;
    }

    arrayProdutos.forEach(produto => {
        const card = document.createElement('a');
        card.href = `produto.html?id=${produto.idProduct || produto.id}`;
        card.className = 'public-product-card';

        const imagemSrc = produto.image 
            ? `http://localhost:5150${produto.image}` 
            : 'https://via.placeholder.com/300?text=Sem+Foto';

        let priceHTML = '';
        if (produto.promotionalIsActive && produto.promotionalPrice > 0) {
            priceHTML = `
                <p class="price-old">${formatarMoeda.format(produto.price)}</p>
                <p class="price-promo">${formatarMoeda.format(produto.promotionalPrice)}</p>
            `;
        } else {
            priceHTML = `<p class="price-promo" style="color: #1F2937;">${formatarMoeda.format(produto.price)}</p>`;
        }

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${imagemSrc}" alt="${produto.name}">
            </div>
            <div class="card-content">
                <h3>${produto.name}</h3>
                ${priceHTML}
            </div>
        `;
        
        grid.appendChild(card);
    });
}