# Node Js

## Basic structure

### Api-CRUD-Demo

```
src
├── config
│   └── config.js
├── controllers
│   └── user
│       ├── auth.js
│       └── index.js
├── database
│   ├── mongoDB.js
│   └── sql.js
├── helpers
│   └── response.js
├── lang
│   └── en
│       └── messages.js
├── middleware
├── models
│   └── user
│       ├── userModel.js
│       └── index.js
├── routes
│   └── user
│       ├── auth.js
│       └── index.js
├── services
├── app.js
└── index.js
.env
package-lock.json
package.json
```

## Database 

- Suppose we are using MongoDB as a database, then the MongoDB connection URL must be in the .env file, not anywhere else. 

```
PORT = 3000
MONGODB_URI = "mongodb+srv://username:password@cluster0.example.mongodb.net/demo"
```

- All database schemas must be in a 'models' folder, and their names should end with 'Model.js'. For example, if you are creating a user schema, the name should be 'userModel.js'.

- Always attach timestamps to schemas for all models.

```javascript
userSchema.set("timestamps", true);
```

## Controller 

- All controller files must be in a 'controllers' folder, and their names should end with '.js'. For example, if you are creating a user controller, the name should be 'auth.js' within the user folder.

- In a controller file, all dependencies and models should be imported at the top, followed by the API functions.

```javascript
import db from '../../models';
import RESPONSE from '../../helpers/response';
```

- Use the following controller structure:

```javascript
// Create a new user
const createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body); // Creating a new user with data from request body

        if (!newUser) { // If user creation fails
            return RESPONSE.error(res, 1002, 201);
        }
        // If user creation succeeds
        return RESPONSE.success(res, 1001, newUser);
    } catch (error) { // Catch any errors that occur during user creation
        return RESPONSE.error(res, 9999, 500);
    }
};

export default createUser;
```

- Always use camelCase for controller names; never use underscores or dashes in the controller name.

## Response Handler

- Create a standardized response helper for consistent API responses:

```javascript
import { get_message } from '../lang/en/messages.js';

const RESPONSE = {};
RESPONSE.success = function (res, message_code = null, data = null, status_code = 200) {
    const response = {};
    response.success = true;
    response.message = get_message(message_code);
    if (data != null) {
        response.data = data;
    }
    return res.status(status_code).send(response);
};
RESPONSE.error = function (res, message_code, status_code = 422, error = null, data = null) {
    const response = {};
    response.success = false;
    response.message = get_message(message_code);
    status_code = message_code == 9999 ? 500 : status_code;
    if (data != null) {
        response.data = data;
    }
    if (error != null) {
        console.log('error :>> ', error);
    }
    return res.status(status_code).send(response);
};
export { RESPONSE };
```

## Message Codes

- Store all message codes in a language file:

```javascript
const MESSAGES = {

    // auth
    1001: 'User created successfully',
    1002: 'User not created',
    1003: 'ID is required',
    1004: 'User not found',
    1005: 'User fetched successfully',
    1006: 'User updated successfully',
    1007: 'User deleted successfully',
    1008: 'Users fetched successfully',

    // defaults
    9999: 'Internal server error'
};


const get_message = message_code => {
    if (isNaN(message_code)) {
        return message_code;
    }
    return message_code ? MESSAGES[message_code] : '';
};

export { get_message };
```

## Routes

- All routes files must be in a 'routes' folder, and their names should end with '.js'. For example, if you are creating user routes, place them in 'routes/user/auth.js'.

- Always use verify token and middleware in the route file.

- Use the following route structure:

```javascript
import { Router } from 'express';
import { createUser, getSingleUser, updateUser, deleteUser, getAllUsers } from '../../controllers/user';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.post("/create/user", verifyToken, createUser);
router.get("/get/singleUser", verifyToken, getSingleUser);
router.post("/update/user", verifyToken, updateUser);
router.delete("/delete/user", verifyToken, deleteUser);
router.get("/get/allUser", verifyToken, getAllUsers);

export default router;
```

## Important Notes

- Always use a code beautification extension after writing code.
- Always add 'api/v1' before your API URL.

```javascript
// app.js
import express from 'express';
import userRoutes from './routes/user';

const app = express();

app.use("/api/v1/user", userRoutes);
```

- All URLs and credentials used in your code must be in the .env file, not anywhere else.
- Whenever you create APIs for deleting and updating images, always delete images from the folder.
- Always try to add comment on top of the controller function.

```javascript
// Create a new user
const createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body);
        
        if (!newUser) {
            return RESPONSE.error(res, 1002, 201);
        }
        
        return RESPONSE.success(res, 1001, newUser);
    } catch (error) {
        return RESPONSE.error(res, 9999, 500);
    }
};
```

- When creating APIs, the naming convention follows the format where actions like create, get, delete, or update precede the entity name, such as createUser for creating a user.
- Always encrypt sensitive information like passwords.
- Use appropriate HTTP methods (GET, POST, PUT, DELETE) for CRUD operations in your APIs.

```javascript
router.post("/create/user", verifyToken, createUser);
router.get("/get/singleUser", verifyToken, getSingleUser);
router.put("/update/user", verifyToken, updateUser);
router.delete("/delete/user", verifyToken, deleteUser);
router.get("/get/allUser", verifyToken, getAllUsers);
```

- Implement error handling and return meaningful error messages or status codes in your API responses.
- Follow RESTful principles when designing your APIs to enhance scalability and interoperability.

## Status code

| API Response Type | Status Code Response |
| ------ | ------ |
| Success with data | `{status: 200, success: true, message: "Success message", data: {...}}` |
| Required fields missing | `{status: 203, success: false, message: "Required fields message"}` |
| Success but no data found | `{status: 201, success: false, message: "No data found message"}` |
| No page found | `{status: 404, success: false, message: "Page not found message"}` |
| Internal server error | `{status: 500, success: false, message: "Internal server error message"}` |
| A token is required for authentication | `{status: 644, success: false, message: "Token required message"}` |
| Invalid Token | `{status: 644, success: false, message: "Invalid token message"}` |
| User Not Found with this token | `{status: 644, success: false, message: "User not found message"}` |

## Database Models

- Example of a user model:

```javascript
// models/user/userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Add timestamps (created_at, updated_at)
userSchema.set("timestamps", true);

const User = mongoose.model('User', userSchema);

export default User;
```

## Services

- Add all services related to Nodemailer, the payment gateway, etc., in the services folder.

## uploads

- In the uploads folder, organize images and files into separate folders. For example, to store user avatar images, create a user_avatar folder inside uploads and store the images there. Follow the same structure for other files as well.