import User from './user/userModel.js';

// Export models
const db = {
    User,  // Ensure consistency with the model name
};

export { db };


//==================================================for SQL

// import UserSQL from './user/userSQLModel.js';

// db.sequelize.sync({ alter: true })
//     .then(() => console.log('SQL Models synchronized'))
//     .catch(err => console.error('Error syncing SQL models:', err));

// define relations here

// db.UserSQL = UserSQL;
