/**
 * Executa o parsing da entrada usando o algoritmo LR bottom-up.
 * Pré-requisito: formatInitialParseView() deve ter sido chamado antes.
 */
function parseInput() {
    // Pilha do analisador: alterna estados e símbolos [estado0, símbolo1, estado1, ...]
    var stack = [0];
    
    // Retorna o estado no topo da pilha
    function stateIndex() {
        return stack[2 * ((stack.length - 1) >> 1)];
    }
    
    var tokens = ($('input').value.trim() + ' $').split(' ');
    var maximumStepCount = parseInt($('maximumStepCount').value);
    var tokenIndex = 0;
    var token = tokens[tokenIndex];
    var state = lrTable.states[stateIndex()];
    var action = state[token];
    var actionElement = chooseActionElement(state, token);
    var rows = "<tr><td>1</td><td>" + formatStack(stack) + "</td><td>" + tokens.slice(tokenIndex).join(' ') + "</td><td>" + formatAction(state, token, false) + "</td><td id=\"tree\" style=\"vertical-align: top;\"></td></tr>\n";
    var i = 2;
    
    // Loop principal do parsing
    while (i <= maximumStepCount && action != undefined && actionElement != 'r0') {
        if (actionElement.actionType == 's') {
            // SHIFT: empilha token e vai para próximo estado
            stack.push(tokens[tokenIndex++]);
            stack.push(parseInt(actionElement.actionValue));
        } else if (actionElement.actionType == 'r') {
            // REDUCE: aplica uma regra, reduzindo símbolos na pilha
            var ruleIndex = actionElement.actionValue;
            var rule = lrTable.grammar.rules[ruleIndex];
            var removeCount = isElement(EPSILON, rule.development) ? 0 : rule.development.length * 2;
            var removedElements = stack.splice(stack.length - removeCount, removeCount);
            var node = new Tree(rule.nonterminal, []);
            
            for (var j = 0; j < removedElements.length; j += 2) {
                node.children.push(removedElements[j]);
            }
            
            stack.push(node);
        } else {
            // GOTO: empilha próximo estado
            stack.push(parseInt(actionElement));
        }
        
        var state = lrTable.states[stateIndex()];
        var token = stack.length % 2 == 0 ? stack[stack.length - 1] : tokens[tokenIndex];
        action = state[token];
        actionElement = chooseActionElement(state, token);
        
        rows += "<tr><td>" + i + "</td><td>" + formatStack(stack) + "</td><td>" + tokens.slice(tokenIndex).join(' ') + "</td><td>" + formatAction(state, token, false) + "</td></tr>\n";
        ++i;
    }
    
    $('traceAndTreeRows').innerHTML = rows;
    $('tree').rowSpan = i + 1;
    $('tree').innerHTML = "&nbsp";
    
    $('maximumStepCount').style.color = 'black';
    
    if (action == 'r0') {
        // ACEITO: parsing bem-sucedido
        $('input').style.color = 'green';
        $('tree').innerHTML = formatTree(stack[1]);
    } else if (action == undefined) {
        // REJEITADO: erro de sintaxe
        $('input').style.color = 'red';
    } else {
        // INCOMPLETO: limite de passos atingido
        $('input').style.color = 'orange';
        $('maximumStepCount').style.color = 'orange';
    }
}


// Cria a interface inicial para visualização do parsing
function formatInitialParseView(input, maximumStepCount) {
    var result = "<p>Input (tokens): <input id=\"input\" type=\"text\" size=\"" + input.length + "\" onkeyup=\"resize(this, 1);\" onchange=\"parseInput();\" value=\"" + input + "\"></p>";
    result += "<p>Maximum number of steps: <input id=\"maximumStepCount\" type=\"text\" size=\""+ maximumStepCount.toString().length + "\" onkeyup=\"resize(this, 1);\" onchange=\"parseInput();\" value=\"" + maximumStepCount + "\"></p>";
    result += "<p><input type=\"button\" value=\"PARSE\"></p>";
    result += "<br>";
    result += "<table border=\"6\">";
    result += "<thead>";
    result += "<tr><th colspan=\"4\">Trace</th><th rowspan=\"2\">Tree</th></tr>";
    result += "<tr><th>Step</th><th>Stack</th><th>Input</th><th>Action</th></tr>";
    result += "</thead>";
    result += "<tbody id=\"traceAndTreeRows\">";
    result += "</tbody>";
    result += "</table>";
    result += "</div>";
    result += "</td></tr></tbody></table>";
    
    return result;
}


// Formata a pilha destacando os estados em azul
function formatStack(stack) {
    var result = stack.slice(0);
    
    for (var i = 0; i < result.length; i += 2) {
        result[i] = "<span style=\"color: ble;\">" + result[i] + "</span>";
    }
    
    return result.join(' ');
}
