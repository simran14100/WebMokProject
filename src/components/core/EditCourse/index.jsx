import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import {
  getFullDetailsOfCourse,
} from "../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse, setStep } from "../../../store/slices/courseSlice"
import RenderSteps from "../AddCourse/RenderSteps"

export default function EditCourse() {
  const dispatch = useDispatch()
  const { id, courseId } = useParams()
  const resolvedId = id || courseId
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    ;(async () => {
      if (!resolvedId || !token) {
        setError('Missing course ID or authentication token')
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const result = await getFullDetailsOfCourse(resolvedId, token)
        console.log("EditCourse - Full result:", result)
        console.log("EditCourse - Course details:", result?.data?.courseDetails)
        console.log("EditCourse - Instructions:", result?.data?.courseDetails?.instructions)
        
        if (result?.data?.courseDetails) {
          dispatch(setEditCourse(true))
          dispatch(setCourse(result.data.courseDetails))
          // Optionally land directly on Builder step when entering edit flow
          // dispatch(setStep(2))
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
  }, [resolvedId, token])

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
    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="mt-14 text-center text-3xl font-semibold text-gray-600">
            Course not found
          </p>
        )}
      </div>
  )
}
