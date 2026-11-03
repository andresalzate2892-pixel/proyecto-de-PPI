const negocioService = require('../../services/emprendimiento/negocio.service');

async function getAll(req, res, next) {
  try {
    const negocios = await negocioService.getAll(req.query.userId);
    res.json(negocios);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const negocio = await negocioService.getById(req.params.id);
    res.json(negocio);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const negocio = await negocioService.create(req.body);
    res.status(201).json(negocio);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const negocio = await negocioService.update(req.params.id, req.body);
    res.json(negocio);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await negocioService.remove(req.params.id);
    res.json({});
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
