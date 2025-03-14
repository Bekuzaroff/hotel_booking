const express = require('express');
const router = express.Router();
const hotel_controller = require('./../controllers/hotel_controller');
const user_controller = require('./../controllers/user_controller')

router.route('/hotels')
    .get(user_controller.protect, hotel_controller.get_all_hotels)
    .post(hotel_controller.add_hotel_to_db)
    .patch(hotel_controller.update_hotels_field)
    .delete(hotel_controller.delete_hotels_field)

router.route('/hotels/:id')
    .get(user_controller.protect, hotel_controller.get_hotel_by_id);

router.route('/five_rated_only')
    .get(user_controller.protect, hotel_controller.get_five_rated_hotels);

router.route('/search')
    .get(user_controller.protect, hotel_controller.search_hotel_by_name);

module.exports = router;