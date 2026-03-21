
const setOnClick = (selector, action) => 
    document.querySelector(selector).addEventListener('click', action);
const getById = (id) => document.getElementById(id);

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
    await openOnSinglePage('refresh');
});

setOnClick("#btn-mapa-completo", ()=>{
     window.location.href = '/admin/complete-map'
});

const partialPageScripts = {
    refresh: async () => {
        const resultado = getById("resultado");

        try {
            const resposta = await fetch('/api/territorios/refresh', {
                method: 'GET',
                credentials: 'include'
            });

            if (resposta.ok) {
                resultado.innerText = "Territorios atualizados!"
            }
        } catch (erro) {
            console.error('Erro ao atualizar:', erro);
            resultado.innerText = "Erro: " + JSON.stringify(erro);
        }
    },
    upload: async (page) => {
        var form = page.querySelector('form');
        var result = page.querySelector('#resultado');
        
        form.addEventListener('submit', ev => {
            ev.preventDefault();

            const mapFiles = getById('map').files;

            if (mapFiles.length === 0) {
                result.innerText = "Selecione um arquivo válido!";
                return;
            }

            const formData = new FormData();
            formData.append('map', mapFiles[0]);

            fetch('/api/territory/boundaries', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(response => {
                    
                    result.innerText = response.message;
                })
                .catch(err => result.innerText = "Erro ao salvar arquivo: "+ err);
        });
    }
}

const page = getById('page');
const menu = getById('menu');

setOnClick('#btn-voltar', ev => {
    console.log("backButton.click()");
    page.style.display = '';
    menu.style.display = '';
});

const openOnSinglePage = async (id) => {    
    const pageContent = getById('page-content');

    const html =  await fetch('/admin/partial/'+id, {
            method: 'GET',
            credentials: 'include'
        }).then(res => res.text())
        .catch(ex => console.error(ex));
    
    pageContent.innerHTML = html;
    page.style.display = 'block';
    menu.style.display = 'none';

    setTimeout(async () => {
        await partialPageScripts[id](page);
    }, 200);    
}