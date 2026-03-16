function setOnClick(selector, action) {
    document.querySelector(selector).addEventListener('click', action);
}

fetch('/api/admin/user', {
    method: 'GET',
    credentials: 'include' // Essencial para o navegador saber qual cookie limpar
}).then(async (respostaAdminUserFetch) => {
    const nomeUsuario = document.getElementById("nome-usuario");

    if (respostaAdminUserFetch.ok) {
        var { data } = await respostaAdminUserFetch.json();
        nomeUsuario.innerText = data.login;
    }
});

setOnClick('#btn-logout', async () => {
    try {
        const resposta = await fetch('/api/admin/logout', {
            method: 'GET',
            credentials: 'include' // Essencial para o navegador saber qual cookie limpar
        });

        if (resposta.ok) {
            // Após limpar o cookie no servidor, limpamos o estado local e redirecionamos
            window.location.href = '/admin';
        }
    } catch (erro) {
        console.error('Erro ao deslogar:', erro);
    }
});


setOnClick("#btn-refresh", async () => {
    const resultado = document.getElementById("resultado");

    try {
        const resposta = await fetch('/api/territorios/refresh', {
            method: 'GET',
            credentials: 'include' // Essencial para o navegador saber qual cookie limpar
        });

        if (resposta.ok) {
            resultado.innerText = "Territorios atualizados!"
        }
    } catch (erro) {
        console.error('Erro ao atualizar:', erro);
        resultado.innerText = "Erro: " + JSON.stringify(erro);
    }
});

setOnClick("#btn-mapa-completo", ()=>{
     window.location.href = '/admin/complete-map'
})