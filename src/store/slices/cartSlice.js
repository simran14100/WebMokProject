import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  totalItems: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    setCart(state, value) {
      state.cart = value.payload;
    },
    setTotalItems(state, value) {
      state.totalItems = value.payload;
    },
    setTotal(state, value) {
      state.total = value.payload;
    },
    addToCart: (state, action) => {
      const course = action.payload;
      const existingCourse = state.cart.find(item => item._id === course._id);
      
      if (!existingCourse) {
        state.cart.push(course);
        state.totalItems += 1;
        state.total += course.price;
      }
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload;
      const course = state.cart.find(item => item._id === courseId);
      
      if (course) {
        state.cart = state.cart.filter(item => item._id !== courseId);
        state.totalItems -= 1;
        state.total -= course.price;
      }
    },
    clearCart: (state) => {
      state.cart = [];
      state.totalItems = 0;
      state.total = 0;
    },
  },
});

export const { 
  setCart, 
  setTotalItems, 
  setTotal, 
  addToCart, 
  removeFromCart, 
  clearCart 
} = cartSlice.actions;
export default cartSlice.reducer; 