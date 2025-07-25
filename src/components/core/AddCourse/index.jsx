import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <RenderSteps />
      </div>
    </div>
  )
}
