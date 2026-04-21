function health(req, res) {
  res.json({ service: 'report-service', status: 'ok' });
}

module.exports = {
  health,
};
