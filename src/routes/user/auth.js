import { Router } from 'express';
const router = Router();
import { controller } from '../../controllers/index.js';

router.post("/create/user", controller.createUser);
router.get("/get/singleUser", controller.getSingleUser);
router.post("/update/user", controller.updateUser);
router.delete("/delete/user", controller.deleteUser);
router.get("/get/allUser", controller.getAllUsers);

export default router;
