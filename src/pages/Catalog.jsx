import React from 'react';
import { useParams } from 'react-router-dom';

const Catalog = () => {
  const { catalogName } = useParams();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-richblack-25 mb-4">
          Catalog: {catalogName}
        </h1>
        <p className="text-lg text-richblack-100 mb-8">
          Browse courses in this category.
        </p>
        <div className="bg-richblack-800 p-8 rounded-lg max-w-md mx-auto">
          <p className="text-richblack-100">
            Course catalog will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Catalog; 