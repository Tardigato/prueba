class Nodo {
    constructor(id, nombre, x, y) {
        this.id = id;
        this.nombre = nombre;
        this.x = x;
        this.y = y;
    }
}

class Arista {
    constructor(nodoInicio, nodoFin, peso, direccional) {
        this.nodoInicio = nodoInicio;
        this.nodoFin = nodoFin;
        this.peso = peso;
        this.direccional = direccional;
    }
}

let nodeIdCounter = 1;
let nodos = [];
let aristas = [];
let primerNodoParaArista = null;
let stopNodeCreation = false;  // Flag to control node creation
let crearNodoClicked = false;  // Initialize the flag

const lienzo = document.getElementById('lienzo');
const crearNodoButton = document.getElementById('crearNodoButton');

crearNodoButton.addEventListener('click', () => {
    crearNodoClicked = !crearNodoClicked; // Toggle the flag
    if (crearNodoClicked) {
        //alert('Creating nodes is enabled.');
    }
});

lienzo.addEventListener('click', (event) => {
    if (crearNodoClicked) {
        const newNode = createNode(event);
        if (newNode) {
            lienzo.appendChild(newNode);
            crearNodoClicked = false;  // Reset the flag after creating a node
        }
    } else {
        const clickedNode = event.target.closest('.nodo');
        if (clickedNode) {
            crearAristaEntreNodos(clickedNode);
        } else {
            // Show verification message for clicking on the canvas without creating a node
            const canvasRect = lienzo.getBoundingClientRect();
            const x = event.clientX - canvasRect.left;
            const y = event.clientY - canvasRect.top;
            alert(`Click en (${x}, ${y}) en el lienzo.`);
        }
    }
});


lienzo.addEventListener('dblclick', (event) => {
    const clickedNode = event.target.closest('.nodo');
    if (clickedNode) {
        renameNode(clickedNode);
    }
});

document.getElementById('stopNodeCreationButton').addEventListener('click', () => {
    stopNodeCreation = !stopNodeCreation;
    alert(`Node creation is ${stopNodeCreation ? 'stopped' : 'enabled'}.`);
});

function createNode(event) {
    const canvasRect = lienzo.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    const existingNode = nodos.find(node => Math.abs(node.x - x) < 20 && Math.abs(node.y - y) < 20);

    if (existingNode) {
        alert('Ya existe un nodo en estas coordenadas.');
        return null;
    }

    const node = document.createElement('div');
    const nodeId = nodeIdCounter++;

    node.id = `nodo-${nodeId}`;
    node.classList.add('nodo');
    node.style.position = 'absolute';
    node.style.left = `${x - 20}px`;
    node.style.top = `${y - 20}px`;  // Ajusta el origen del nodo al centro
    node.style.width = '40px';
    node.style.height = '40px';
    node.style.backgroundColor = '#47ff94';
    node.style.color = '#000000';
    node.style.borderRadius = '50%';
    node.style.border = '2px solid #000000';
    node.style.display = 'flex';
    node.style.alignItems = 'center';
    node.style.justifyContent = 'center';
    node.style.cursor = 'pointer';
    node.style.zIndex = '1';

    const nodeIdElement = document.createElement('div');
    nodeIdElement.classList.add('nodo-id');
    nodeIdElement.innerText = nodeId;
    node.appendChild(nodeIdElement);

    const newNode = new Nodo(nodeId, nodeId, x, y);
    nodos.push(newNode);

    return node;
}



function renameNode(nodeElement) {
    const nodeIdElement = nodeElement.querySelector('.nodo-id');
    const nodeId = nodeIdElement.innerText;

    const newNode = JSON.parse(nodeElement.dataset.node);
    const newName = prompt('Ingrese el nuevo nombre para el nodo:', newNode.nombre);
    const newId = prompt('Ingrese el nuevo ID para el nodo:', newNode.id);

    if (newName !== null && newId !== null) {
        newNode.nombre = newName;
        newNode.id = newId;
        nodeIdElement.innerText = newId;
        nodeElement.dataset.node = JSON.stringify(newNode);
    }
}

function changeNodeId(nodeId, newId) {
    const nodeToChange = nodos.find(node => node.id === nodeId);

    if (nodeToChange) {
        nodeToChange.id = newId;

        const nodeElement = document.getElementById(`nodo-${nodeId}`);
        if (nodeElement) {
            nodeElement.setAttribute('id', `nodo-${newId}`);
            nodeElement.innerText = newId;
            nodeElement.dataset.node = JSON.stringify(nodeToChange);
        } else {
            alert('No se encontró el nodo en el HTML con el ID especificado.');
        }
    } else {
        alert('No se encontró el nodo con el ID especificado.');
    }
}

