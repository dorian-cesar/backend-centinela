const { Router } = require("express");
const ctrl = require("../controllers/userController");

const router = Router();

// CRUD
router.get("/", ctrl.getUsers);
router.get("/:id", ctrl.getUserById);
router.post("/", ctrl.createUser);
router.put("/:id", ctrl.updateUser);
router.delete("/:id", ctrl.deleteUser);
router.patch("/:id/activar", ctrl.toggleActivo);

module.exports = router;
