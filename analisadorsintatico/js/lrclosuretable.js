// Constrói a tabela de fechamento LR (conjunto de todos os estados do autômato)
function LRClosureTable(grammar) {
    // Estruturas principais: a gramática e os kernels (estados)
    
    this.grammar = grammar;
    this.kernels = [];
    
    
    // INICIALIZAÇÃO: constrói iterativamente todos os estados do autômato
    
    // Estado inicial: kernel contendo o item [S' -> .S]
    this.kernels.push(new Kernel(0, [new Item(grammar.rules[0], 0)], grammar));
    
    // Processa cada kernel, calculando fechamento e transições GOTO
    for (var i = 0; i < this.kernels.length;) {
        var kernel = this.kernels[i];
        
        updateClosure(kernel);
        
        // Se addGotos propagou lookaheads, reinicia do início (para LALR)
        if (addGotos(kernel, this.kernels)) {
            i = 0;
        } else {
            ++i;
        }
    }
    
    
    // Calcula o fechamento (closure) de um kernel
    function updateClosure(kernel) {
        for (var i = 0; i < kernel.closure.length; ++i) {
            var newItemsFromSymbolAfterDot = kernel.closure[i].newItemsFromSymbolAfterDot();
            
            for (var j in newItemsFromSymbolAfterDot) {
                newItemsFromSymbolAfterDot[j].addUniqueTo(kernel.closure);
            }
        }
    }
    
    // Adiciona as transições GOTO a partir de um kernel, gerando novos kernels se necessário
    function addGotos(kernel, kernels) {
        var lookAheadsPropagated = false;
        var newKernels = new Object();
        
        // Para cada item no fechamento, tenta criar novo item avançando o ponto
        for (var i in kernel.closure) {
            var item = kernel.closure[i];
            var newItem = item.newItemAfterShift();
            
            if (newItem != undefined) {
                var symbolAfterDot = item.rule.development[item.dotIndex];
                
                addUnique(symbolAfterDot, kernel.keys);
                newItem.addUniqueTo(getOrCreateArray(newKernels, symbolAfterDot));
            }
        }
        
        // Para cada símbolo que gera transição, cria ou reutiliza kernel de destino
        for (var i in kernel.keys) {
            var key = kernel.keys[i];
            var newKernel = new Kernel(kernels.length, newKernels[key], grammar);
            var targetKernelIndex = indexOfUsingEquals(newKernel, kernels);
            
            if (targetKernelIndex < 0) {
                // Kernel novo: adiciona à lista
                kernels.push(newKernel);
                targetKernelIndex = newKernel.index;
            } else {
                // Kernel já existe: mescla lookaheads (para LALR)
                for (var j in newKernel.items) {
                    lookAheadsPropagated |= newKernel.items[j].addUniqueTo(kernels[targetKernelIndex].items);
                }
            }
            
            kernel.gotos[key] = targetKernelIndex;
        }
        
        return lookAheadsPropagated;
    }
}


// Representa um estado (kernel + closure) do autômato LR
function Kernel(index, items, grammar) {
    // Kernel: conjunto de itens que caracteriza o estado
    // Closure: fechamento do kernel (todos os itens derivados)
    // Gotos: mapeamento símbolo -> índice do estado destino
    
    this.index = index;
    this.items = items;
    this.closure = this.items.slice(0);
    this.gotos = new Object();
    this.keys = [];
    
    // Compara kernels pela igualdade de seus itens (núcleos)
    this.equals = function(that) {
        return includeEachOtherUsingEquals(this.items, that.items);
    };
    
    // Representação textual do kernel e seu fechamento
    this.toString = function() {
        return 'closure{' + this.items + '} = {' + this.closure + '}';
    };
}
