import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import { MdNavigateNext } from 'react-icons/md';

import { 
  addCourseDetails,        
  editCourseDetails, 
  fetchCourseCategories, 
  fetchCourseSubCategories 

} from '../../../../services/operations/courseDetailsAPI';
import store from '../../../../store';
import { setCourse, setStep } from '../../../../store/slices/courseSlice';
import { ED_TEAL, ED_TEAL_DARK } from '../../../../utils/theme';
import IconBtn from '../../../common/IconBtn';
import Upload from '../Upload';
import RequirementsField from './RequirementsField';
import ChipInput from './ChipInput';

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();
  
  const dispatch = useDispatch();
  
  // Get user data from Redux store
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  
  // Debug: Log user and token info
  console.log('Current user:', user);
  console.log('Current token:', token);
  
  // Log Redux store state for debugging
  useEffect(() => {
    console.log('Redux auth state:', store.getState().auth);
    console.log('Redux profile state:', store.getState().profile);
  }, []);
  const { course, editCourse } = useSelector((state) => state.course);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);
  const [courseSubCategories, setCourseSubCategories] = useState([]);
  const [requirements, setRequirements] = useState([""]);
  const [courseTags, setCourseTags] = useState([]);

  // Form styles
  const formStyles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    section: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: '1.25rem',
      paddingBottom: '0.75rem',
      borderBottom: `1px solid #e2e8f0`,
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      marginBottom: '1rem',
      ':focus': {
        outline: 'none',
        borderColor: ED_TEAL,
        boxShadow: `0 0 0 3px ${ED_TEAL}20`,
      },
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '0.625rem 0.875rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      marginBottom: '1rem',
      resize: 'vertical',
      ':focus': {
        outline: 'none',
        borderColor: ED_TEAL,
        boxShadow: `0 0 0 3px ${ED_TEAL}20`,
      },
    },
    select: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      backgroundColor: '#fff',
      marginBottom: '1rem',
      cursor: 'pointer',
      ':focus': {
        outline: 'none',
        borderColor: ED_TEAL,
        boxShadow: `0 0 0 3px ${ED_TEAL}20`,
      },
    },
    error: {
      color: '#e53e3e',
      fontSize: '0.75rem',
      marginTop: '-0.5rem',
      marginBottom: '0.5rem',
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.625rem 1.25rem',
      backgroundColor: ED_TEAL,
      color: 'white',
      fontWeight: '600',
      fontSize: '0.875rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: ED_TEAL_DARK,
      },
      ':disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    },
    buttonIcon: {
      marginLeft: '0.5rem',
      fontSize: '1.25rem',
    },
  };

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const categories = await fetchCourseCategories();
      if (categories.length > 0) {
        setCourseCategories(categories);
      }
      setLoading(false);
    };

    getCategories();
  }, []);

  // Set form values if in edit mode
  useEffect(() => {
    if (editCourse) {
      setValue('courseTitle', course.courseName);
      setValue('courseShortDesc', course.courseDescription);
      setValue('coursePrice', course.price);
      setValue('courseTags', course.tag);
      setValue('courseBenefits', course.whatYouWillLearn);
      setValue('courseCategory', course.category?._id || '');
      setValue('courseSubCategory', course.subCategory?._id || '');
      setCourseTags(course.tag || []);
      setRequirements(course.instructions || ['']);
    }
  }, [editCourse, course, setValue]);

  // Watch for category changes to load subcategories
  const selectedCategory = watch('courseCategory');

  // useEffect(() => {
  //   const getSubCategories = async () => {
  //     if (selectedCategory) {
  //       setLoading(true);
  //       try {
  //         const result = await fetchCourseSubCategories(selectedCategory);
  //         if (result) {
  //           setCourseSubCategories(result);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching subcategories:', error);
  //         toast.error('Failed to load subcategories');
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //   };

  //   if (selectedCategory) {
  //     getSubCategories();
  //   }
  //   setValue('courseSubCategory', '');
  // }, [selectedCategory, setValue]);


  useEffect(() => {
    const getSubCategories = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const response = await fetchCourseSubCategories(selectedCategory);
          console.log('Full API response:', response); // Debug log
          
          // Handle different response structures
          const subCategories = response?.data || response || [];
          console.log('Extracted subcategories:', subCategories); // Debug log
          
          setCourseSubCategories(subCategories);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          toast.error('Failed to load subcategories');
        } finally {
          setLoading(false);
        }
      }
    };
  
    if (selectedCategory) {
      getSubCategories();
    }
    setValue('courseSubCategory', ''); // Reset subcategory when category changes
  }, [selectedCategory, setValue]);


  const isFormUpdated = () => {
    const currentValues = getValues();
    if (editCourse) {
      // Check if any field has been modified
      return (
        currentValues.courseTitle !== course.courseName ||
        currentValues.courseShortDesc !== course.courseDescription ||
        currentValues.coursePrice !== course.price ||
        currentValues.courseCategory !== course.category?._id ||
        currentValues.courseSubCategory !== course.subCategory?._id ||
        JSON.stringify(courseTags) !== JSON.stringify(course.tag || []) ||
        JSON.stringify(requirements) !== JSON.stringify(course.instructions || []) ||
        currentValues.courseBenefits !== course.whatYouWillLearn ||
        currentValues.courseImage !== course.thumbnail
      );
    }
    return true; // For new course, form is always considered updated
  };

  // Check if user has permission to create/edit courses
  const checkCoursePermissions = () => {
    if (!user) {
      toast.error('Please log in to create or edit courses');
      return false;
    }
    
    // Check if user is either an Admin or an approved Instructor
    const isAdmin = user?.accountType === 'Admin';
    const isApprovedInstructor = user?.accountType === 'Instructor' && user?.isApproved;
    
    if (!isAdmin && !isApprovedInstructor) {
      toast.error('You need to be an Admin or an approved Instructor to create or edit courses');
      console.error('Insufficient permissions:', { 
        isAdmin,
        isApprovedInstructor,
        userRole: user?.accountType,
        isApproved: user?.isApproved
      });
      return false;
    }
    
    console.log('User has permission to create/edit courses');
    return true;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    
    // Check permissions first
    if (!checkCoursePermissions()) {
      return;
    }
    
    if (!isFormUpdated()) {
      toast.error('No changes made to update');
      return;
    }

    // Ensure requirements are not empty
    if (requirements.length === 0 || (requirements.length === 0 && !requirements[0].trim())) {
      toast.error('Please add at least one requirement');
      return;
    }
    
    // Ensure courseTags is not empty
    // if (courseTags.length === 0) {
    //   toast.error('Please add at least one tag');
    //   return;
    // }

    setLoading(true);
    
    try {
      // Get the current token from Redux store
      const currentToken = token || localStorage.getItem('debug_token');
      console.log('Current token from Redux:', token);
      console.log('Token from localStorage:', localStorage.getItem('debug_token'));
      
      if (!currentToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create form data with all required fields
      const formData = new FormData();
      
      // If editing, include the course ID
      if (course) {
        console.log('Editing course with ID:', course._id);
        formData.append('courseId', course._id);
      }
      
      // Required fields from the form
      formData.append('courseName', data.courseTitle || '');
      formData.append('courseDescription', data.courseShortDesc || '');
      formData.append('price', data.coursePrice || 0);
      formData.append('category', data.courseCategory || '');
      formData.append('whatYouWillLearn', data.courseBenefits || '');
      
      // Format instructions array - ensure at least one valid instruction
      const instructionsList = requirements && requirements.length > 0 ? 
        requirements.filter(r => r.trim() !== '') : [];
      
      // If no valid instructions, add a default one
      if (instructionsList.length === 0) {
        instructionsList.push('Complete all lectures and assignments');
      }
      
      console.log('Final instructions:', instructionsList);
      formData.append('instructions', JSON.stringify(instructionsList));
      
      // Default status for new courses
      formData.append('status', 'Draft');
      
      // Add subCategory if it exists (not all backends require this)
      if (data.courseSubCategory) {
        formData.append('subCategory', data.courseSubCategory);
      }
      
      // Handle thumbnail upload
      if (data.courseImage) {
        formData.append('thumbnailImage', data.courseImage);
        console.log('Thumbnail file attached:', data.courseImage.name);
      } else if (editCourse && !data.courseImage) {
        // If editing and no new thumbnail was provided, keep the existing one
        console.log('Using existing thumbnail');
      } else {
        console.error('Thumbnail is required');
        toast.error('Please upload a course thumbnail');
        setLoading(false);
        return;
      }

      // Log form data for debugging
      console.log('=== FormData contents ===');
      const formDataObj = {};
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
        formDataObj[key] = value;
      }
      console.log('=== End FormData ===');
      console.log('FormData as object:', formDataObj);
      
      // Verify required fields
      const requiredFields = [
        'courseName', 'courseDescription', 'whatYouWillLearn', 
        'price', 'category','instructions', 'status'
      ];
      
      const missingFields = requiredFields.filter(field => !formDataObj[field]);
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      let result;
      if (editCourse) {
        // Update existing course
        console.log('Updating existing course with token:', currentToken);
        result = await editCourseDetails(formData, currentToken);
        if (result) {
          dispatch(setCourse(result));
          toast.success('Course updated successfully');
          dispatch(setStep(2)); // Move to next step (Course Builder)
        }
      } else {
        // Create new course
        console.log('Creating new course with token:', currentToken);
        result = await addCourseDetails(formData, currentToken);
        if (result) {
          dispatch(setCourse(result));
          dispatch(setStep(2)); // Move to next step (Course Builder)
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    

    <form 
      onSubmit={handleSubmit(onSubmit)} 
      style={{
        width: '80%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 0'
      }}
    >
      {/* Course Information Section */}
      <div style={{
        // backgroundColor: '#ffffff',
        // borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        // border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1a202c',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #edf2f7'
        }}>Course Information</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="courseTitle">
            Course Title <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <input
            id="courseTitle"
            type="text"
            placeholder="Enter course title"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors.courseTitle ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: errors.courseTitle ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none'
            }}
            {...register('courseTitle', { required: 'Course title is required' })}
          />
          {errors.courseTitle && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.courseTitle.message}</p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="courseShortDesc">
            Course Short Description <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <textarea
            id="courseShortDesc"
            placeholder="Enter short description"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors.courseShortDesc ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              resize: 'vertical',
              outline: 'none',
              boxShadow: errors.courseShortDesc ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none'
            }}
            {...register('courseShortDesc', { 
              required: 'Short description is required',
              minLength: { value: 50, message: 'Description must be at least 50 characters' }
            })}
          />
          {errors.courseShortDesc && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.courseShortDesc.message}</p>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }}>
            Course Thumbnail <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <Upload
            name="courseImage"
            label="Choose Thumbnail"
            register={register}
            setValue={setValue}
            errors={errors}
            accept="image/png, image/jpg, image/jpeg"
            required={!editCourse}
          />
        </div>
      </div>

      {/* Course Details Section */}
      <div style={{
        // backgroundColor: '#ffffff',
        // borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        // border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1a202c',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #edf2f7'
        }}>Course Details</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="coursePrice">
            Course Price (in INR) <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <HiOutlineCurrencyRupee 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#718096',
                fontSize: '1.25rem'
              }} 
            />
            <input
              id="coursePrice"
              type="number"
              placeholder="Enter course price"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                fontSize: '0.875rem',
                border: `1px solid ${errors.coursePrice ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: errors.coursePrice ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
              min="0"
              {...register('coursePrice', { 
                required: 'Course price is required',
                min: { value: 0, message: 'Price cannot be negative' }
              })}
            />
          </div>
          {errors.coursePrice && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.coursePrice.message}</p>
          )}
        </div>

        

<div style={{ marginBottom: '1.5rem' }}>
  <label style={formStyles.label} htmlFor="courseCategory">
    Course Category <span style={{ color: '#e53e3e' }}>*</span>
  </label>
  <select
    id="courseCategory"
   
    style={{
      ...formStyles.select,
      border: `1px solid ${errors.courseCategory ? '#e53e3e' : '#e2e8f0'}`,
      boxShadow: errors.courseCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
       transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    }}
    {...register('courseCategory', { 
      required: 'Category is required',
      onChange: (e) => {
        // Force update when category changes
        setValue('courseCategory', e.target.value);
        setValue('courseSubCategory', '');
      }
    })}
  >
    <option value="" disabled>Choose a Category</option>
    {courseCategories.map((category) => (
      <option 
        key={category._id} 
        value={category._id}
        selected={watch('courseCategory') === category._id}
      >
        {category.name}
      </option>
    ))}
  </select>
  {errors.courseCategory && (
    <p style={formStyles.error}>{errors.courseCategory.message}</p>
  )}
</div>

<div style={{ marginBottom: '1.5rem' }}>
  <label style={formStyles.label} htmlFor="courseSubCategory">
    Course Sub-Category <span style={{ color: '#e53e3e' }}>*</span>
  </label>
  <select
    id="courseSubCategory"
    disabled={!selectedCategory || loading}
    style={{
      ...formStyles.select,
      border: `1px solid ${errors.courseSubCategory ? '#e53e3e' : '#e2e8f0'}`,
      boxShadow: errors.courseSubCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
      opacity: !selectedCategory || loading ? 0.7 : 1,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    }}
    {...register('courseSubCategory', { required: 'Sub-category is required' })}
  >
    <option value="" disabled>Choose a Sub-Category</option>
    {courseSubCategories.map((subCategory) => (
      <option 
        key={subCategory._id} 
        value={subCategory._id}
        selected={watch('courseSubCategory') === subCategory._id}
      >
        {subCategory.name}
      </option>
    ))}
    {loading && <option value="" disabled>Loading subcategories...</option>}
  </select>
  {errors.courseSubCategory && (
    <p style={formStyles.error}>{errors.courseSubCategory.message}</p>
  )}
</div>

        {/* <div style={{ marginBottom: '1.5rem' }}>
          <ChipInput 
            label="Tags" 
            name="courseTags" 
            placeholder="Enter tags and press enter" 
            register={register} 
            errors={errors} v
            setValue={setValue} 
            getValues={getValues} 
          />
        </div> */}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="courseBenefits">
            Benefits of the course <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <textarea
            id="courseBenefits"
            placeholder="Enter benefits of the course"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors.courseBenefits ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              resize: 'vertical',
              outline: 'none',
              boxShadow: errors.courseBenefits ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none'
            }}
            {...register('courseBenefits', { required: 'Benefits are required' })}
          />
          {errors.courseBenefits && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.courseBenefits.message}</p>
          )}
        </div>

        <div>
          <RequirementsField 
            name="courseRequirements" 
            label="Requirements/Instructions" 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            getValues={getValues} 
          />
        </div>
      </div>

      {/* Form Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '2rem'
      }}>
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e2e8f0',
              color: '#1a202c',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            Continue Without Saving
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: ED_TEAL,
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
            ':hover': {
              backgroundColor: ED_TEAL_DARK
            }
          }}
        >
          {!editCourse ? 'Next' : 'Save Changes'}
          <MdNavigateNext style={{ fontSize: '1.25rem' }} />
        </button>
      </div>
    </form>
  );
}



