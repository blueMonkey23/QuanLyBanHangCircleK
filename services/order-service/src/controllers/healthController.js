function health(req, res) {
  res.json({ service: 'order-service', status: 'ok' });
}

module.exports = {
  health,
};
