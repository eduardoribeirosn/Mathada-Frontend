document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
});

const API_URL = 'http://localhost:5150/api/v1/category';

// === 1. LISTAR CATEGORIAS (GET) ===
async function carregarCategorias() {
    const tbody = document.getElementById('categoriasTableBody');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar categorias');

        const categorias = await response.json();
        tbody.innerHTML = '';

        if (categorias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        categorias.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${cat.idCategory || cat.id}</td>
                <td style="font-weight: 500;">${cat.name}</td>
                <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" onclick="abrirModalCategoria(${cat.idCategory || cat.id}, '${cat.name}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirCategoria(${cat.idCategory || cat.id}, '${cat.name}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro:', error);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}

// === 2. LÓGICA DO MODAL (CRIAR E EDITAR) ===
const modal = document.getElementById('modalCategoria');
const inputId = document.getElementById('categoriaId');
const inputNome = document.getElementById('nomeCategoria');
const tituloModal = document.getElementById('modalTitulo');
const erroMsg = document.getElementById('erroCategoria');

// Se passar os parâmetros, é Edição. Se não passar, é Criação.
function abrirModalCategoria(id = '', nomeAtual = '') {
    inputId.value = id;
    inputNome.value = nomeAtual;
    
    tituloModal.textContent = id ? 'Editar Categoria' : 'Nova Categoria';
    erroMsg.style.display = 'none';
    modal.classList.add('show');
    
    // Pequeno delay para o focus funcionar após a animação do CSS
    setTimeout(() => inputNome.focus(), 100);
}

function fecharModalCategoria() {
    modal.classList.remove('show');
}

// === 3. SALVAR (POST PARA CRIAR, PUT PARA EDITAR) ===
async function salvarCategoria() {
    const id = inputId.value;
    const nome = inputNome.value.trim();
    const btnSalvar = document.getElementById('btnSalvarCategoria');

    if (!nome) {
        erroMsg.textContent = 'O nome da categoria é obrigatório.';
        erroMsg.style.display = 'block';
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    // Se tiver ID, a URL ganha o /{id} e o método vira PUT
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome }) // Envia o JSON exigido pela sua API
        });

        if (response.ok) {
            fecharModalCategoria();
            carregarCategorias(); // Atualiza a tabela imediatamente
        } else {
            const erroBackend = await response.text();
            console.error("Erro Backend:", erroBackend);
            erroMsg.textContent = 'Erro ao salvar categoria. Verifique o console (F12).';
            erroMsg.style.display = 'block';
        }
    } catch (error) {
        erroMsg.textContent = 'Erro de conexão com o servidor.';
        erroMsg.style.display = 'block';
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar';
    }
}

// === 4. EXCLUIR CATEGORIA (DELETE) ===
async function excluirCategoria(id, nomeCategoria) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nomeCategoria}"?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            carregarCategorias(); // Atualiza a tabela
        } else {
            alert('Erro ao excluir. Essa categoria pode estar vinculada a produtos.');
        }
    } catch (error) {
        alert('Erro de conexão ao tentar excluir.');
    }
}

// Lógica básica para voltar ao menu
document.getElementById('logoutBtn').addEventListener('click', () => {
    // No futuro, aqui você apagaria o JWT: localStorage.removeItem('token');
    window.location.href = 'dashboard-admin.html'; // Volta para a dashboard inicial
});