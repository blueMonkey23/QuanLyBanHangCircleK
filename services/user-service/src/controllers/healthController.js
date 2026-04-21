function health(req, res) {
  res.json({ service: 'user-service', status: 'ok' });
}

module.exports = {
  health,
};
