

import { useState, useCallback } from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronRight, FiVideo, FiEye } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import { deleteSection, deleteSubSection } from "../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../store/slices/courseSlice"
import SubSectionModal from "./SubSectionModal"
import ConfirmationModal from "../../../common/ConfirmationModal"

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#E6F7F5';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F5F5F5';
const GRAY_DARK = '#333333';
const ED_RED = '#EF4444';
const ED_BLUE = '#3B82F6';

export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // States
  const [activeSection, setActiveSection] = useState(null)
  const [viewSubSection, setViewSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [addSubSection, setAddSubSection] = useState(null)

  // Styles
  const styles = {
    container: {
      marginTop: '1.5rem',
    },
    heading: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: GRAY_DARK,
      marginBottom: '1rem',
    },
    sectionCard: {
      overflow: 'hidden',
      borderRadius: '0.5rem',
      border: `1px solid ${GRAY_LIGHT}`,
      backgroundColor: WHITE,
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
      marginBottom: '1rem',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: WHITE,
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: GRAY_LIGHT,
      },
    },
    sectionInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: 500,
      color: GRAY_DARK,
    },
    sectionCount: {
      fontSize: '0.875rem',
      color: '#6B7280',
      marginTop: '0.25rem',
    },
    sectionActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    iconButton: {
      borderRadius: '0.375rem',
      padding: '0.375rem',
      color: '#9CA3AF',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: ED_TEAL,
        color: GRAY_DARK,
      },
    },
    editButton: {
      backgroundColor: ED_TEAL, // default background
      ':hover': {
        color: ED_TEAL,
        backgroundColor: `${ED_TEAL}10`,
      },
    },
    deleteButton: {
      backgroundColor: ED_TEAL, // default background
      ':hover': {
        color: ED_RED,
        backgroundColor: `${ED_RED}10`,
      },
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      borderRadius: '0.375rem',
      padding: '0.375rem 0.75rem',
      backgroundColor: ED_TEAL_LIGHT,
      color: ED_TEAL_DARK,
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: `${ED_TEAL}20`,
      },
    },
    subSectionList: {
      borderTop: `1px solid ${GRAY_LIGHT}`,
      backgroundColor: GRAY_LIGHT,
    },
    subSectionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: `${ED_TEAL}08`,
      },
    },
    subSectionContent: {
      display: 'flex',
      alignItems: 'center',
    },
    subSectionIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      backgroundColor: `${ED_BLUE}20`,
      color: ED_BLUE,
      flexShrink: 0,
    },
    subSectionText: {
      marginLeft: '0.75rem',
    },
    subSectionTitle: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: GRAY_DARK,
    },
    subSectionDesc: {
      fontSize: '0.75rem',
      color: '#6B7280',
    },
    subSectionActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: 0,
      transition: 'opacity 0.2s',
    },
    viewButton: {
      ':hover': {
        color: ED_BLUE,
        backgroundColor: `${ED_BLUE}10`,
      },
    },
    emptyState: {
      borderRadius: '0.5rem',
      border: `2px dashed ${GRAY_LIGHT}`,
      padding: '2rem',
      textAlign: 'center',
    },
    emptyIcon: {
      margin: '0 auto',
      color: '#9CA3AF',
      width: '3rem',
      height: '3rem',
    },
    emptyTitle: {
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: GRAY_DARK,
    },
    emptyText: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    emptyAction: {
      marginTop: '1.5rem',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '0.375rem',
      border: 'none',
      padding: '0.5rem 1rem',
      backgroundColor: ED_TEAL,
      color: WHITE,
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: ED_TEAL_DARK,
      },
    },
  };

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }, [])

  const handleDeleteSection = async (sectionId) => {
    setIsDeleting(true)
    try {
      const result = await deleteSection({
        sectionId,
        courseId: course._id,
        token,
      })
      if (result) {
        dispatch(setCourse(result))
        toast.success("Section deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error(error.response?.data?.message || "Failed to delete section")
    } finally {
      setConfirmationModal(null)
      setIsDeleting(false)
    }
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    setIsDeleting(true)
    try {
      const result = await deleteSubSection({ subSectionId, sectionId, token })
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === sectionId ? result : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        toast.success("Lecture deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting lecture:", error)
      toast.error(error.response?.data?.message || "Failed to delete lecture")
    } finally {
      setConfirmationModal(null)
      setIsDeleting(false)
    }
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Course Content</h3>
      
      {course.courseContent?.map((section) => (
        <div key={section._id} style={styles.sectionCard}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection(section._id)}
          >
            <div style={styles.sectionInfo}>
              {expandedSections[section._id] ? (
                <FiChevronDown style={{ marginRight: '0.75rem', color: '#6B7280', width: '1.25rem', height: '1.25rem' }} />
              ) : (
                <FiChevronRight style={{ marginRight: '0.75rem', color: '#6B7280', width: '1.25rem', height: '1.25rem' }} />
              )}
              <div>
                <h4 style={styles.sectionTitle}>{section.sectionName}</h4>
                <p style={styles.sectionCount}>
                  {section.subSection?.length || 0} {section.subSection?.length === 1 ? 'lecture' : 'lectures'}
                </p>
              </div>
            </div>
            <div style={styles.sectionActions}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleChangeEditSectionName(section._id, section.sectionName)
                }}
                style={{ ...styles.iconButton, ...styles.editButton }}
                title="Edit section"
              >
                <FiEdit2 style={{ width: '1rem', height: '1rem'  }} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmationModal({
                    text1: "Delete Section",
                    text2: "This will permanently delete this section and all its lectures. This action cannot be undone.",
                    btn1Text: isDeleting ? "Deleting..." : "Delete Section",
                    btn2Text: "Cancel",
                    btn1Handler: () => handleDeleteSection(section._id),
                    btn2Handler: () => setConfirmationModal(null),
                    btn1Disabled: isDeleting,
                  })
                }}
                style={{ ...styles.iconButton, ...styles.deleteButton }}
                title="Delete section"
                disabled={isDeleting}
              >
                <FiTrash2 style={{ width: '1rem', height: '1rem' }} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setAddSubSection(section._id)
                }}
                style={styles.addButton}
              >
                <FiPlus style={{ width: '1rem', height: '1rem' }} />
                Add Lecture
              </button>
            </div>
          </div>
          
          {expandedSections[section._id] && section.subSection?.length > 0 && (
            <div style={styles.subSectionList}>
              <ul style={{ padding: 0, margin: 0 }}>
                {section.subSection.map((subSection, idx) => (
                  <li key={subSection._id} style={styles.subSectionItem}>
                    <div style={styles.subSectionContent}>
                      <div style={styles.subSectionIcon}>
                        <FiVideo style={{ width: '1rem', height: '1rem' }} />
                      </div>
                      <div style={styles.subSectionText}>
                        <p style={styles.subSectionTitle}>
                          {subSection.title || `Lecture ${idx + 1}`}
                        </p>
                        <p style={styles.subSectionDesc}>
                          {subSection.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div style={{ ...styles.subSectionActions, ':hover': { opacity: 1 } }}>
                      <button
                        type="button"
                        onClick={() => setViewSubSection({ ...subSection, sectionId: section._id })}
                        style={{ ...styles.iconButton, ...styles.viewButton }}
                        title="View lecture"
                      >
                        <FiEye style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSubSection({ ...subSection, sectionId: section._id })}
                        style={{ ...styles.iconButton, ...styles.editButton }}
                        title="Edit lecture"
                      >
                        <FiEdit2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete Lecture",
                            text2: "Are you sure you want to delete this lecture?",
                            btn1Text: isDeleting ? "Deleting..." : "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () => handleDeleteSubSection(subSection._id, section._id),
                            btn2Handler: () => setConfirmationModal(null),
                            btn1Disabled: isDeleting,
                          })
                        }
                        style={{ ...styles.iconButton, ...styles.deleteButton }}
                        title="Delete lecture"
                        disabled={isDeleting}
                      >
                        <FiTrash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {course.courseContent?.length === 0 && (
        <div style={styles.emptyState}>
          <FiVideo style={styles.emptyIcon} />
          <h3 style={styles.emptyTitle}>No sections yet</h3>
          <p style={styles.emptyText}>
            Get started by adding your first section and lecture.
          </p>
          <div style={styles.emptyAction}>
            <button
              type="button"
              onClick={() => document.getElementById('sectionInput')?.focus()}
              style={styles.primaryButton}
            >
              <FiPlus style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
              New Section
            </button>
          </div>
        </div>
      )}

      {/* Modal Displays */}
      {addSubSection && (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      )}
      {viewSubSection && (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      )}
      {editSubSection && (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      )}
      {confirmationModal && (
        <ConfirmationModal 
          modalData={confirmationModal} 
          onClose={() => !isDeleting && setConfirmationModal(null)}
        />
      )}
    </div>
  )
}