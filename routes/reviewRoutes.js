const express = require('express');
const authController = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({
  mergeParams: true,
});

router.use(authController.protect);
router
  .route('/')
  .get(getAllReviews)
  .post(authController.restrictedTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(authController.restrictedTo('user', 'admin'), deleteReview)
  .patch(authController.restrictedTo('user', 'admin'), updateReview);

module.exports = router;
