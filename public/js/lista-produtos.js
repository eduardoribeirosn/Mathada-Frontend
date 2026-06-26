document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});

// Formatador de Moeda (Padrão Ouro do JS)
// Transforma 25.9 em "R$ 25,90"
const formatarMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

async function carregarProdutos() {
    const tbody = document.getElementById('productTableBody');

    try {
        const response = await fetch('http://localhost:5150/api/v1/products');
        
        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const products = await response.json();
        tbody.innerHTML = ''; // Limpa o "Carregando..."

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum produto cadastrado.</td></tr>`;
            return;
        }

        products.forEach(produto => {
            const tr = document.createElement('tr');
            
            // Tratamento caso o preço promocional seja nulo ou zero
            const precoPromocionalFormatado = produto.promocionalPrice && produto.promocionalIsActive 
                ? `<span class="preco-promocao">${formatarMoeda.format(produto.promocionalPrice)}</span>` 
                : '<span style="color: #9CA3AF;">-</span>';

            tr.innerHTML = `
                <td>${produto.name}</td>
                <td>${formatarMoeda.format(produto.price)}</td>
                <td>${precoPromocionalFormatado}</td>
                <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" onclick="editarProduto(${produto.idProduct})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirProduto(${produto.idProduct}, '${produto.name}')">Excluir</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}

async function excluirProduto(id, nomeProduto) {
    // 1. Confirmação de Segurança
    const confirmacao = confirm(`Tem certeza que deseja excluir o produto "${nomeProduto}"? Esta ação não pode ser desfeita.`);
    
    if (!confirmacao) {
        return; // Se ela clicar em "Cancelar", para a execução da função aqui.
    }

    try {
        // 2. Chama a API do C# passando o ID na URL
        const response = await fetch(`http://localhost:5150/api/v1/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Produto excluído com sucesso!');
            carregarProdutos(); // Recarrega a tabela para sumir com o produto deletado
        } else {
            alert('Erro ao excluir o produto. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Deixamos a função de editar vazia para o futuro
function editarProduto(id) {
    alert(`A funcionalidade de editar (Modal) será implementada em breve. ID clicado: ${id}`);
}

// Lógica básica de Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'login.html'; // Volta para o login
});