// Formata a tabela de fechamento LR para exibição em HTML
function formatLRClosureTable(lrClosureTable) {
    var result = "<table border=\"1\">";
    result += "<thead><tr><th colspan=\"4\">" + Item.prototype.grammarType + " closure table</th></tr><tr><th>Goto</th><th>Kernel</th><th>State</th><th>Closure</th></tr></thead>";
    result += "<tbody id=\"lrClosureTableRows\">";
    
    var kernel0 = lrClosureTable.kernels[0];
    
    // Primeira linha: estado inicial (sem transição de entrada)
    result += "<tr><td></td><td>{" + formatItems(kernel0.items) +
            "}</td><td style=\"color: blu;\">" + 0 + "</td><td>{" + formatItems(kernel0.closure) + "}</td></tr>";
    
    var done = [0];
    
    // Para cada kernel, exibe suas transições GOTO
    for (var i in lrClosureTable.kernels) {
        var kernel = lrClosureTable.kernels[i];
        
        for (var j in kernel.keys) {
            var key = kernel.keys[j];
            var targetKernel = lrClosureTable.kernels[kernel.gotos[key]];
            result += "<tr><td>goto(" + kernel.index + ", " + key + ")</td><td>{" + formatItems(targetKernel.items) +
                    "}</td><td style=\"color: bue;\">" + targetKernel.index + "</td><td>" +
                    (isElement(targetKernel.index, done) ? "&nbsp;" : "{" + formatItems(targetKernel.closure) + "}") +
                    "</td></tr>";
            addUnique(targetKernel.index, done);
        }
    }
    
    result += "</tbody>";
    result += "</table>";
    
    return result;
}


// Formata uma lista de itens, destacando itens finais (de redução) em verde
function formatItems(items) {
    var formattedItems = [];
    
    for (var i in items) {
        var item = items[i];
        var itemIsFinal = item.dotIndex == item.rule.development.length || EPSILON == item.rule.development[0];
        
        formattedItems.push(itemIsFinal ? "<span style=\"color: green;\">" + item + "</span>" : item);
    }
    
    return formattedItems.join('; ');
}
