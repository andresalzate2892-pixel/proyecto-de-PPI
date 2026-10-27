const service = require('../services/presupuestos.service');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.query));
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(req.params.id));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).send();
});
