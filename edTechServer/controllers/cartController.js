const Cart = require('../models/Cart');
const mongoose = require("mongoose");
const Course = require('../models/Course');



// Backend controller (cartController.js)
exports.getCartDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's cart with populated course details
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.course",
        populate: [
          {
            path: "instructor",
            select: "firstName lastName",
          },
          {
            path: "category",
            select: "name",
          },
        ],
      })
      .exec();

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], total: 0 },
      });
    }

    // Calculate total
    let total = 0;
    cart.items.forEach((item) => {
      total += item.course.price * item.quantity;
    });

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching cart details:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check if course already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.course.toString() === courseId
    );

    if (existingItemIndex >= 0) {
  // Course already in cart - reject duplicate
  return res.status(400).json({
    success: false,
    message: "Course is already added in your cart",
  });
} else {
  // Add new item
  cart.items.push({
    course: courseId,
    quantity: 1,
    price: course.price,
  });
}


    await cart.save();

    // Populate the course details before sending response
    await cart.populate({
      path: "items.course",
      populate: [
        { path: "instructor", select: "firstName lastName" },
        { path: "category", select: "name" },
      ],
    });

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.course.price * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total,
      },
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, quantity } = req.body;

    // Validate input
    if (!courseId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Course ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.course.toString() === courseId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate the course details before sending response
    await cart.populate({
      path: "items.course",
      populate: [
        { path: "instructor", select: "firstName lastName" },
        { path: "category", select: "name" },
      ],
    });

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.course.price * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total,
      },
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.course.toString() !== courseId
    );

    await cart.save();

    // Populate the course details before sending response
    await cart.populate({
      path: "items.course",
      populate: [
        { path: "instructor", select: "firstName lastName" },
        { path: "category", select: "name" },
      ],
    });

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.course.price * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total,
      },
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and update cart
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        items: [],
        total: 0,
      },
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// In your cartController.js
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    
    const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error getting cart count:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};