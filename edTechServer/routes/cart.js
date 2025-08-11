const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getCartDetails,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} = require("../controllers/cartController");

const router = express.Router();

// Cart routes
router.get("/", auth, getCartDetails);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItem);
router.post("/remove", auth, removeFromCart);
router.delete("/clear", auth, clearCart);
// In your routes file
router.get('/count', auth, getCartCount);

module.exports = router;