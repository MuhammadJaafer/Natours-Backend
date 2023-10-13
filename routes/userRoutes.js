/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgetPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

//protect all the routes under this line
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updatePassword', authController.updatePassword);

router.delete('/deleteMe', userController.deleteMe);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
//restricted to admins
router.use(authController.restrictedTo('admin'));
router
  .route(`/`)
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
