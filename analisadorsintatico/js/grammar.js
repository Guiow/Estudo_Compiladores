var EPSILON = '\'\'';


function Grammar(text) {
    // Estruturas principais da gramática (alfabeto, não-terminais, terminais, regras e conjuntos FIRST/FOLLOW)
    
    this.alphabet = [];
    this.nonterminals = [];
    this.terminals = [];
    this.rules = [];
    this.firsts = new Object();
    this.follows = new Object();
    
    // Retorna a gramática como texto, uma regra por linha
    this.toString = function() {
        return this.rules.join('\n');
    };
    
    // Retorna todas as regras cujo lado esquerdo é o não-terminal informado
    this.getRulesForNonterminal = function(nonterminal) {
        var result = [];
        
        for (var i in this.rules) {
            var rule = this.rules[i];
            
            if (nonterminal == rule.nonterminal) {
                result.push(rule);
            }
        }
        
        return result;
    };
    
    /**
     * Calcula o conjunto FIRST de uma sequência de símbolos.
     * A sequência é um array de símbolos (terminais ou não-terminais) e o
     * resultado é o conjunto de terminais que podem iniciar cadeias derivadas
     * dessa sequência (incluindo épsilon, se aplicável).
     */
    this.getSequenceFirsts = function(sequence) {
        var result = [];
        var epsilonInSymbolFirsts = true;
        
        for (var j in sequence) {
            var symbol = sequence[j];
            epsilonInSymbolFirsts = false;
            
            // Se o símbolo é terminal, ele próprio pertence ao FIRST da sequência
            if (isElement(symbol, this.terminals)) {
                addUnique(symbol, result);
                
                break;
            }
            
            // Caso seja não-terminal, adiciona os elementos de FIRST(simbolo)
            for (var k in this.firsts[symbol]) {
                var first = this.firsts[symbol][k];
                
                epsilonInSymbolFirsts |= first == EPSILON;
                if(first !== EPSILON)
                    addUnique(first, result);
            }
            
            // Se FIRST(simbolo) é vazio ou indefinido, considera que pode derivar épsilon
            epsilonInSymbolFirsts |= this.firsts[symbol] == undefined || this.firsts[symbol].length == 0;
            
            // Se não há mais épsilon, pode interromper o processamento
            if (!epsilonInSymbolFirsts) {
                break;
            }
        }
        
        // Se todos os símbolos da sequência podem gerar épsilon, inclui épsilon no FIRST
        if (epsilonInSymbolFirsts) {
            addUnique(EPSILON, result);
        }
        
        return result;
    };
    
    // Inicialização da gramática a partir do texto de entrada
    
    initializeRulesAndAlphabetAndNonterminals(this);
    initializeAlphabetAndTerminals(this);
    initializeFirsts(this);
    initializeFollows(this);
    
    
    // Função interna: lê o texto, cria as regras e identifica o axioma e não-terminais
    function initializeRulesAndAlphabetAndNonterminals(grammar) {
        var lines = text.split('\n');
        
        for (var i in lines) {
            var line = lines[i].trim();
            
            if (line != '') {
                var rule = new Rule(grammar, line);
                
                grammar.rules.push(rule);
                
                // A primeira regra define o símbolo inicial (axioma) da gramática
                if (grammar.axiom == undefined) {
                    grammar.axiom = rule.nonterminal;
                }
                
                addUnique(rule.nonterminal, grammar.alphabet);
                addUnique(rule.nonterminal, grammar.nonterminals);
            }
        }
    }
    
    // Função interna: percorre todas as produções para descobrir símbolos terminais
    function initializeAlphabetAndTerminals(grammar) {
        for (var i in grammar.rules) {
            var rule = grammar.rules[i];
            
            for (var j in rule.development) {
                var symbol = rule.development[j];
                
                // Símbolo é terminal se não for não-terminal e não for épsilon
                if (symbol != EPSILON && !isElement(symbol, grammar.nonterminals)) {
                    addUnique(symbol, grammar.alphabet);
                    addUnique(symbol, grammar.terminals);
                }
            }
        }
    }
    
    // Função interna: calcula iterativamente os conjuntos FIRST de todos os não-terminais
    function initializeFirsts(grammar) {
        var notDone;
        
        do {
            notDone = false;
            
            for (var i in grammar.rules) {
                var rule = grammar.rules[i];
                var nonterminalFirsts = getOrCreateArray(grammar.firsts, rule.nonterminal);
                
                // Caso em que a produção gera apenas épsilon
                if (rule.development.length == 1 && rule.development[0] == EPSILON) {
                    notDone |= addUnique(EPSILON, nonterminalFirsts);
                } else {
                    // Coleta os FIRST do desenvolvimento da regra
                    notDone |= collectDevelopmentFirsts(grammar, rule.development, nonterminalFirsts);
                }
            }
        } while (notDone);
    }
    
    /**
     * Função auxiliar para o cálculo de FIRST:
     * percorre o lado direito de uma produção e adiciona ao FIRST do não-terminal
     * correspondente todos os símbolos que podem iniciar derivação dessa produção.
     */
    function collectDevelopmentFirsts(grammar, development, nonterminalFirsts) {
        var result = false;
        var epsilonInSymbolFirsts = true;
        
        for (var j in development) {
            var symbol = development[j];
            epsilonInSymbolFirsts = false;
    
            // Se encontrar terminal, ele entra no FIRST e o laço pode parar
            if (isElement(symbol, grammar.terminals)) {
                result |= addUnique(symbol, nonterminalFirsts);
                
                break;
            }
            
            // Caso seja não-terminal, propaga seus FIRST (exceto épsilon inicialmente)
            for (var k in grammar.firsts[symbol]) {
                var first = grammar.firsts[symbol][k];
                
                epsilonInSymbolFirsts |= first == EPSILON;
                if(first !== EPSILON)
                    result |= addUnique(first, nonterminalFirsts);
            }
            
            // Se este símbolo não pode gerar épsilon, encerra o laço
            if (!epsilonInSymbolFirsts) {
                break;
            }
        }
        
        // Se todos os símbolos puderem gerar épsilon, adiciona épsilon ao FIRST
        if (epsilonInSymbolFirsts) {
            result |= addUnique(EPSILON, nonterminalFirsts);
        }
        
        return result;
    }
    
    // Função interna: calcula iterativamente os conjuntos FOLLOW de todos os não-terminais
    function initializeFollows(grammar) {
        var notDone;
        
        do {
            notDone = false;
            
            for (var i in grammar.rules) {
                var rule = grammar.rules[i];
                
                // O FOLLOW do símbolo inicial sempre contém o marcador de fim de cadeia '$'
                if (i == 0) {
                    var nonterminalFollows = getOrCreateArray(grammar.follows, rule.nonterminal);
                    
                    notDone |= addUnique('$', nonterminalFollows);
                }
                
                // Percorre cada símbolo no lado direito da produção
                for (var j in rule.development) {
                    var symbol = rule.development[j];
                    
                    // FOLLOW é calculado apenas para não-terminais
                    if (isElement(symbol, grammar.nonterminals)) {
                        var symbolFollows = getOrCreateArray(grammar.follows, symbol);
                        var afterSymbolFirsts = grammar.getSequenceFirsts(rule.development.slice(parseInt(j) + 1));
                        
                        for (var k in afterSymbolFirsts) {
                            var first = afterSymbolFirsts[k];
                            
                            // Se após o símbolo pode aparecer épsilon, propaga FOLLOW do lado esquerdo
                            if (first == EPSILON) {
                                var nonterminalFollows = grammar.follows[rule.nonterminal];
                                
                                for (var l in nonterminalFollows) {
                                    notDone |= addUnique(nonterminalFollows[l], symbolFollows);
                                }
                            } else {
                                // Caso contrário, adiciona diretamente o terminal ao FOLLOW
                                notDone |= addUnique(first, symbolFollows);
                            }
                        }
                    }
                }
            }
        } while (notDone);
    }
}


