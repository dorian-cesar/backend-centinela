const { Router } = require("express");
const ctrl = require("../controllers/authController");

const router = Router();

router.post("/email", ctrl.loginEmail);
router.post("/rut", ctrl.loginRut);

module.exports = router;
