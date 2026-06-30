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

    // ==========================================
    // NOVA LÓGICA DE UPLOAD DE IMAGEM AQUI
    // ==========================================
    let urlDaImagemSalva = null; // Começa vazio
    const inputImagem = document.getElementById('imageUpload');

    // Se a usuária selecionou alguma foto
    if (inputImagem.files && inputImagem.files[0]) {
        const formData = new FormData();
        formData.append("file", inputImagem.files[0]); // Adiciona o arquivo no pacote

        try {
            // Manda a foto pro C# (Ajuste a porta se precisar)
            const uploadResponse = await fetch('http://localhost:5150/api/v1/uploadimage', {
                method: 'POST',
                // IMPORTANTE: Quando usamos FormData, não mandamos o 'Content-Type'. O navegador faz sozinho.
                body: formData 
            });

            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                urlDaImagemSalva = uploadResult.url; // Pega o "/uploads/nome-gerado.jpg"
            } else {
                alert('Erro ao salvar a imagem. Tente novamente.');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Salvar Produto';
                return; // Para tudo se a imagem der erro
            }
        } catch (erroUpload) {
            console.error("Erro no upload:", erroUpload);
            alert('Erro de conexão ao enviar a imagem.');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar Produto';
            return;
        }
    }
    // ==========================================

    const novoProduto = {
        Name: document.getElementById('name').value,
        Description: document.getElementById('description').value,
        Price: parseFloat(document.getElementById('price').value),
        PromotionalPrice: parseFloat(promoPriceInput.value) ? parseFloat(promoPriceInput.value) : 0.1,
        // PromotionalPrice: promoActiveCheckbox.checked ? parseFloat(promoPriceInput.value) : 0.0,
        // PromotionalIsActive: promoActiveCheckbox.checked,
        IsActive: true,
        Image: urlDaImagemSalva,
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

function verifyLogin() {
    let item = sessionStorage.getItem("NAME_USER")
    if (!item) {
        window.location.href = 'login.html'
        setTimeout(() => {
            alert("Para acessar esta tela, você deve estar logado!")
        }, 50);
    }
}