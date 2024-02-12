async function cargarProductos() {
    const response = await fetch('http://localhost:3000/productos');
    const productos = await response.json();

    const galeriaProductos = document.getElementById('galeriaProductos');

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text precio">${producto.precio} €</p>
                    <button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id}, event)">Agregar al Carrito</button>
                </div>
            </div>
        `;
        galeriaProductos.appendChild(card);
    });
}

async function agregarAlCarrito(id, event) {
    const agregarBtn = event.currentTarget;
    agregarBtn.disabled = true;

    try {
        let carrito = await obtenerCarrito();
        const producto = await obtenerProductoPorId(id);

        carrito[producto.nombre] = (carrito[producto.nombre] || 0) + 1;

        await guardarCarrito(carrito);

        mostrarCarrito();
        mostrarPrecioTotal();
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
    } finally {
        agregarBtn.disabled = false;
    }
}

async function obtenerCarrito() {
    const response = await fetch('http://localhost:3000/carrito');
    return await response.json();
}

async function obtenerProductoPorId(id) {
    const response = await fetch(`http://localhost:3000/productos/${id}`);
    return await response.json();
}

async function guardarCarrito(carrito) {
    await fetch('http://localhost:3000/carrito', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(carrito)
    });
}

function eliminarDelCarrito(producto) {
    obtenerCarrito().then(carrito => {
        if (carrito[producto] > 1) {
            carrito[producto] -= 1;
        } else {
            delete carrito[producto];
        }

        guardarCarrito(carrito);
        mostrarCarrito();
        mostrarPrecioTotal();
        location.reload(); // Actualizar la página
    });
}

function borrarCarrito() {
    fetch('http://localhost:3000/carrito', {
        method: 'DELETE'
    }).then(() => {
        mostrarCarrito();
        mostrarPrecioTotal();
        location.reload(); // Actualizar la página
    });
}

function comprar() {
    alert('Gracias por tu compra!');
    borrarCarrito();
}

function calcularPrecioTotal() {
    let precioTotal = 0;

    obtenerCarrito().then(carrito => {
        for (const producto in carrito) {
            const cantidad = carrito[producto];
            const precioElement = document.querySelector(`[alt="${producto}"] + .card-body .precio`);

            if (precioElement) {
                let precioUnitario = parseFloat(precioElement.textContent.replace(/[^\d.]/g, ''));
                precioTotal += cantidad * precioUnitario;
            } else {
                console.error(`No se encontró el elemento de precio para el producto: ${producto}`);
            }
        }

        return precioTotal;
    }).then(precioTotal => {
        const precioTotalElement = document.getElementById('precioTotal');
        precioTotalElement.textContent = `${precioTotal.toFixed(2)}`;
    });
}

function mostrarCarrito() {
    const carritoElement = document.getElementById('carrito');
    const cantidadCarritoElement = document.getElementById('cantidadCarrito');

    obtenerCarrito().then(carrito => {
        const cantidadTotal = Object.values(carrito).reduce((total, cantidad) => total + cantidad, 0);
        cantidadCarritoElement.textContent = cantidadTotal;

        carritoElement.innerHTML = '';
        for (const producto in carrito) {
            const cantidad = carrito[producto];
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="img/${producto.replace(/\s/g, '')}.jpeg" alt="${producto}" class="img-thumbnail" width="30" style="margin-right: 10px;">
                        <div>${producto} - Cantidad: ${cantidad}</div>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito('${producto}')">Eliminar</button>
                </div>
            `;

            carritoElement.appendChild(listItem);
        }
    });
}

function mostrarPrecioTotal() {
    calcularPrecioTotal();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    mostrarCarrito();
    mostrarPrecioTotal();
});
