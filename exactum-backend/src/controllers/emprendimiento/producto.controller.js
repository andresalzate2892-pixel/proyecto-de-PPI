const productoService = require('../../services/emprendimiento/producto.service');

async function getAll(req, res, next) {
  try {
    const productos = await productoService.getAll(req.query.negocioId);
    res.json(productos);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const producto = await productoService.getById(req.params.id);
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const producto = await productoService.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const producto = await productoService.update(req.params.id, req.body);
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await productoService.remove(req.params.id);
    res.json({});
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
