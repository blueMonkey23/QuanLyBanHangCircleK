function health(req, res) {
  res.json({ service: 'api-gateway', status: 'ok' });
}

module.exports = {
  health,
};
