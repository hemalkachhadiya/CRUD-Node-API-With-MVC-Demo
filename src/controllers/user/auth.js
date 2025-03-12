import { db } from '../../models/index.js';
import { RESPONSE } from '../../helpers/response.js';

// Create a new user
const createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body); // Creating a new user with data from request body

        if (!newUser) { // If user creation fails
            return RESPONSE.error(res, 1002, 201)
        }
        // If user creation succeeds
        return RESPONSE.success(res, 1001, newUser);
    } catch (error) { // Catch any errors that occur during user creation
        return RESPONSE.error(res, 9999, 500);
    }
}

const getSingleUser = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return RESPONSE.error(res, 1003, 200);
        }

        const userData = await db.User.findById(id);
        if (!userData) {
            return RESPONSE.error(res, 1004, 200);
        }

        return RESPONSE.success(res, 1005, userData);
    } catch (error) {
        return RESPONSE.error(res, 9999, 500);
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return RESPONSE.error(res, 1003, 200);
        }

        const updatedUser = await db.User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return RESPONSE.error(res, 1004, 200);
        }

        return RESPONSE.success(res, 1006, updatedUser);
    } catch (error) {
        return RESPONSE.error(res, 9999, 500);
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return RESPONSE.error(res, 1003, 200);
        }

        const userData = await db.User.findByIdAndDelete(id);
        if (!userData) {
            return RESPONSE.error(res, 1004, 200);
        }

        return RESPONSE.success(res, 1007, userData);
    } catch (error) {
        return RESPONSE.error(res, 9999, 500);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * pageSize;

        const total = await db.User.countDocuments({});
        const users = await db.User.find({}).skip(skip).limit(pageSize).sort({ createdAt: -1 });

        if (!users.length) {
            return RESPONSE.error(res, 1004, 200);
        }

        return RESPONSE.success(res, 1008, { users, totalPages: Math.ceil(total / pageSize), currentPage: page, pageSize, total });
    } catch (error) {
        return RESPONSE.error(res, 9999, 500);
    }
};

export { createUser, getSingleUser, updateUser, deleteUser, getAllUsers };