function Rule(grammar, text) {
    // Representa uma regra de produção da gramática: não-terminal -> sequência de símbolos
    
    this.grammar = grammar;
    this.index = grammar.rules.length;
    
    var split = text.split('->');
    
    this.nonterminal = split[0].trim();
    
    this.development = trimElements(split[1].trim().split(' '));
    
    // Converte a regra para a forma textual padrão "A -> α β γ"
    this.toString = function() {
        return this.nonterminal + ' -> ' + this.development.join(' ');
    };


    // Compara duas regras estruturalmente (mesmo não-terminal e mesmo desenvolvimento)
    this.equals = function(that) {
        if (this.nonterminal != that.nonterminal) {
            return false;
        }
        
        if (parseInt(this.development.length) != parseInt(that.development.length)) {
            return false;
        }
        
        for (var i in this.development) {
            if (this.development[i] != that.development[i]) {
                return false;
            }
        }
        
        return true;
    };
}


function BasicItem(rule, dotIndex) {
    // Item LR(0) básico: representa uma produção com um ponto indicando a posição atual
    // Exemplo: A -> α . β
    
    this.rule = rule;
    
    this.dotIndex = dotIndex;
    
    this.lookAheads = [];
    
    // Adiciona este item a uma lista, evitando duplicatas (usando equals)
    this.addUniqueTo = function(items) {
        return addUniqueUsingEquals(this, items);
    };
    
    // Gera novos itens a partir do símbolo após o ponto (fechamento/closure)
    this.newItemsFromSymbolAfterDot = function() {
        var result = [];
        var nonterminalRules = this.rule.grammar.getRulesForNonterminal(this.rule.development[this.dotIndex]);
        
        for (var j in nonterminalRules) {
            addUniqueUsingEquals(new Item(nonterminalRules[j], 0), result);
        }
        
        return result;
    };
    
    // Cria um novo item avançando o ponto uma posição (operação de shift)
    this.newItemAfterShift = function() {
        if (this.dotIndex < this.rule.development.length && this.rule.development[this.dotIndex] != EPSILON) {
            return new Item(this.rule, this.dotIndex + 1);
        }
        
        return undefined;
    }
    
    // Compara itens considerando apenas a regra e a posição do ponto
    this.equals = function(that) {
        return this.rule.equals(that.rule) && (parseInt(this.dotIndex) == parseInt(that.dotIndex));
    };


    // Representação textual do item, com ponto indicando a posição corrente
    this.toString = function() {
        return this.rule.nonterminal + ' -> ' + this.rule.development.slice(0, this.dotIndex).join(' ') + '.' +
                (isElement(EPSILON, this.rule.development) ? '' : this.rule.development.slice(this.dotIndex).join(' '));
    };
}


