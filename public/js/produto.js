document.addEventListener('DOMContentLoaded', () => {
    carregarDetalhesProduto();
});

const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

async function carregarDetalhesProduto() {
    const container = document.getElementById('productContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `<h2 style="text-align:center; padding: 50px;">Produto não encontrado.</h2>`;
        return;
    }

    try {
        const response = await fetch(`http://localhost:5150/api/v1/products/${productId}`);
        if (!response.ok) throw new Error('Produto não existe');

        const produto = await response.json();

        const imagemSrc = produto.image 
            ? `http://localhost:5150${produto.image}` 
            : 'https://via.placeholder.com/500?text=Sem+Foto';

        // Prepara os preços para exibição
        let priceHTML = '';
        if (produto.promotionalIsActive && produto.promotionalPrice > 0) {
            priceHTML = `
                <div class="price-box">
                    <p style="color: #6B7280; text-decoration: line-through;">De: ${formatarMoeda.format(produto.price)}</p>
                    <p style="font-size: 32px; color: #DC2626; font-weight: 800;">Por: ${formatarMoeda.format(produto.promotionalPrice)}</p>
                </div>
            `;
        } else {
            priceHTML = `
                <div class="price-box" style="background: #F3F4F6; border-color: #9CA3AF;">
                    <p style="font-size: 32px; color: #1F2937; font-weight: 800;">${formatarMoeda.format(produto.price)}</p>
                </div>
            `;
        }

        // Monta o texto para mandar direto pro WhatsApp da dona
        const mensagemWhats = encodeURIComponent(`Olá! Vi o produto *${produto.name}* no site e gostaria de saber mais.`);

        container.innerHTML = `
            <div class="product-detail-grid">
                <div>
                    <img src="${imagemSrc}" alt="${produto.name}" class="detail-image">
                </div>
                <div class="detail-info">
                    <h1>${produto.name}</h1>
                    <p class="desc">${produto.description || 'Nenhuma descrição adicional informada para este produto.'}</p>
                    
                    ${priceHTML}

                    <a href="https://wa.me/5511999999999?text=${mensagemWhats}" target="_blank" class="btn-whatsapp">
                        💬 Pedir pelo WhatsApp
                    </a>
                </div>
            </div>
        `;

        // Altera o título da aba do navegador para o nome do produto
        document.title = `${produto.name} - Mercado da Martha`;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `<h2 style="text-align:center; padding: 50px; color: red;">Erro ao carregar o produto. Ele pode ter sido removido.</h2>`;
    }
}