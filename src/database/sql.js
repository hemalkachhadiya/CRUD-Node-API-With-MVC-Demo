import { Sequelize } from 'sequelize';
import config from '../config/config.js';

const sequelize = new Sequelize(config.SQL_DB, config.SQL_USER, config.SQL_PASSWORD, {
    host: config.SQL_HOST,
    dialect: 'mysql', // Change to 'postgres' or 'sqlite' if needed
    logging: false, // Set true if you want SQL logs
});

export default sequelize;
