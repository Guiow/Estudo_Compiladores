// Formata recursivamente a árvore de derivação para exibição em HTML
function formatTree(tree) {
    if (!(tree instanceof Tree)) {
        return tree.toString();
    }
    
    var result = tree.value;
    
    if (0 < tree.children.length) {
        result = "<table border=\"1\"><thead><tr><th colspan=\"" + tree.children.length + "\">" + result + "</th></tr></thead><tbody><tr>";
        
        for (var i in tree.children) {
            result += "<td style=\"vertical-align: top;\">" + formatTree(tree.children[i]) + "</td>";
        }
        
        result += "</tr></tbody></table>"
    }
    
    return result;
}
