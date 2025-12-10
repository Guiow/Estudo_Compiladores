// Item SLR: herda de BasicItem e usa FOLLOW como lookahead
function Item(rule, dotIndex) {
    // Item SLR é um item LR(0) que utiliza o conjunto FOLLOW do não-terminal
    // como símbolos de lookahead para decidir quando reduzir
    
    extend(this, new BasicItem(rule, dotIndex));
    
    this.lookAheads = rule.grammar.follows[rule.nonterminal];
}


// Identificador do tipo de gramática sendo processada
Item.prototype.grammarType = 'SLR';
