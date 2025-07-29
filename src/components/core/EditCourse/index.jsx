import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import {
  getFullDetailsOfCourse,
} from "../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse } from "../../../store/slices/courseSlice"
import RenderSteps from "../AddCourse/RenderSteps"

export default function EditCourse() {
  const dispatch = useDispatch()
  const { id } = useParams()
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    ;(async () => {
      if (!id || !token) {
        setError('Missing course ID or authentication token')
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const result = await getFullDetailsOfCourse(id, token)
        console.log("EditCourse - Full result:", result)
        console.log("EditCourse - Course details:", result?.courseDetails)
        console.log("EditCourse - Instructions:", result?.courseDetails?.instructions)
        
        if (result?.courseDetails) {
          dispatch(setEditCourse(true))
          dispatch(setCourse(result.courseDetails))
        } else {
          setError('Course not found or failed to load')
        }
      } catch (err) {
        console.error('Error loading course:', err)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token])

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-gray-900">
        Edit Course
      </h1>
      <div className="mx-auto max-w-[600px]">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="mt-14 text-center text-3xl font-semibold text-gray-600">
            Course not found
          </p>
        )}
      </div>
    </div>
  )
}
