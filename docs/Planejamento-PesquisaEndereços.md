# Task: Implementar Busca e Criação de Novo Endereço

## Objetivo
Adicionar funcionalidade de busca de endereços na tela de mapa completo (edição de territorios), com comportamento semelhante ao Google Maps, permitindo:

- Pesquisar endereços existentes
- Exibir sugestões em tempo real
- Consultar geocoding quando não houver resultados internos
- Criar novo endereço com dados pré-preenchidos

---

## Requisitos Funcionais

### 1. Campo de Busca no Topo da Tela
Implementar um campo de texto fixo no topo da tela com estilo semelhante ao Google Maps:

#### Características:
- Input com placeholder:
  `Pesquisar endereço...`

- Deve ficar visível no topo da tela
- Possuir debounce de 300–500ms para evitar consultas excessivas
- Disparar busca ao digitar 3 ou mais caracteres

---

## 2. Busca em Endereços Cadastrados
Ao digitar no campo:

### Regras:
- Consultar base local de endereços
- Buscar por:
  - Nome da rua
  - Número

### Retorno:
- Exibir no máximo 5 endereços encontrados
- Mostrar em lista dropdown abaixo do campo

### Exemplo:
Rua das Flores, 123  
Rua das Flores, 245  
Rua das Flores, 300  

### Ao clicar em um resultado:
- Selecionar endereço
- Centralizar mapa nesse ponto (se houver mapa)
- Preencher fluxo atual de seleção

---

## 3. Fallback para Geocoding
Se a busca local retornar zero resultados:

### Executar:
Consultar serviço de geocoding com o texto digitado.

### Se geocoding retornar resultado:
Exibir:

- Endereço encontrado
- Coordenadas (lat/lng)
- Botão:

`+ Criar novo endereço`

---

## 4. Fluxo de Criar Novo Endereço
Ao clicar em **Criar novo endereço**:

Abrir modal/tela de Novo Endereço com os seguintes campos preenchidos automaticamente:

| Campo | Origem |
|------|--------|
| Endereço | retorno do geocoding |
| Número | extraído do endereço, se existir |
| Latitude | geocoding |
| Longitude | geocoding |

### Usuário poderá:
- Confirmar dados
- Ajustar número se necessário
- Salvar novo endereço

---

## Regras de Extração do Número
Ao receber endereço do geocoding:

Exemplos:

Input:
Rua Afonso Pena, 120

Resultado:
- Endereço: Rua Afonso Pena
- Número: 120

Se não houver número:

Input:
Rua Afonso Pena

Resultado:
- Endereço: Rua Afonso Pena
- Número: vazio

---

## Critérios de Aceite

### Cenário 1
Dado que existem endereços cadastrados  
Quando eu digitar "Flores"  
Então devo ver até 5 sugestões.

---

### Cenário 2
Dado que não há resultados locais  
Quando geocoding encontrar um endereço válido  
Então devo ver botão "Criar novo endereço".

---

### Cenário 3
Quando clicar em "Criar novo endereço"  
Então modal deve abrir com:

- endereço preenchido  
- número preenchido (quando existir)  
- latitude preenchida  
- longitude preenchida

---

## Requisitos Técnicos

### Performance
- Implementar debounce
- Limitar resultados a 5
- Não chamar geocoding enquanto usuário estiver digitando

---

## Tratamento de Erros
Se geocoding falhar:

Exibir mensagem:

"Nenhum endereço encontrado."

Não exibir botão de criação.

---

## Fluxo esperado
```text
Usuário digita
 ↓
Busca local
 ↓
Tem resultados?
 ├── Sim → Exibe até 5 sugestões
 └── Não
      ↓
   Consulta geocoding
      ↓
Encontrou?
 ├── Não → Mensagem "Nenhum endereço encontrado"
 └── Sim → Exibe botão Criar novo endereço
                ↓
            Abre modal preenchido
```