function dibujarArista(nodoInicio, nodoFin, peso, isDirectional) {
    const directionalString = isDirectional ? 'sí' : 'no';  // Convertir a string "sí" o "no"

    console.log(`De nodo ${nodoInicio.id} a nodo ${nodoFin.id} - Peso: ${peso}, Direccional: ${directionalString}`);

    // Crear la línea de conexión entre nodos (puedes personalizar esto según tus necesidades)
    const line = document.createElement('div');
    line.classList.add('line');

    // Set z-index of lines lower than nodes
    line.style.zIndex = '0';

    // Calcular el ángulo y la longitud de la línea
    const angle = Math.atan2(nodoFin.y - nodoInicio.y, nodoFin.x - nodoInicio.x);
    const length = Math.sqrt(Math.pow(nodoFin.x - nodoInicio.x, 2) + Math.pow(nodoFin.y - nodoInicio.y, 2));

    // Calcular el centro de la línea
    const centerX = (nodoInicio.x + nodoFin.x) / 2;
    const centerY = (nodoInicio.y + nodoFin.y) / 2;

    // Configurar las propiedades de estilo de la línea
    line.style.position = 'absolute';
    line.style.left = `${nodoInicio.x}px`;  // Ajusta la posición al inicio del nodo
    line.style.top = `${nodoInicio.y}px`;   // Ajusta la posición al inicio del nodo
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}rad)`;
    line.style.transformOrigin = '0 50%';

    // Si la conexión es direccional, añadir la punta de flecha
    if (isDirectional) {
        line.classList.add('arrow');

        // Calcular la posición de la punta de flecha
        const arrowheadPositionX = nodoInicio.x + Math.cos(angle) * (length - 20); // Ajustado por 20 píxeles 
        const arrowheadPositionY = nodoInicio.y + Math.sin(angle) * (length - 20); // Ajustado por 20 píxeles

        // Crear la punta de flecha en la posición calculada
        const arrowhead = document.createElement('div');
        arrowhead.classList.add('arrowhead');
        arrowhead.style.position = 'absolute';
        arrowhead.style.left = `${arrowheadPositionX}px`;
        arrowhead.style.top = `${arrowheadPositionY}px`;
        arrowhead.style.transform = `rotate(${angle}rad)`;
        lienzo.appendChild(arrowhead);
    }

    // Añadir la línea al lienzo
    lienzo.appendChild(line);

    // Añadir un evento de doble clic para editar el peso de la arista
    line.addEventListener('dblclick', () => {
        const newWeight = prompt('Ingrese el nuevo peso para la arista (puede ser decimal):', peso);
        if (newWeight !== null && !isNaN(parseFloat(newWeight))) {
            text.textContent = newWeight;
        } else {
            alert('El peso ingresado no es válido. El peso no se ha actualizado.');
        }
    });

    // Crear un elemento de texto para mostrar el peso de la arista
    const text = document.createElement('div');
    text.classList.add('arista-label');
    text.style.position = 'absolute';

    // Calcular la posición del texto (peso) para que esté en el centro de la línea
    text.style.top = `${centerY}px`;
    text.style.left = `${centerX}px`;
    text.style.transform = 'translate(-50%, -50%)';
    text.textContent = peso;

    // Establecer el z-index del texto inferior al de los nodos
    text.style.zIndex = '1';

    // Añadir el texto al lienzo
    lienzo.appendChild(text);
}


function crearAristaEntreNodos(nodoDestino) {
    if (!primerNodoParaArista) {
        primerNodoParaArista = nodoDestino;
    } else {
        const segundoNodoParaArista = nodoDestino;
        const peso = prompt('Ingrese el peso de la arista (puede ser decimal):');
        if (peso !== null && !isNaN(parseFloat(peso))) {
            const isDirectional = confirm('¿La conexión debe ser direccional?');
            const isDirectionalString = isDirectional ? 'si' : 'no';  // Convertir a string "si" o "no"
            const nuevaArista = new Arista(primerNodoParaArista, segundoNodoParaArista, parseFloat(peso), isDirectionalString);
            aristas.push(nuevaArista);
            dibujarArista(primerNodoParaArista, segundoNodoParaArista, peso, isDirectional);
            primerNodoParaArista = null;
        } else {
            alert('El peso ingresado no es válido. La arista no se ha creado.');
        }
    }
}


document.getElementById('connectNodesButton').addEventListener('click', connectNodesButton);

document.getElementById('renameNodeButton').addEventListener('click', renameNodeButton);

document.getElementById('deleteNodeButton').addEventListener('click', deleteNodeButton);

function connectNodesButton() {
    try {
        const startNodeId = prompt('Ingrese el ID del nodo de inicio:');
        const endNodeId = prompt('Ingrese el ID del nodo de destino:');

        console.log('Attempting to connect nodes with IDs:', startNodeId, 'and', endNodeId);

        if (!startNodeId || !endNodeId) {
            throw new Error('Se deben proporcionar ID de inicio y destino.');
        }

        const startNode = nodos.find(node => String(node.id) === startNodeId);
        const endNode = nodos.find(node => String(node.id) === endNodeId);

        console.log('Start node:', startNode);
        console.log('End node:', endNode);

        if (startNode && endNode) {
            const isDirectional = confirm('¿La conexión debe ser direccional?');
            const weight = prompt('Ingrese el peso de la arista (puede ser decimal):');

            if (weight !== null && !isNaN(parseFloat(weight))) {
                const newEdge = new Arista(startNode, endNode, parseFloat(weight), isDirectional);
                aristas.push(newEdge);

                dibujarArista(startNode, endNode, weight, isDirectional);
            } else {
                alert('El peso ingresado no es válido. La arista no se ha creado.');
            }
        } else {
            alert('No se encontró alguno de los nodos con los ID especificados.');
        }
    } catch (error) {
        console.error('Error connecting nodes:', error.message);
        alert('Error al conectar nodos. Consulta la consola para obtener más información.');
    }
}


function renameNodeButton() {
    const nodeId = prompt('Ingrese el ID del nodo que desea renombrar:');
    const nodeToRename = nodos.find(node => String(node.id) === nodeId);

    if (nodeToRename) {
        const newName = prompt('Ingrese el nuevo nombre para el nodo:', nodeToRename.nombre);
        const newId = prompt('Ingrese el nuevo ID para el nodo:', nodeToRename.id);

        if (newName !== null && newId !== null) {
            nodeToRename.nombre = newName;
            nodeToRename.id = newId;

            const nodeElement = document.getElementById(`nodo-${nodeId}`);
            if (nodeElement) {
                const newNode = createNode(parseFloat(nodeElement.style.left), parseFloat(nodeElement.style.top));
                newNode.id = `nodo-${newId}`;
                newNode.style.left = nodeElement.style.left;
                newNode.style.top = nodeElement.style.top;
                newNode.querySelector('.nodo-id').innerText = newId;
                newNode.dataset.node = JSON.stringify(nodeToRename);
                lienzo.replaceChild(newNode, nodeElement);
            } else {
                alert('No se encontró el nodo en el HTML con el ID especificado.');
            }
        }
    } else {
        alert('No se encontró el nodo con el ID especificado.');
    }
}

function deleteNodeButton() {
    const nodeId = prompt('Ingrese el ID del nodo que desea eliminar:');
    const nodeIndex = nodos.findIndex(node => String(node.id) === nodeId);

    if (nodeIndex !== -1) {
        const nodeToRemove = nodos[nodeIndex];

        nodos.splice(nodeIndex, 1);

        const updatedNodeId = String(nodeToRemove.id);

        const nodeElement = document.getElementById(`nodo-${updatedNodeId}`);
        if (nodeElement) {
            lienzo.removeChild(nodeElement);

            aristas = aristas.filter(arista => arista.nodoInicio !== nodeToRemove && arista.nodoFin !== nodeToRemove);
            
        } else {
            alert('No se encontró el nodo en el HTML con el ID especificado.');
        }
    } else {
        alert('No se encontró el nodo con el ID especificado.');
    }
}

// Asociar funciones a los botones
document.getElementById('guardarGrafo').addEventListener('click', guardarGrafo);
document.getElementById('cargarGrafo').addEventListener('click', cargarGrafo);
document.getElementById('limpiarLienzo').addEventListener('click', limpiarLienzo);
document.getElementById('generarMatrizButton').addEventListener('click', generarMatrizButton);


function guardarGrafo() {
    const grafoHTML = document.getElementById('lienzo');

    // Convertir el contenido HTML a una imagen usando html2canvas
    html2canvas(grafoHTML).then(canvas => {
        // Obtener la URL de los datos de la imagen
        const imageData = canvas.toDataURL('image/jpeg');

        // Crear un enlace temporal (a) para descargar la imagen
        const downloadLink = document.createElement('a');
        downloadLink.href = imageData;
        downloadLink.download = 'grafo.jpg';

        // Agregar el enlace al cuerpo del documento y hacer clic en él para iniciar la descarga
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        const grafo = {
            nodos: nodos,
            aristas: aristas
        };
    
        localStorage.setItem('grafo', JSON.stringify(grafo));
        alert('Grafo guardado exitosamente como imagen (JPG) y en el localStorage.')
    });
}

// Función para cargar el grafo desde el localStorage
function cargarGrafo() {
    const grafoGuardado = localStorage.getItem('grafo');

    if (grafoGuardado) {
        const grafo = JSON.parse(grafoGuardado);

        // Limpiar el lienzo antes de cargar el nuevo grafo
        limpiarLienzo();

        // Crear nodos
        grafo.nodos.forEach(nodo => {
            const node = document.createElement('div');
            node.id = `nodo-${nodo.id}`;
            node.classList.add('nodo');
            node.style.position = 'absolute';
            node.style.left = `${nodo.x - 20}px`;
            node.style.top = `${nodo.y - 20}px`;
            node.style.width = '40px';
            node.style.height = '40px';
            node.style.backgroundColor = '#47ff94';
            node.style.color = '#000000';
            node.style.borderRadius = '50%';
            node.style.border = '2px solid #000000';
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = 'center';
            node.style.cursor = 'pointer';
            node.style.zIndex = '1';

            const nodeIdElement = document.createElement('div');
            nodeIdElement.classList.add('nodo-id');
            nodeIdElement.innerText = nodo.id;
            node.appendChild(nodeIdElement);

            node.dataset.node = JSON.stringify(nodo);

            node.addEventListener('dblclick', (event) => {
                renameNode(node);
            });

            lienzo.appendChild(node);
            nodos.push(nodo);
        });

        // Crear aristas
        grafo.aristas.forEach(arista => {
            const startNode = nodos.find(node => node.id === arista.nodoInicio.id);
            const endNode = nodos.find(node => node.id === arista.nodoFin.id);
            dibujarArista(startNode, endNode, arista.peso);
            aristas.push(arista);
        });

        alert('Grafo cargado exitosamente.');
    } else {
        alert('No se encontró un grafo guardado.');
    }
}


// Función para limpiar el lienzo y eliminar el grafo actual y el almacenamiento local
//function limpiarGrafo() {
    //localStorage.removeItem('grafo');
  //  limpiarLienzo();
    //alert('Grafo limpiado exitosamente.');
//}

// Función para limpiar el lienzo sin afectar el almacenamiento local
function limpiarLienzo() {
    lienzo.innerHTML = '';
    nodos = [];
    aristas = [];
    
}

document.getElementById('generarMatriz').addEventListener('click', generarMatriz);


//-----------------------------------------------------------------------------------------

function generarMatriz() {
    
    
    const nodosTexto = nodos.map(nodo => nodo.id).join('\t');

    console.log(nodosTexto);
    
    // Crear un elemento div para mostrar la información de todos los nodos juntos
    const infoNodoElement = document.createElement('div');
    infoNodoElement.innerText = `  ${nodosTexto}   `;
    infoNodos.appendChild(infoNodoElement);

    // Crear la matriz de adyacencia llena de ceros
    const matriz = Array.from({ length: nodos.length }, () => Array.from({ length: nodos.length }, () => 0));

    // Imprimir la matriz en la consola
    console.log(' '.repeat(8) + `[${nodosTexto}]`);
    nodos.forEach((nodo, i) => {
        const fila = [`[${nodo.id}]`];
        nodos.forEach((nodo, j) => {
            fila.push(matriz[i][j]);
        });
        console.log(`${' '.repeat(8)}${fila.join('    ')}`);
    });
}



// Agrega esta función para actualizar el contenedor de información del nodo
function actualizarInfo(nodo) {
    const infoNodos = document.getElementById('infoNodos');

    const infoNodoElement = document.createElement('div');
    infoNodoElement.innerText = `Nodo ${nodo.nombre} `;

    infoNodos.appendChild(infoNodoElement);
}


// Función para mostrar la matriz en el HTML con valores de aristas
function mostrarMatrizEnHTML(matriz, nodos, aristas) {
    const tabla = document.createElement('table');
    tabla.classList.add('matriz-adyacencia');

    // Agregar encabezados
    const encabezados = tabla.createTHead();
    const filaEncabezados = encabezados.insertRow();
    filaEncabezados.appendChild(document.createElement('th')); // Espacio vacío en la esquina
    nodos.forEach(nodo => {
        const th = document.createElement('th');
        th.textContent = nodo;
        filaEncabezados.appendChild(th);
    });

    // Agregar filas y columnas con valores y pesos de las aristas
    for (let i = 0; i < nodos.length; i++) {
        const fila = tabla.insertRow();
        const th = document.createElement('th');
        th.textContent = nodos[i];
        fila.appendChild(th);

        for (let j = 0; j < nodos.length; j++) {
            const celda = fila.insertCell();
            celda.textContent = matriz[i][j];

            // Si hay una arista entre estos nodos, mostrar el peso
            const arista = aristas.find(a => a.origen === nodos[i] && a.destino === nodos[j]);
            if (arista) {
                celda.textContent += ` (${arista.peso})`;
            }
        }
    }

    const abrirModalButton = document.createElement('button');
    abrirModalButton.textContent = 'Ver Matriz';
    abrirModalButton.onclick = function () {
        mostrarMatrizEnVentana(matriz, nodos, aristas);
    // Agregar la tabla al contenedor deseado (puedes ajustar según tu estructura HTML)

    const contenedorMatriz = document.getElementById('infoNodos');
    contenedorMatriz.innerHTML = '';
    contenedorMatriz.appendChild(tabla);
    contenedorMatriz.appendChild(abrirModalButton);
    }
}


function mostrarMatrizEnVentana(matriz, nodos, aristas) {
    const modal = document.getElementById('matrizModal');
    const matrizContainer = document.getElementById('matrizContainer');

    // Llenar la subventana con la matriz
    const tablaModal = document.createElement('table');
    // ... (código para llenar la tabla, similar a mostrarMatrizEnHTML)

    matrizContainer.innerHTML = '';
    matrizContainer.appendChild(tablaModal);

    // Mostrar la subventana
    modal.style.display = 'block';
}

// Función para cerrar la subventana
function cerrarModal() {
    const modal = document.getElementById('matrizModal');
    modal.style.display = 'none';
}


//-----------------------------------------------------------------------------------------------------------------------------------


function obtenerAristas() {
    const aristas = [];

    aristasSVG.forEach(aristaSVG => {
        const idArista = parseInt(aristaSVG.id);
        const nodoInicioID = parseInt(aristaSVG.dataset.nodoInicio);
        const nodoFinID = parseInt(aristaSVG.dataset.nodoFin);
        const peso = parseFloat(aristaSVG.dataset.peso);
        const isDirectional = aristaSVG.dataset.direccional === "true";

        const nodoInicio = nodos.find(nodo => nodo.id === nodoInicioID);
        const nodoFin = nodos.find(nodo => nodo.id === nodoFinID);

        const arista = new Arista(nodoInicio, nodoFin, peso, isDirectional);
        aristas.push(arista);
    });

    return aristas;
}



function obtenerNodos() {
    const nodos = [];
    const nodosElements = document.querySelectorAll('.nodo');
    nodosElements.forEach(element => {
        const nodeDataString = element.dataset.node;

        // Verificar si el atributo data-node está presente y no es undefined
        if (nodeDataString !== undefined) {
            console.log('Contenido de data-node:', nodeDataString);

            try {
                const nodeData = JSON.parse(nodeDataString);
                nodos.push({ nombre: nodeData.nombre, aristas: [] });
            } catch (error) {
                console.error('Error al analizar el JSON de data-node:', error);
            }
        }
    });

    alert('Nodos obtenidos: ' + JSON.stringify(nodos));

    return nodos;
}


function obtenerNodoDestino(aristaElement) {
    const rect = aristaElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let distanciaNodoMasCercano = Number.MAX_SAFE_INTEGER;
    let nodoMasCercano = null;

    nodos.forEach((currentNode) => {
        if (typeof currentNode.x === 'number' && typeof currentNode.y === 'number') {
            const distanceToCurrent = Math.hypot(centerX - currentNode.x, centerY - currentNode.y);

            if (distanceToCurrent < distanciaNodoMasCercano) {
                distanciaNodoMasCercano = distanceToCurrent;
                nodoMasCercano = currentNode;
            }
        }
    });

    return nodoMasCercano;
}




function imprimirNodosAristas() {
    console.log('Nodos:');
    nodos.forEach(nodo => {
        console.log(`Nodo ${nodo.id} - x: ${nodo.x}, y: ${nodo.y}`);
    });

    console.log('Aristas:');
    aristas.forEach(arista => {
        const direccionalTexto = arista.direccional ? 'si' : 'no';
        console.log(`De nodo ${arista.nodoInicio.id} a nodo ${arista.nodoFin.id} - Peso: ${arista.peso}, Direccional: ${direccionalTexto}`);
    });
}
