const test = require("node:test");
const assert = require("node:assert/strict");
const CalculadoraGastos = require("../js/logica-gastos.js");

test("registra un gasto válido y calcula el resumen", () => {
  const logica = new CalculadoraGastos();
  const respuesta = logica.procesarSolicitud({
    tipo: "AGREGAR_GASTO",
    datos: { descripcion: "Almuerzo", categoria: "Alimentación", monto: 18.5 }
  });

  assert.equal(respuesta.exito, true);
  assert.equal(respuesta.datos.resumen.total, 18.5);
  assert.equal(respuesta.datos.resumen.cantidad, 1);
  assert.equal(respuesta.datos.resumen.promedio, 18.5);
  assert.equal(respuesta.datos.resumen.categoriaPrincipal, "Alimentación");
});

test("rechaza datos inválidos sin modificar el estado", () => {
  const logica = new CalculadoraGastos();
  const respuesta = logica.procesarSolicitud({
    tipo: "AGREGAR_GASTO",
    datos: { descripcion: "", categoria: "Otros", monto: 0 }
  });

  assert.equal(respuesta.exito, false);
  assert.equal(respuesta.datos.resumen.cantidad, 0);
  assert.ok(respuesta.errores.descripcion);
  assert.ok(respuesta.errores.monto);
});

test("acumula gastos y detecta la categoría principal", () => {
  const logica = new CalculadoraGastos();

  logica.procesarSolicitud({
    tipo: "AGREGAR_GASTO",
    datos: { descripcion: "Bus", categoria: "Transporte", monto: 4 }
  });
  const respuesta = logica.procesarSolicitud({
    tipo: "AGREGAR_GASTO",
    datos: { descripcion: "Taxi", categoria: "Transporte", monto: 16 }
  });

  assert.equal(respuesta.datos.resumen.total, 20);
  assert.equal(respuesta.datos.resumen.promedio, 10);
  assert.equal(respuesta.datos.resumen.categoriaPrincipal, "Transporte");
});

test("elimina un gasto y recalcula el total", () => {
  const logica = new CalculadoraGastos();
  const creada = logica.procesarSolicitud({
    tipo: "AGREGAR_GASTO",
    datos: { descripcion: "Libro", categoria: "Estudios", monto: 35 }
  });

  const eliminada = logica.procesarSolicitud({
    tipo: "ELIMINAR_GASTO",
    datos: { id: creada.datos.gasto.id }
  });

  assert.equal(eliminada.exito, true);
  assert.equal(eliminada.datos.resumen.total, 0);
  assert.equal(eliminada.datos.resumen.cantidad, 0);
});
