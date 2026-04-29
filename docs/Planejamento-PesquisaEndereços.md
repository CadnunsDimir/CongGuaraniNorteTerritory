# Task: Implementar Busca e Criação de Novo Endereço

## Objetivo
Adicionar funcionalidade de busca de endereços na tela principal, com comportamento semelhante ao Google Maps, permitindo:

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
  - Bairro
  - Complemento (se existir)

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

## Estrutura sugerida

### Componentes
- AddressSearchInput
- AddressSuggestionList
- CreateAddressButton
- NewAddressModal

---

## Serviços
Criar/ajustar:

```ts
searchLocalAddresses(query: string)

searchGeocoding(query: string)

parseAddressNumber(address: string)
```

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

## Fora de Escopo
- Cadastro manual sem geocoding
- Edição de endereços existentes
- Ordenação por distância (neste momento)