---

## Integração com a Aplicação (o que precisa ser feito)

### 1. Entrada de busca na tela de mapa completo
Adicionar o campo de pesquisa diretamente na tela `templates/complete-map.html`, ancorado no topo do mapa completo.

Itens:
- Criar input com id estável (ex.: `address_search_input`).
- Criar container de sugestões (dropdown) logo abaixo do input.
- Garantir que o dropdown feche ao clicar fora.
- Posicionar o bloco para não conflitar com os botões existentes (`selecionar territorios` e `+ novo`).

### 2. Lógica de busca local no frontend
Implementar em `www/complete-map.js`:

Funções novas:
- `debounce(fn, wait)`
- `searchLocalAddresses(query, addresses)`
- `renderAddressSuggestions(items)`
- `clearAddressSuggestions()`

Fontes de dados:
- Usar os dados já carregados em `territoryCardsCache`.
- Complementar com `loadTerritoryCard(territoryNumber)` para cartões ainda não carregados no mapa (quando necessário).

Comportamento:
- Iniciar busca com 3+ caracteres.
- Limitar retorno a 5 sugestões.
- Ao clicar em sugestão:
  - preencher o input de busca;
  - centralizar mapa com `mapHolder.showLocation([lat, long])`;
  - destacar visualmente o item na lista/tabela (quando aplicável).

### 3. Fallback geocoding (sem quebrar o fluxo atual)
Integrar fallback com endpoint já existente em `core/controller/AdressesController.js`:
- `GET /api/admin/territory/geocoding/v2`

Implementar em `www/complete-map.js`:
- `searchGeocoding(query)` para consulta quando busca local vier vazia.
- `parseAddressNumber(address)` para separar rua e número antes de montar query string.

Regras:
- Só chamar geocoding após debounce.
- Se retornar 1 resultado: exibir opção `+ Criar novo endereço`.
- Se retornar múltiplos: mostrar as melhores opções no dropdown.
- Se falhar: mostrar mensagem `"Nenhum endereço encontrado."`.

### 4. Integração com o fluxo de cadastro/edição administrativo
Reaproveitar o fluxo já existente da própria tela `complete-map`.

Ações necessárias:
- Ao selecionar resultado de geocoding, habilitar ação `+ Criar novo endereço` na própria página.
- Essa ação deve abrir `showForm()` e preencher automaticamente:
  - `#form_endereco`
  - `#form_numerocasa`
  - `#form_lat`
  - `#form_long`
- Manter sem alteração os endpoints existentes de persistência:
  - `POST /api/admin/territory/adresses`
  - `PUT /api/admin/territory/adresses/:enderecoAnterior`
  - `DELETE /api/admin/territory/adresses/:endereco`

### 5. Estilo e usabilidade
Atualizar `www/style.css` para:
- Input de busca fixo/visível sem sobrepor controles do mapa.
- Dropdown com scroll, hover e estado vazio.
- Layout responsivo no mobile (sem esconder mapa e lista).

### 6. Ajustes backend (opcional, recomendado)
Se a busca local no frontend ficar limitada aos cartões atualmente carregados, criar endpoint de busca global:
- `GET /api/territorios/search?query=...&limit=5`

Implementação:
- Controller: `core/controller/TerritoryController.js`
- Service: `core/services/TerritorioService.js`
- Retornar somente campos necessários: `endereco`, `lat`, `long`, `numeroCartao`.

### 7. Testes de integração
Validar ponta a ponta:
- Busca local com resultados.
- Busca local sem resultados + fallback geocoding.
- Clique em sugestão local e geocoding centralizando mapa.
- Ação `+ Criar novo endereço` abrindo o formulário da própria tela preenchido.
- Salvamento no admin e recarga dos marcadores sem regressão.

---

## Fora de Escopo
- Cadastro manual sem geocoding
- Edição de endereços existentes
- Ordenação por distância (neste momento)
