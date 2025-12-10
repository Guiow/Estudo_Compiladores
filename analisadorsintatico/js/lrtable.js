// Constrói a tabela de parsing LR (ACTION/GOTO) a partir da tabela de fechamento
function LRTable(closureTable) {
    // Tabela de parsing: array de estados, cada estado mapeia símbolos para ações
    
    this.grammar = closureTable.grammar;
    this.states = [];
    
    
    // INICIALIZAÇÃO: constrói a tabela de parsing a partir dos kernels
    
    for (var i in closureTable.kernels) {
        var kernel = closureTable.kernels[i];
        var state = new State(this.states);
        
        // Adiciona ações SHIFT (terminais) e transições GOTO (não-terminais)
        for (var j in kernel.keys) {
            var key = kernel.keys[j];
            var nextStateIndex = kernel.gotos[key];
            
            getOrCreateArray(state, key).push(new LRAction((isElement(key, closureTable.grammar.terminals) ? 's' : ''), nextStateIndex));
        }
        
        // Adiciona ações REDUCE para itens completos (ponto no final)
        for (var j in kernel.closure) {
            var item = kernel.closure[j];
            
            if (item.dotIndex == item.rule.development.length || item.rule.development[0] == EPSILON) {
                for (var k in item.lookAheads) {
                    var lookAhead = item.lookAheads[k];


                    getOrCreateArray(state, lookAhead).push(new LRAction('r', item.rule.index));
                }
            }
        }
    }
}


/**
 * Representa um estado na tabela de parsing LR.
 * Cada estado mapeia símbolos para arrays de ações possíveis.
 */
function State(states) {
    // Cada estado possui um índice único
    
    this.index = states.length;
    
    
    states.push(this);


}


// Representa uma ação individual na tabela LR
function LRAction(actionType, actionValue) {
    // actionType: 's' (shift), 'r' (reduce), '' (goto)
    // actionValue: índice do próximo estado ou da regra a aplicar
    
    this.actionType = actionType;
    this.actionValue = actionValue;
    
    this.toString = function() {
        return this.actionType + this.actionValue;
    };
}


// Escolhe qual ação executar em caso de múltiplas ações (conflito)
function chooseActionElement(state, token) {
    var action = state[token];
    
    if (action == undefined) {
        return undefined;
    }
    
    var radios = document.getElementsByName(state.index + "_" + token);
    
    for (var i = 0; i < radios.length; ++i) {
        if (radios[i].checked) {
            return action[i];
        }
    }


    return action[0];
}
