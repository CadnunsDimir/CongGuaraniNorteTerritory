var lista = `1 - V. Maria Baixa (Rosinha)
2 - V. Guilherme (Rosa Escuro)
3 - V. Guilherme (Verde Claro)
4 - V. Guilherme (Laranja Escuro)
5 - V. Guilherme (Preto)
6 - Avenida Conceição (Verde Limão)
7 - Salão do Reino (Vermelho Tijolo)
8 - Paranhos Pederneiras (Roxo)
9 - V. Maria Baixa (Cinza)
10 - V. Maria Alta (Amarelo Sol)
11 - V. Sabrina (Roxo)
12 - UBS V. Medeiros (Cinza Escuro)
13 - Vila Ede (Cinza Claro)
14 - Isolina Mazzei (Grafite)
15 - SR V. Medeiros (Azul)
16 - Neneca (Azul Céu)
17 - Jardim Japão (Laranja)
18 - Arlindo Luz, Jardim Brasil (Verde)
19 - AMA Jardim Brasil (Roxo)
20 - Jardim Brasil (Vermelho Claro)
21 - J. Brasil (Verde Abacate)
22 - SR J. Brasil (Cinza)
23 - Tenente Sotomano (Preto)
24 - Benfica (Vermelho)
25 - Roland Garros (Verde Escuro)
26 - Edu Chaves (Azul)
27 - Edu Chaves (Marrom)
28 - Edu Chaves (Amarelo)
29 - Tremembé (Verde)
30 - Santana (Azul)
31 - Lauzane (Vermelho)
32 - Casa Verde (Verde)
33 - Guarulhos
34 - Parque Novo Mundo (Amarelo Mostarda)`;

const ListaTerritorios = lista.split("\n").map(t=> {
    var cardArray = t.split(" - ")
    return {
        numeroCartao : cardArray[0],
        localidade: cardArray[1]
    }
});

export default ListaTerritorios;