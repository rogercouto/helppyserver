
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('admins').del()
    .then(function () {
      // Inserts seed entries
      return knex('admins').insert([
        {
          name: 'Administrador', 
          email: 'rogerecouto@gmail.com', 
          password: '$2b$10$kAg0JnE2jZ4ftyQQFWYbVu1HhtdhU.6MrtJYVUj6afwPkWG9wEMXS'
        }
      ]);
    });
};
