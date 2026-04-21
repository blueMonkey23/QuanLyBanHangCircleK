function listUsers(req, res) {
  res.json({ message: 'List users (stub)' });
}

function createUser(req, res) {
  res.status(201).json({ message: 'Create user (stub)' });
}

module.exports = {
  listUsers,
  createUser,
};
