document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
});

// 1. Lógica do Toggle de Promoção
const promoActiveCheckbox = document.getElementById('promoActive');
const promoPriceInput = document.getElementById('promoPrice');

promoActiveCheckbox.addEventListener('change', function() {
    if (this.checked) {
        promoPriceInput.disabled = false;
        promoPriceInput.required = true;
    } else {
        promoPriceInput.disabled = true;
        promoPriceInput.required = false;
        promoPriceInput.value = ''; // Limpa o valor se desativar
    }
});

// 2. Lógica visual do Input de Arquivo
const imageUpload = document.getElementById('imageUpload');
const fileNameHint = document.getElementById('fileName');

imageUpload.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileNameHint.textContent = `Arquivo selecionado: ${this.files[0].name}`;
    } else {
        fileNameHint.textContent = '';
    }
});

// 3. Buscar Categorias da API
async function carregarCategorias() {
    const container = document.getElementById('categoriesContainer');
    try {
        // Você precisará criar esse endpoint GET /categories no seu C# depois
        const response = await fetch('http://localhost:5150/api/v1/category');
        const categories = await response.json();
        
        container.innerHTML = ''; // Limpa o "carregando"

        categories.forEach(cat => {
            container.innerHTML += `
                <div class="checkbox-group">
                    <input type="checkbox" id="cat_${cat.idCategory}" name="categories" value="${cat.idCategory}">
                    <label for="cat_${cat.idCategory}">${cat.name}</label>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<span style="color: red;">Erro ao carregar categorias.</span>';
    }
}

// 4. Enviar o Formulário
document.getElementById('productForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    // Pega todas as categorias marcadas (Retorna um array de IDs)
    const checkedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
                                   .map(cb => parseInt(cb.value));

    if (checkedCategories.length === 0) {
        alert("Selecione pelo menos uma categoria!");
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Produto';
        return;
    }

    // Estrutura do Produto (Ainda sem a imagem física, mandando null por enquanto)
    const novoProduto = {
        Name: document.getElementById('name').value,
        Description: document.getElementById('description').value,
        Price: parseFloat(document.getElementById('price').value),
        PromotionalPrice: promoActiveCheckbox.checked ? parseFloat(promoPriceInput.value) : null,
        PromotionalIsActive: promoActiveCheckbox.checked,
        IsActive: true,
        Image: "null", // Na V2 (ou mais pro final da V1) trocaremos essa lógica pelo FormData
        CategoryIds: checkedCategories[0] // O C# vai receber essa lista para salvar na tabela intermediária
    };

    try {
        const response = await fetch('http://localhost:5150/api/v1/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoProduto)
        });

        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
            window.location.href = 'lista-produtos.html'; // Redireciona de volta
        } else {
            alert('Erro ao cadastrar produto.');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar Produto';
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Produto';
    }
});

// Lógica básica para voltar ao menu
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'dashboard-admin.html'; // Volta para a dashboard inicial
});