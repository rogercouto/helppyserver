
exports.up = function(knex) {
  return knex.schema.createTable('posts', function(table){
      table.increments('id').primary();
      table.integer('admin_id').notNullable();
      table.string('title');
      table.text('text');
      table.string('text_align');  
      table.string('text_bg');
      table.string('media');
      table.string('media_type');
      table.boolean('media_upload').defaultTo(false);
      table.timestamp('created_at',{useTz:true}).defaultTo(knex.fn.now());
      table.foreign('admin_id').references('id').inTable('admins');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('posts');
};
