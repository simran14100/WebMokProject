import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import University from '../pages/University/University';
import UniversityLogin from '../pages/University/Auth/UniversityLogin';
import EnrollmentStatus from '../pages/University/EnrollmentStatus';
import { universityLogin, updateUserProgram } from '../services/operations/authApi';

// Mock the API calls
jest.mock('../services/operations/authApi', () => ({
  universityLogin: jest.fn(),
  updateUserProgram: jest.fn(),
  getCurrentUser: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('University Enrollment Flow', () => {
  let store;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup initial state
    store = mockStore({
      auth: {
        token: null,
        loading: false,
      },
      profile: {
        user: null,
        loading: false,
      },
    });
  });

  test('unauthenticated user selects a program and is redirected to login', async () => {
    // Render the University component inside a test router
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/university']}>
          <Routes>
            <Route path="/university" element={<University />} />
            <Route path="/university/login" element={<UniversityLogin />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Find and click on the UG program card
    const ugProgramCard = screen.getByText('Undergraduate (UG)').closest('.program-card');
    fireEvent.click(ugProgramCard);

    // Verify navigation to login page
    expect(window.location.pathname).toBe('/university/login');
    
    // Verify program info is preserved in location state
    expect(window.history.state.usr).toEqual({
      program: 'UG',
      redirectTo: '/university/enrollment?program=UG'
    });
  });

  test('authenticated user with no enrollment can select a program', async () => {
    // Mock the store with an authenticated user but no enrollment
    store = mockStore({
      auth: {
        token: 'test-token',
        loading: false,
      },
      profile: {
        user: {
          _id: '123',
          email: 'test@example.com',
          enrollmentStatus: 'Not Enrolled',
        },
        loading: false,
      },
    });

    // Mock the updateUserProgram response
    updateUserProgram.mockResolvedValueOnce({
      payload: { success: true, user: { enrollmentStatus: 'pending', programType: 'UG' } }
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/university']}>
          <Routes>
            <Route path="/university" element={<University />} />
            <Route path="/university/enrollment" element={<EnrollmentStatus />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Find and click on the UG program card
    const ugProgramCard = screen.getByText('Undergraduate (UG)').closest('.program-card');
    fireEvent.click(ugProgramCard);

    // Verify updateUserProgram was called with the correct program
    await waitFor(() => {
      expect(updateUserProgram).toHaveBeenCalledWith('UG');
    });

    // Verify navigation to enrollment page with pending status
    expect(window.location.pathname).toBe('/university/enrollment');
  });
});
