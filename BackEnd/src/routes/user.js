const express = require('express');
const router = express.Router();

const controller = require('../controllers/user_controller');

router.post('/login', controller.login);

router.post('/register', controller.register_user);

router.put('/update/:id', controller.alter_user);

router.delete('/delete/:id', controller.delete_user);

module.exports = router;