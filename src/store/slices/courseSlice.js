import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 1,
  course: {},
  editCourse: false,
  paymentLoading: false,
  // Add more fields as needed
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourse(state, action) {
      state.course = action.payload;
    },
    setEditCourse(state, action) {
      state.editCourse = action.payload;
    },
    setStep(state, action) {
      state.step = action.payload;
    },
    resetCourseState(state) {
      state.step = 1;
      state.course = {};
      state.editCourse = false;
    }, setPaymentLoading: (state, action) => {
      state.paymentLoading = action.payload
    }
  },
});

export const { setCourse, setEditCourse, setStep, resetCourseState , setPaymentLoading, } = courseSlice.actions;
export default courseSlice.reducer; 