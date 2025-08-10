const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getCartDetails,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

// Cart routes
router.get("/", auth, getCartDetails);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItem);
router.post("/remove", auth, removeFromCart);
router.delete("/clear", auth, clearCart);

module.exports = router;