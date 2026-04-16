# GN-9: Adicionar Informação de Cartão na Modal de Detalhes do Endereço

## 📋 Escopo

Adicionar a exibição do número do cartão ("Cartão ${numCartao}") na modal de detalhes do endereço, posicionando-a acima do endereço com estilização discreta (cor cinza) e fonte menor que a do endereço.

## 🎯 Objetivo

Melhorar a experiência do usuário ao visualizar detalhes de um endereço, exibindo de forma clara e discreta o número do cartão associado ao endereço.

## 📍 Localização da Modal

**Arquivo:** `templates/complete-map.html`
**ID da Dialog:** `#edit-dialog`
**Tipo:** Modal de edição/visualização de endereço

### Estrutura Atual
```html
<dialog class="edit-dialog hide" id="edit-dialog">
    <form id="edit-dialog-form" onsubmit="submitForm(event)">
        <label>
            Cartão 
            <select name="cartao" id="form_numerocartao">
            </select>
        </label>
        <label>
            Endereço 
            <input type="text" name="endereco" id="form_endereco" >
        </label>
        <!-- outros campos -->
    </form>
</dialog>
```

## 🔧 Alterações Necessárias

### 1. **Frontend - HTML Template**

#### Arquivo: `templates/complete-map.html`

**O que fazer:**
- Adicionar um novo elemento `<div>` ou `<span>` para exibir "Cartão ${numCartao}"
- Posicionamento: **acima do campo "Endereço"**
- Usar classe CSS customizada para estilização

**Proposta de marcação HTML:**
```html
<div class="cartao-info" id="cartao-display" style="display: none;">
    <span class="cartao-label">Cartão: <strong id="cartao-number">--</strong></span>
</div>
<label>
    Endereço 
    <input type="text" name="endereco" id="form_endereco" >
</label>
```

---

### 2. **Frontend - Estilos CSS**

#### Arquivo: `www/style.css`

**Adicionar novas classes CSS:**

```css
/* Estilo para informação do Cartão na modal de detalhes */
.cartao-info {
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.cartao-label {
    font-size: 12px;  /* Menor que o endereço (~14px) */
    color: #999999;   /* Cinza discreto */
    font-weight: normal;
    letter-spacing: 0.5px;
}

.cartao-label strong {
    font-weight: 600;
    color: #666666;   /* Um pouco mais escuro que o resto do texto */
}
```

---

### 3. **Frontend - JavaScript**

#### Arquivo: `www/complete-map.js`

**Função a modificar:** `showForm(addressData = null)`

**O que fazer:**
- Quando a modal é aberta com dados de um endereço (`addressData` fornecido)
- Extrair o número do cartão de `addressData.cartao`
- Atualizar o elemento `#cartao-display` com o número
- Mostrar o elemento (`#cartao-display`)

**Modificação proposta - linha ~76 na função `showForm`:**

```javascript
function showForm(addressData = null) {
    var latInput = htmlUtil.get("#form_lat");
    var longInput = htmlUtil.get("#form_long");
    var cartaoDisplay = htmlUtil.get("#cartao-display");
    var cartaoNumber = htmlUtil.get("#cartao-number");

    htmlUtil.hide(htmlUtil.get("#showFormButton"));
    htmlUtil.show(htmlUtil.get("#edit-dialog"));

    if (addressData) {
        isEditMode = true;
        enderecoAnterior = addressData.endereco;
        htmlUtil.show(htmlUtil.get("#delete-button"));
        
        // NOVO: Atualizar e exibir informação do cartão
        cartaoNumber.innerText = addressData.cartao;
        htmlUtil.show(cartaoDisplay);
        
        // Parse the address
        var parts = addressData.endereco.split(", ");
        var endereco = parts[0];
        var indexOfObsDivider = parts[1].indexOf("-");
        var numeroCasa = indexOfObsDivider > 0 ? parts[1].substring(0, indexOfObsDivider) : parts[1];
        var obs = indexOfObsDivider > 0? parts[1].substring(indexOfObsDivider+1, parts[1].length) : "";

        htmlUtil.get("#form_numerocartao").value = addressData.cartao;
        htmlUtil.get("#form_endereco").value = endereco;
        htmlUtil.get("#form_numerocasa").value = numeroCasa.trim();
        htmlUtil.get("#form_obs").value = obs.trim();
        latInput.value = addressData.lat;
        longInput.value = addressData.long;

        console.log(currentEditingMarker);
    } else {
        isEditMode = false;
        enderecoAnterior = null;
        // NOVO: Ocultar informação do cartão quando criar novo endereço
        htmlUtil.hide(cartaoDisplay);
    }

    setTimeout(()=> {
        mapHolder.setShowMarkOnClick(!isEditMode);

        mapHolder.setOnClickMap(coordinates => {
            latInput.value = coordinates.lat;
            longInput.value = coordinates.long;
            if (isEditMode && currentEditingMarker) {
                currentEditingMarker.setLatLng([coordinates.lat, coordinates.long]);
            }
        });
    });
}
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar elemento HTML para cartão na modal (`templates/complete-map.html`)
- [ ] Adicionar estilos CSS (`.cartao-info` e `.cartao-label`) em `www/style.css`
- [ ] Modificar função `showForm()` em `www/complete-map.js` para:
  - [ ] Preencher o número do cartão quando endereço é editado
  - [ ] Mostrar o elemento ao editar
  - [ ] Ocultar o elemento ao criar novo endereço
- [ ] Testar funcionalidade:
  - [ ] Clicar em marcador existente e verificar se cartão é exibido
  - [ ] Clicar em "novo" e verificar se cartão não é exibido
  - [ ] Validar estilo (cor cinza, fonte pequena)
- [ ] Fazer commit das alterações

---

## 🎨 Especificações de Estilo

| Propriedade | Valor | Justificativa |
|---|---|---|
| **Font Size** | 12px | Menor que o endereço (~14px) |
| **Color** | #999999 | Cinza discreto |
| **Font Weight** | normal (600 para bold) | Leve para não chamar atenção |
| **Positioning** | Acima do endereço | Seguir fluxo visual superior |
| **Margin/Padding** | 8px 0, 12px bottom | Espaçamento harmonioso |
| **Border** | 1px solid #f0f0f0 | Separação sutil da seção anterior |

---

## 📌 Notas Importantes

1. **Popup do Mapa vs Modal de Edição:**
   - O popup (bindPopup) no mapa.js já mostra coordenadas - não precisa alterar
   - A alteração é especificamente na modal de edição (`#edit-dialog`)

2. **Visibilidade:**
   - Mostrar cartão apenas quando editando (não ao criar novo endereço)
   - Usar `display: none` por padrão para ocultar ao carregar a página

3. **Compatibilidade:**
   - Manter consistência com o design existente
   - Usar classes CSS já presentes (ex: htmlUtil.show/hide)

4. **Dados:**
   - `addressData.cartao` já contém o número do cartão
   - O cartão também está disponível no select `#form_numerocartao`

---

## 📂 Arquivos a Serem Modificados

1. **templates/complete-map.html** - Adicionar elemento HTML
2. **www/style.css** - Adicionar estilos CSS
3. **www/complete-map.js** - Modificar função showForm()
