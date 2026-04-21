function listProducts(req, res) {
  res.json({ message: 'List products (stub)' });
}

function createProduct(req, res) {
  res.status(201).json({ message: 'Create product (stub)' });
}

module.exports = {
  listProducts,
  createProduct,
};
