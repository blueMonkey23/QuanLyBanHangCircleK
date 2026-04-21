function listOrders(req, res) {
  res.json({ message: 'List orders (stub)' });
}

function createOrder(req, res) {
  res.status(201).json({ message: 'Create order (stub)' });
}

module.exports = {
  listOrders,
  createOrder,
};
