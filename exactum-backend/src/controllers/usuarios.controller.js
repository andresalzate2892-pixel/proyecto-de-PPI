const service = require('../services/usuarios.service');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list());
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

exports.login = asyncHandler(async (req, res) => {
  res.json(await service.login(req.body.email, req.body.password));
});
