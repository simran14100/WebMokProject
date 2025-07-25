import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course)

  const steps = [
    { id: 1, title: "Course Information" },
    { id: 2, title: "Course Builder" },
    { id: 3, title: "Publish" },
  ];

  return (
    <>
      {/* Add Course Heading */}
      <h1 className="mb-8 text-3xl font-extrabold text-center text-green-700">Add Course</h1>
      {/* Stepper UI */}
      <div className="relative mb-8 flex w-full max-w-5xl mx-auto justify-center items-center -mr-7 ">
        {steps.map((item, idx) => (
          <div key={item.id} className="flex items-center w-full">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-none">
              <button
                className={`grid w-10 h-10 place-items-center rounded-full border-[2px] transition-all duration-200
                  ${step === item.id
                    ? "border-green-500 bg-green-500 text-white font-bold"
                    : step > item.id
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"}
                `}
                disabled
              >
                {step > item.id ? (
                  <FaCheck className="font-bold text-white text-base" />
                ) : (
                  item.id
                )}
              </button>
              <p
                className={`mt-2 text-sm transition-all duration-200
                  ${step === item.id || step > item.id
                    ? "text-green-600 font-bold"
                    : "text-gray-400"}
                `}
              >
                {item.title}
              </p>
            </div>
            {/* Dashed Line */}
            {idx !== steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 border-b-2 border-dashed mx-2
                  ${step > item.id ? "border-green-500" : "border-gray-300"}
                `}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Render specific component based on current step */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  );
}
