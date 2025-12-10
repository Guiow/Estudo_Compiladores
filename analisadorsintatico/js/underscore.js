(function() {


  // Configuração inicial
  // --------------------


  // Estabelece o objeto raiz, `window` no navegador, ou `global` no servidor.
  var root = this;


  // Salva o valor anterior da variável `_`.
  var previousUnderscore = root._;


  // Estabelece o objeto que é retornado para sair de uma iteração de loop.
  var breaker = {};


  // Economiza bytes na versão minificada (mas não gzipada):
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;


  // Cria variáveis de referência rápida para acesso veloz aos protótipos principais.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;


  // Todas as implementações de funções nativas do **ECMAScript 5** que esperamos usar
  // são declaradas aqui.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;


  // Cria uma referência segura ao objeto Underscore para uso abaixo.
  var _ = function(obj) { return new wrapper(obj); };


  // Exporta o objeto Underscore para **CommonJS**, com retrocompatibilidade
  // para a antiga API `require()`. Se não estivermos em CommonJS, adiciona `_` ao
  // objeto global.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    // Exportado como string, para o modo "avançado" do Closure Compiler.
    root['_'] = _;
  }


  // Versão atual.
  _.VERSION = '1.1.7';


  // Funções de Coleção
  // ------------------


  // A pedra angular, uma implementação de `each`, também conhecida como `forEach`.
  // Lida com objetos com o `forEach` nativo, arrays e objetos brutos.
  // Delega para o `forEach` nativo do **ECMAScript 5** se disponível.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };


  // Retorna os resultados da aplicação do iterador a cada elemento.
  // Delega para o `map` nativo do **ECMAScript 5** se disponível.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };


  // **Reduce** constrói um único resultado a partir de uma lista de valores, também conhecido como `inject`,
  // ou `foldl`. Delega para o `reduce` nativo do **ECMAScript 5** se disponível.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };


  // A versão associativa à direita de reduce, também conhecida como `foldr`.
  // Delega para o `reduceRight` nativo do **ECMAScript 5** se disponível.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };


  // Retorna o primeiro valor que passa em um teste de verdade. Com alias `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };


  // Retorna todos os elementos que passam em um teste de verdade.
  // Delega para o `filter` nativo do **ECMAScript 5** se disponível.
  // Com alias `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };


  // Retorna todos os elementos para os quais um teste de verdade falha.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };


  // Determina se todos os elementos correspondem a um teste de verdade.
  // Delega para o `every` nativo do **ECMAScript 5** se disponível.
  // Com alias `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };


  // Determina se pelo menos um elemento no objeto corresponde a um teste de verdade.
  // Delega para o `some` nativo do **ECMAScript 5** se disponível.
  // Com alias `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result |= iterator.call(context, value, index, list)) return breaker;
    });
    return !!result;
  };


  // Determina se um dado valor está incluído no array ou objeto usando `===`.
  // Com alias `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };


  // Invoca um método (com argumentos) em cada item de uma coleção.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };


  // Versão conveniente de um caso de uso comum de `map`: buscar uma propriedade.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };


  // Retorna o elemento máximo ou (computação baseada em elemento).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };


  // Retorna o elemento mínimo (ou computação baseada em elemento).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };


  // Ordena os valores do objeto por um critério produzido por um iterador.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };


  // Agrupa os valores do objeto por um critério produzido por um iterador
  _.groupBy = function(obj, iterator) {
    var result = {};
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };


  // Usa uma função comparadora para descobrir em qual índice um objeto deve
  // ser inserido para manter a ordem. Usa busca binária.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };


  // Converte com segurança qualquer coisa iterável em um array real e ativo.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };


  // Retorna o número de elementos em um objeto.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };


  // Funções de Array
  // ----------------


  // Obtém o primeiro elemento de um array. Passar **n** retornará os primeiros N
  // valores no array. Com alias `head`. A verificação **guard** permite que funcione
  // com `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };


  // Retorna tudo exceto a primeira entrada do array. Com alias `tail`.
  // Especialmente útil no objeto arguments. Passar um **index** retornará
  // o resto dos valores no array a partir daquele índice em diante. A verificação **guard**
  // permite que funcione com `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };


  // Obtém o último elemento de um array.
  _.last = function(array) {
    return array[array.length - 1];
  };


  // Remove todos os valores falsos de um array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };


  // Retorna uma versão completamente achatada de um array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };


  // Retorna uma versão do array que não contém o(s) valor(es) especificado(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };


  // Produz uma versão sem duplicatas do array. Se o array já foi
  // ordenado, você tem a opção de usar um algoritmo mais rápido.
  // Com alias `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };


  // Produz um array que contém a união: cada elemento distinto de todos os
  // arrays passados.
  _.union = function() {
    return _.uniq(_.flatten(arguments));
  };


  // Produz um array que contém cada item compartilhado entre todos os
  // arrays passados. (Com alias "intersect" para retrocompatibilidade.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };


  // Pega a diferença entre um array e outro.
  // Apenas os elementos presentes no primeiro array permanecerão.
  _.difference = function(array, other) {
    return _.filter(array, function(value){ return !_.include(other, value); });
  };


  // Agrupa múltiplas listas em um único array -- elementos que compartilham
  // um índice ficam juntos.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };


  // Se o navegador não fornece indexOf (estou olhando para você, **MSIE**),
  // precisamos desta função. Retorna a posição da primeira ocorrência de um
  // item em um array, ou -1 se o item não está incluído no array.
  // Delega para o `indexOf` nativo do **ECMAScript 5** se disponível.
  // Se o array é grande e já está em ordem, passe `true`
  // para **isSorted** para usar busca binária.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };



  // Delega para o `lastIndexOf` nativo do **ECMAScript 5** se disponível.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };


  // Gera um Array de inteiros contendo uma progressão aritmética. Uma adaptação da
  // função nativa `range()` do Python. Veja
  // [a documentação do Python](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;


    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);


    while(idx < len) {
      range[idx++] = start;
      start += step;
    }


    return range;
  };


  // Funções de Função
  // ------------------


  // Cria uma função vinculada a um dado objeto (atribuindo `this`, e argumentos,
  // opcionalmente). Vinculação com argumentos também é conhecida como `curry`.
  // Delega para o `Function.bind` nativo do **ECMAScript 5** se disponível.
  // Verificamos `func.bind` primeiro, para falhar rapidamente quando `func` é undefined.
  _.bind = function(func, obj) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(slice.call(arguments)));
    };
  };


  // Vincula todos os métodos de um objeto a esse objeto. Útil para garantir que
  // todos os callbacks definidos em um objeto pertencem a ele.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };


  // Memoriza uma função cara armazenando seus resultados.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };


  // Atrasa uma função pelo número dado de milissegundos, e então a chama
  // com os argumentos fornecidos.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };


  // Adia uma função, agendando-a para ser executada após a pilha de chamadas atual ter
  // sido limpa.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };


  // Função interna usada para implementar `_.throttle` e `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };


  // Retorna uma função que, quando invocada, será acionada no máximo uma vez
  // durante uma dada janela de tempo.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };


  // Retorna uma função que, enquanto continuar a ser invocada, não
  // será acionada. A função será chamada depois de parar de ser chamada por
  // N milissegundos.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };


  // Retorna uma função que será executada no máximo uma vez, não importa quantas
  // vezes você a chame. Útil para inicialização preguiçosa.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };


  // Retorna a primeira função passada como argumento para a segunda,
  // permitindo ajustar argumentos, executar código antes e depois, e
  // executar condicionalmente a função original.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };


  // Retorna uma função que é a composição de uma lista de funções, cada
  // uma consumindo o valor de retorno da função que a segue.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };


  // Retorna uma função que só será executada após ser chamada N vezes.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };



  // Funções de Objeto
  // -----------------


  // Recupera os nomes das propriedades de um objeto.
  // Delega para o `Object.keys` nativo do **ECMAScript 5**
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };


  // Recupera os valores das propriedades de um objeto.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };


  // Retorna uma lista ordenada dos nomes de funções disponíveis no objeto.
  // Com alias `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };


  // Estende um dado objeto com todas as propriedades do(s) objeto(s) passado(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };


  // Preenche um dado objeto com propriedades padrão.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };


  // Cria uma duplicata (clone superficial) de um objeto.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };


  // Invoca interceptor com o obj, e então retorna obj.
  // O propósito principal deste método é "entrar" em uma cadeia de métodos, a fim
  // de realizar operações em resultados intermediários dentro da cadeia.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };


  // Realiza uma comparação profunda para verificar se dois objetos são iguais.
  _.isEqual = function(a, b) {
    // Verifica identidade de objeto.
    if (a === b) return true;
    // Tipos diferentes?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Teste básico de igualdade (cuidado com coerções).
    if (a == b) return true;
    // Um é falso e o outro verdadeiro.
    if ((!a && b) || (a && !b)) return false;
    // Desembrulha quaisquer objetos embrulhados.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Um deles implementa um isEqual()?
    if (a.isEqual) return a.isEqual(b);
    if (b.isEqual) return b.isEqual(a);
    // Verifica valores inteiros de datas.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Ambos são NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compara expressões regulares.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // Se a não é um objeto neste ponto, não podemos lidar com ele.
    if (atype !== 'object') return false;
    // Verifica comprimentos de array diferentes antes de comparar conteúdos.
    if (a.length && (a.length !== b.length)) return false;
    // Nada mais funcionou, compara profundamente os conteúdos.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Tamanhos de objeto diferentes?
    if (aKeys.length != bKeys.length) return false;
    // Comparação recursiva de conteúdos.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };


  // Um dado array ou objeto está vazio?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };


  // Um dado valor é um elemento DOM?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };


  // Um dado valor é um array?
  // Delega para Array.isArray nativo do ECMA5
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };


  // Uma dada variável é um objeto?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };


  // Uma dada variável é um objeto arguments?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };


  // Um dado valor é uma função?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };


  // Um dado valor é uma string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };


  // Um dado valor é um número?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };


  // O valor dado é `NaN`? `NaN` acontece de ser o único valor em JavaScript
  // que não é igual a si mesmo.
  _.isNaN = function(obj) {
    return obj !== obj;
  };


  // Um dado valor é um booleano?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };


  // Um dado valor é uma data?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };


  // O valor dado é uma expressão regular?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };


  // Um dado valor é igual a null?
  _.isNull = function(obj) {
    return obj === null;
  };


  // Uma dada variável é undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };


  // Funções Utilitárias
  // -------------------


  // Executa Underscore.js no modo *noConflict*, retornando a variável `_` para seu
  // proprietário anterior. Retorna uma referência ao objeto Underscore.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };


  // Mantém a função identidade por perto para iteradores padrão.
  _.identity = function(value) {
    return value;
  };


  // Executa uma função **n** vezes.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };


  // Adicione suas próprias funções personalizadas ao objeto Underscore, garantindo que
  // elas sejam corretamente adicionadas ao wrapper OOP também.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };


  // Gera um id inteiro único (único dentro de toda a sessão do cliente).
  // Útil para ids DOM temporários.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };


  // Por padrão, Underscore usa delimitadores de template estilo ERB, altere as
  // seguintes configurações de template para usar delimitadores alternativos.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };


  // Micro-templating JavaScript, similar à implementação de John Resig.
  // Templating do Underscore lida com delimitadores arbitrários, preserva espaços em branco,
  // e escapa corretamente aspas dentro de código interpolado.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };


  // O Wrapper OOP
  // -------------


  // Se Underscore é chamado como uma função, ele retorna um objeto embrulhado que
  // pode ser usado no estilo OO. Este wrapper mantém versões alteradas de todas as
  // funções underscore. Objetos embrulhados podem ser encadeados.
  var wrapper = function(obj) { this._wrapped = obj; };


  // Expõe `wrapper.prototype` como `_.prototype`
  _.prototype = wrapper.prototype;


  // Função auxiliar para continuar encadeando resultados intermediários.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };


  // Um método para adicionar facilmente funções ao wrapper OOP.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };


  // Adiciona todas as funções do Underscore ao objeto wrapper.
  _.mixin(_);


  // Adiciona todas as funções mutadoras de Array ao wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });


  // Adiciona todas as funções acessoras de Array ao wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });


  // Inicia o encadeamento de um objeto Underscore embrulhado.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };


  // Extrai o resultado de um objeto embrulhado e encadeado.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };


})();
