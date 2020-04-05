
exports.up = function(knex) {
    return knex.schema.createTable('feels', function(table){
        table.increments('id').primary();
        table.string('title');
        table.string('subtitle');
        table.text('descr');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('feels');
};
