
exports.up = function(knex) {
    return knex.schema.createTable('infos', function(table){
        table.string('key').primary();
        table.string('title');
        table.text('text');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('infos');
};
