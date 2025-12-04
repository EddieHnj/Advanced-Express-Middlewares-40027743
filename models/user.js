let users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
];

const getAllUsers = () => users;
const getUserById = id => users.find(u => u.id === Number(id));
const createUser = (name, age) => {
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id, name, age: Number(age) };
  users.push(newUser);
  return newUser;
};
const updateUser = (id, name, age) => {
  const idx = users.findIndex(u => u.id === Number(id));
  if (idx === -1) return null;
  users[idx] = { id: Number(id), name, age: Number(age) };
  return users[idx];
};
const deleteUser = id => {
  const before = users.length;
  users = users.filter(u => u.id !== Number(id));
  return users.length < before;
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
