// En tu archivo ../utils/functions.js

// Usamos window para hacerlo accesible globalmente
window.agregarAlCarrito = (idProducto) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ id: idProducto, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    console.log('Producto agregado:', idProducto);
};

const actualizarContadorCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contadorElemento = document.querySelector('.fa-bag-shopping + span');
    if (contadorElemento) {
        contadorElemento.textContent = total;
    }
};

// Se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);