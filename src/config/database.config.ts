// src/config/database.config.ts
import { DatabaseConfig } from './interfaces/database-config.interface';

export const databaseConfig = (): {
  database: DatabaseConfig;
} => {
  const dbType = process.env.DB_TYPE as DatabaseConfig['type'];

  switch (dbType) {
    case 'mongo':
      return {
        database: {
          type: 'mongo',
          uri: process.env.MONGO_URI || '',
          dbName: process.env.MONGO_DB_NAME || '',
        },
      };

    case 'postgres':
      return {
        database: {
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
          username: process.env.POSTGRES_USER || 'user',
          password: process.env.POSTGRES_PASS || 'pass',
          database: process.env.POSTGRES_DB || 'db',
        },
      };

    case 'mysql':
      return {
        database: {
          type: 'mysql',
          host: process.env.MYSQL_HOST || 'localhost',
          port: parseInt(process.env.MYSQL_PORT || '3306', 10),
          username: process.env.MYSQL_USER || 'user',
          password: process.env.MYSQL_PASS || 'pass',
          database: process.env.MYSQL_DB || 'db',
        },
      };
  }
};
