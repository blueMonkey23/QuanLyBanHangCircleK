function health(req, res) {
  res.json({ service: 'product-service', status: 'ok' });
}

module.exports = {
  health,
};
