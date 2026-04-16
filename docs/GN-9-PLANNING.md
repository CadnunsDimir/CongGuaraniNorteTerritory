# GN-9: Exibir número do cartão no tooltip/popup do endereço (mapa)

## Escopo
Quando o usuário clicar em um endereço no mapa (marcador), o tooltip/popup que aparece deve exibir também o número do cartão (ex.: `Cartão 12`) **acima do endereço**, com estilo discreto (cinza e fonte menor).

## Objetivo
Dar contexto imediato de qual cartão o endereço pertence, sem precisar abrir modal/tela extra.

## Onde isso acontece (hoje)
**Arquivo:** `www/map.js`  
**Função:** `marker()`  
**Comportamento:** o marcador usa `bindPopup(popUp)` e o HTML do popup contém o endereço e ações (copiar endereço, copiar coordenadas, rotas).

## Alterações necessárias

### 1) Passar o número do cartão junto dos marks
**Arquivo:** `www/scrips.js`  
**Trecho:** `carregarEnderecos(numeroCartao)`

Hoje os marks são montados assim:
```js
var marks = cartao.enderecos.map(e => [e.lat, e.long, e.endereco]);
```

Ajustar para incluir o `numeroCartao` (ou `cartao.numeroCartao`, se existir) na estrutura enviada ao mapa:
```js
var marks = cartao.enderecos.map(e => [e.lat, e.long, e.endereco, numeroCartao]);
```

### 2) Renderizar “Cartão X” no popup do marcador
**Arquivo:** `www/map.js`  
**Trecho:** `function marker(coordinates, cor = '#FF0000')`

Atualizar a extração de dados do marcador para ler o cartão quando vier como array:
- `endereco = coordinates[2]`
- `numCartao = coordinates[3]` (novo)

E inserir no HTML do `popUp` um bloco acima do endereço, por exemplo:
```html
<div class="map-popup-card">Cartão 12</div>
```

Regras:
- Se `numCartao` não existir, não renderizar a linha (evita “Cartão undefined”).
- Manter o endereço como elemento clicável para copiar, como já é hoje.

### 3) Estilo discreto para a linha do cartão
**Arquivo:** `www/style.css`  
Adicionar uma classe simples para o popup:
```css
.map-popup-card {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}
```

## Checklist
- [ ] Ajustar `www/scrips.js` para incluir `numeroCartao` no `marks`
- [ ] Ajustar `www/map.js` para exibir “Cartão X” no `bindPopup`
- [ ] Adicionar estilo em `www/style.css`
- [ ] Testar:
  - [ ] Clicar em um marcador e validar “Cartão X” acima do endereço
  - [ ] Verificar que copiar endereço/coordenadas e botão “Rotas” continuam funcionando
  - [ ] Validar que não aparece “Cartão undefined” em nenhum cenário

## Arquivos a modificar
1. `www/scrips.js`
2. `www/map.js`
3. `www/style.css`
