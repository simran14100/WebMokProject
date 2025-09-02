import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VscMortarBoard } from 'react-icons/vsc';
import { useDispatch } from 'react-redux';
import { setProgramType } from '../../slices/authSlice';

const University = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProgramSelect = (program) => {
    dispatch(setProgramType(program));
    // Check if user is logged in, if not redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=/university/enrollment?program=${program}`);
    } else {
      navigate(`/university/enrollment?program=${program}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <VscMortarBoard className="mx-auto h-16 w-16 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Select Your Program
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose the program you want to enroll in
          </p>
        </div>

        <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {['UG', 'PG', 'PHD'].map((program) => (
            <div
              key={program}
              onClick={() => handleProgramSelect(program)}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <VscMortarBoard className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {program} Program
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Click to view {program} program details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default University;
