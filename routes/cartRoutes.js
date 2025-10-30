const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/add', cartController.addItemToCart);
router.put('/update', cartController.updateItemQuantity);
router.delete('/remove', cartController.removeItem);
router.delete('/clear', cartController.clearCart);
router.get('/checkout/whatsapp', cartController.checkoutWhatsApp);
router.post('/checkout/email', cartController.checkoutEmail);

module.exports = router;
