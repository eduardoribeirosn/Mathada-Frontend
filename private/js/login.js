document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // 1. Impede a página de recarregar (padrão do formulário)
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Limpa erros anteriores e muda o botão para "Carregando..."
    errorMessage.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';

    console.log(email)
    console.log(password)

    try {
        // 2. Faz o POST para a sua API em C#
        // Lembre-se de trocar essa URL pela porta correta que o seu backend C# estiver rodando
        const response = await fetch('http://localhost:5150/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Email: email, Password: password })
        });

        if (response.ok) {
            // 3. Sucesso!
            // Como ainda não temos JWT, vamos apenas redirecionar direto
            // Futuramente, é aqui que você vai pegar o token: const data = await response.json(); localStorage.setItem('token', data.token);
            window.location.href = 'dashboard-admin.html';
            let dataTemp = await response.json()
            sessionStorage.setItem("NAME_USER", dataTemp.name)
        } else {
            // 4. Erro (Ex: Senha incorreta retornou status 401 ou 400)
            errorMessage.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    } catch (error) {
        // 5. Erro de rede (API desligada ou erro de CORS)
        console.error('Erro na requisição:', error);
        errorMessage.textContent = 'Erro ao conectar com o servidor.';
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});

function clearSessionStorage() {
    sessionStorage.clear()
}