// Implementa herança simples copiando propriedades de um objeto para outro
function extend(objekt, zuper) {
    _.extend(objekt, zuper);
    
    objekt.zuper = zuper;
}


// Cria um novo objeto com o protótipo especificado
function newObject(prototype) {
    function F() {
        // Intencionalmente vazio
    }
    
    F.prototype = prototype;
    
    return new F();
}


// Verifica se array1 está contido em array2
function includes(array1, array2) {
    for (var i in array1) {
        if (array2.indexOf(array1[i]) < 0) {
            return false;
        }
    }
    
    return true;
}


// Verifica se dois arrays contêm os mesmos elementos
function includeEachOther(array1, array2) {
    return includes(array1, array2) && includes(array2, array1);
}


// Verifica se array1 está contido em array2, usando equals() para comparação
function includesUsingEquals(array1, array2) {
    for (var i in array1) {
        if (indexOfUsingEquals(array1[i], array2) < 0) {
            return false;
        }
    }
    
    return true;
}


// Verifica se dois arrays contêm elementos equivalentes, usando equals()
function includeEachOtherUsingEquals(array1, array2) {
    return includesUsingEquals(array1, array2) && includesUsingEquals(array2, array1);
}


// Obtém ou cria um array associado a uma chave em um dicionário
function getOrCreateArray(dictionary, key) {
    var result = dictionary[key];
    
    if (result == undefined) {
        result = [];
        dictionary[key] = result;
    }
    
    return result;
}


/**
 * Remove espaços em branco das extremidades de cada elemento do array.
 * Retorna um novo array.
 */
function trimElements(array) {
    var result = [];
    
    for (var i in array) {
        result[i] = array[i].trim();
    }
    
    return result;
}


// Verifica se um elemento está presente no array
function isElement(element, array) {
    for (var i in array) {
        if (element == array[i]) {
            return true;
        }
    }
    
    return false;
}


/**
 * Adiciona um elemento ao array apenas se ele não estiver presente.
 * Retorna true se o array foi modificado.
 */
function addUnique(element, array) {
    if (!isElement(element, array)) {
        array.push(element);
        
        return true;
    }
    
    return false;
}


// Verifica se um elemento está presente no array, usando equals() para comparação
function isElementUsingEquals(element, array) {
    for (var i in array) {
        if (element.equals(array[i])) {
            return true;
        }
    }
    
    return false;
}


/**
 * Adiciona um elemento ao array apenas se não houver elemento equivalente.
 * Usa equals() para comparação.
 * Retorna true se o array foi modificado.
 */
function addUniqueUsingEquals(element, array) {
    if (!isElementUsingEquals(element, array)) {
        array.push(element);
        
        return true;
    }
    
    return false;
}


/**
 * Retorna o índice de um elemento equivalente no array.
 * Usa equals() para comparação.
 * Retorna -1 se não encontrado.
 */
function indexOfUsingEquals(element, array) {
    for (var i in array) {
        if (element.equals(array[i])) {
            return i;
        }
    }
    
    return -1;
}


// Atalho para document.getElementById()
function $(id) {
    return document.getElementById(id);
}


// Verifica igualdade e lança exceção se os valores diferirem
function assertEquality(expected, actual) {
    if (expected != actual) {
        throw 'Assertion failed: expected ' + expected + ' but was ' + actual;
    }
}

// Verifica equivalência usando equals() e lança exceção se diferirem
function assertEquals(expected, actual) {
    if (!expected.equals(actual)) {
        throw 'Assertion failed: expected ' + expected + ' but was ' + actual;
    }
}


// Ajusta o tamanho de um campo de texto baseado no conteúdo
function resize(textInput, minimumSize) {
    textInput.size = Math.max(minimumSize, textInput.value.length);
}
