'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.insert('tags', ['name'], ['organic']);
  await db.insert('tags', ['name'], ['healthy']);
  await db.insert('tags', ['name'], ['gltuten free']);
  await db.insert('tags', ['name'], ['ethically sourced']);
};

exports.down = function(db) {
  return db.runSql("DELETE FROM tags");
};

exports._meta = {
  "version": 1
};