function BasicLR1Item(rule, dotIndex) {
    // Item LR(1) básico: estende BasicItem adicionando símbolos de lookahead
    
    extend(this, new BasicItem(rule, dotIndex));
    
    var zuper = this.zuper;
    
    // Item inicial recebe lookahead '$', os demais começam sem lookaheads
    this.lookAheads = rule.index == 0 ? ['$'] : [];
    
    // Gera novos itens de fechamento, calculando e propagando lookaheads
    this.newItemsFromSymbolAfterDot = function() {
        var result = this.zuper.newItemsFromSymbolAfterDot();
        
        if (result.length == 0) {
            return result;
        }
        
        var newLookAheads = [];
        var epsilonPresent = false;
        var firstsAfterSymbolAfterDot = this.rule.grammar.getSequenceFirsts(this.rule.development.slice(this.dotIndex + 1));
        
        for (var i in firstsAfterSymbolAfterDot) {
            var first = firstsAfterSymbolAfterDot[i];
            if (EPSILON == first) {
                epsilonPresent = true;
            } else {
                addUnique(first, newLookAheads);
            }
        }
        
        // Se a sequência após o símbolo pode gerar épsilon, propaga lookaheads atuais
        if (epsilonPresent) {
            for (var i in this.lookAheads) {
                addUnique(this.lookAheads[i], newLookAheads);
            }
        }
        
        // Atribui o conjunto de lookaheads calculado a todos os novos itens
        for (var i in result) {
            result[i].lookAheads = newLookAheads.slice(0);
        }
        
        return result;
    };
    
    // Avança o ponto (shift) preservando os lookaheads
    this.newItemAfterShift = function() {
        var result = zuper.newItemAfterShift();
        
        if (result != undefined) {
            result.lookAheads = this.lookAheads.slice(0);
        }
        
        return result;
    }
    
    // Adiciona o item a uma lista; se já existir núcleo igual, mescla lookaheads
    this.addUniqueTo = function(items) {
        var result = false;
        
        for (var i in items) {
            var item = items[i];
            
            if (zuper.equals(item)) {
                for (var i in this.lookAheads) {
                    result |= addUnique(this.lookAheads[i], item.lookAheads);
                }
                
                return result;
            }
        }
        
        items.push(this);
        
        return true;
    };
    
    // Compara itens LR(1) considerando núcleo e conjunto de lookaheads
    this.equals = function(that) {
        return zuper.equals(that) && includeEachOther(this.lookAheads, that.lookAheads);
    }


    // Representação textual do item LR(1), incluindo lookaheads
    this.toString = function() {
        return '[' + zuper.toString() + ', ' + this.lookAheads.join('/') + ']';
    };
}
