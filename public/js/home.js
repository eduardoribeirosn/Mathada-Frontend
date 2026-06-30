document.addEventListener('DOMContentLoaded', () => {
    carregarPromocoes();
});

const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

async function carregarPromocoes() {
    const grid = document.getElementById('publicProductGrid');

    try {
        const response = await fetch('http://localhost:5150/api/v1/products');
        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const todosProdutos = await response.json();
        
        // Regra de Negócio: Filtra apenas produtos ativos E que estão em promoção
        const produtosEmPromocao = todosProdutos.filter(p => p.isActive && p.promotionalIsActive && p.promotionalPrice > 0);

        grid.innerHTML = '';

        if (produtosEmPromocao.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #6B7280;">Nenhuma promoção ativa no momento. Volte em breve!</p>`;
            return;
        }

        produtosEmPromocao.forEach(produto => {
            // Se o card inteiro é a tag <a>, clicar em qualquer lugar leva para a página
            const card = document.createElement('a');
            card.href = `produto.html?id=${produto.idProduct || produto.id}`;
            card.className = 'public-product-card';

            const imagemSrc = produto.image 
                ? `http://localhost:5150${produto.image}` 
                : 'https://via.placeholder.com/300?text=Sem+Foto';

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imagemSrc}" alt="${produto.name}">
                </div>
                <div class="card-content">
                    <h3>${produto.name}</h3>
                    <p class="price-old">${formatarMoeda.format(produto.price)}</p>
                    <p class="price-promo">${formatarMoeda.format(produto.promotionalPrice)}</p>
                </div>
            `;
            
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro:', error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Não foi possível carregar as ofertas. Tente novamente mais tarde.</p>`;
    }
}