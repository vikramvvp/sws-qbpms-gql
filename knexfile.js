const databaseName = 'QBPMS';

module.exports = {
  development: {
    client: 'postgresql',
    connection: `postgres://postgres:vvpp0$t@localhost:5432/${databaseName}`,
    migrations: {
      directory: __dirname + '/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/server/db/seeds'
    }
  },
  test: {
    client: 'postgresql',
    connection: `postgres://postgres:vvpp0$t@localhost:5432/${databaseName}_test`,
    migrations: {
      directory: __dirname + '/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/server/db/seeds'
    }
  }
};
