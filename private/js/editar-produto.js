document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pega o ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert("Produto não encontrado!");
        window.location.href = 'lista-produtos.html';
        return;
    }

    // Carrega as categorias primeiro para poder marcá-las depois
    await carregarCategorias();
    
    // Carrega os dados do produto específico
    await carregarDadosDoProduto(productId);
});

// Lógica visual do Toggle de Promoção (Igual ao cadastro)
const promoActiveCheckbox = document.getElementById('promoActive');
const promoPriceInput = document.getElementById('promoPrice');

promoActiveCheckbox.addEventListener('change', function() {
    if (this.checked) {
        promoPriceInput.disabled = false;
        promoPriceInput.required = true;
    } else {
        promoPriceInput.disabled = true;
        promoPriceInput.required = false;
    }
});

// Lógica visual do Arquivo
document.getElementById('imageUpload').addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        document.getElementById('fileName').textContent = `Nova imagem: ${this.files[0].name}`;
    }
});

async function carregarCategorias() {
    const container = document.getElementById('categoriesContainer');
    try {
        const response = await fetch('http://localhost:5150/api/v1/category');
        const categories = await response.json();
        
        container.innerHTML = ''; 
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

async function carregarDadosDoProduto(id) {
    try {
        const response = await fetch(`http://localhost:5150/api/v1/products/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado');
        
        const produto = await response.json();

        // Preenche os campos de texto e número
        document.getElementById('name').value = produto.name;
        document.getElementById('description').value = produto.description || '';
        document.getElementById('price').value = produto.price;

        // Lógica da Promoção
        if (produto.promotionalIsActive) {
            promoActiveCheckbox.checked = true;
            promoPriceInput.disabled = false;
            promoPriceInput.required = true;
        }
        promoPriceInput.value = produto.promotionalPrice;
        
        console.log(produto)
        // Marca as categorias que o produto já tem
        // (Assumindo que a API retorna um array 'categoryIds' com os IDs das categorias)
        // if (produto.categoryIds && produto.categoryIds.length > 0) {
        //     produto.categoryIds.forEach(catId => {
        //         const checkbox = document.getElementById(`cat_${catId}`);
        //         if (checkbox) checkbox.checked = true;
        //     });
        // }
        document.getElementById(`cat_${produto.fkCategory}`).checked = true;

        // Lógica visual para a imagem atual (Se existir)
        if (produto.image) {
            document.getElementById('fileName').textContent = `Imagem atual salva no sistema. Selecione outra para substituir.`;
        }

    } catch (error) {
        alert("Erro ao carregar os dados do produto.");
        console.error(error);
    }
}

// Enviar o Formulário de Edição
document.getElementById('productForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const saveBtn = document.getElementById('saveBtn');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    const checkedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
                                   .map(cb => parseInt(cb.value));

    if (checkedCategories.length === 0) {
        alert("Selecione pelo menos uma categoria!");
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Alterações';
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

    const produtoAtualizado = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        promotionalPrice: parseFloat(promoPriceInput.value) ? parseFloat(promoPriceInput.value) : 0.1,
        // promotionalPrice: promoActiveCheckbox.checked ? parseFloat(promoPriceInput.value) : 0.0,
        // promotionalIsActive: promoActiveCheckbox.checked,
        categoryIds: checkedCategories[0],
        Image: urlDaImagemSalva,
        // O campo 'isActive' não enviamos aqui, ou enviamos conforme a regra do seu backend.
    };

    try {
        // Atenção ao método PUT e a URL com o ID
        const response = await fetch(`http://localhost:5150/api/v1/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoAtualizado)
        });

        if (response.ok) {
            alert('Produto atualizado com sucesso!');
            window.location.href = 'lista-produtos.html'; 
        } else {
            alert('Erro ao atualizar produto.');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar Alterações';
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Alterações';
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