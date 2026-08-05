import { getUsers, saveUsers } from './lib/users';

console.log('Initial users:', getUsers());
const users = getUsers();
users.push({
  id: 3,
  email: 'test@example.com',
  password: 'test',
  role: 'admin',
  createdAt: new Date().toISOString()
});
saveUsers(users);
console.log('Saved users. New users:', getUsers());
