import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFormContext } from 'react-hook-form';
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
    trigger,
    formState: { errors },
  } = useForm();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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
  
  // State declarations
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);
  const [courseSubCategories, setCourseSubCategories] = useState([]);
  const [courseTags, setCourseTags] = useState([]);
  const [requirements, setRequirements] = useState(['']);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  // Refs
  const subCategoryIdRef = React.useRef('');
  const initialSubCategoryIdRef = React.useRef('');
  const lastFetchedCategoryRef = React.useRef(null);

  // Form styles
  const formStyles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      '& *:focus': {
        outline: 'none',
        boxShadow: 'none !important',
      },
      '& *:focus-visible': {
        outline: 'none',
        boxShadow: 'none !important',
      },
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
      '&:focus': {
        outline: 'none',
        boxShadow: 'none',
        borderColor: '#e2e8f0',
      },
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
      transition: 'all 0.2s ease',
      marginBottom: '1rem',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      '&:focus': {
        outline: 'none',
        boxShadow: 'none',
        borderColor: '#e2e8f0',
      },
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

  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValue('courseImage', file, { shouldValidate: true });
    } else if (editCourse && course?.thumbnail) {
      // If file input is cleared in edit mode, reset to original thumbnail
      setThumbnailPreview(course.thumbnail);
      setValue('courseImage', course.thumbnail, { shouldValidate: true });
    } else {
      setThumbnailPreview('');
      setValue('courseImage', '', { shouldValidate: true });
    }
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

  // Debug: Log course data when it changes
  useEffect(() => {
    console.log('Course data:', course);
    console.log('Edit mode:', editCourse);
  }, [course, editCourse]);

  // Store initial form data for comparison
  const [initialFormData, setInitialFormData] = useState(null);

  // Effect to handle subcategory selection when subcategories change
  useEffect(() => {
    if (initialSubCategoryIdRef.current && courseSubCategories.length > 0) {
      const subCategoryExists = courseSubCategories.some(
        subCat => subCat._id === initialSubCategoryIdRef.current || subCat === initialSubCategoryIdRef.current
      );
      
      if (subCategoryExists) {
        console.log('Setting subcategory from effect:', initialSubCategoryIdRef.current);
        setValue('courseSubCategory', initialSubCategoryIdRef.current, {
          shouldValidate: true,
          shouldDirty: false
        });
      }
    }
  }, [courseSubCategories, setValue]);

  // Set form values if in edit mode
  useEffect(() => {
    let isMounted = true;
    
    const initializeForm = async () => {
      if (!editCourse || !course) return;
      
      console.log('=== INITIALIZING FORM IN EDIT MODE ===');
      console.log('Course data:', course);
      
      try {
        // 1. First, load all categories
        console.log('Loading categories...');
        const categories = await fetchCourseCategories();
        if (!isMounted) return;
        
        setCourseCategories(categories);
        console.log('Categories loaded:', categories);
        
        // Get category and subcategory info with better debugging
        const categoryId = course.category?._id || course.category || '';
        const subCategoryId = course.subCategory?._id || course.subCategory || '';
        
        console.log('=== COURSE DATA ===');
        console.log('Full course object:', course);
        console.log('Category ID:', categoryId);
        console.log('Subcategory ID:', subCategoryId);
        console.log('Subcategory object:', course.subCategory);
        
        // 2. Set basic form values
        const initialValues = {
          courseTitle: course.courseName || '',
          courseShortDesc: course.courseDescription || '',
          coursePrice: course.price || 0,
          courseBenefits: course.whatYouWillLearn || '',
          courseCategory: categoryId,
          courseSubCategory: subCategoryId, // This will be set after subcategories load
          courseImage: course.thumbnail || '',
          introVideo: course.introVideo || '',
          courseTags: Array.isArray(course.tag) ? course.tag : (course.tag ? [course.tag] : []),
          requirements: course.instructions?.length > 0 ? course.instructions : ['']
        };
        
        // Store the subcategory ID in the component ref
        subCategoryIdRef.current = subCategoryId;
        initialSubCategoryIdRef.current = subCategoryId;
        
        console.log('Setting initial form values:', initialValues);
        
        // Set all basic values
        Object.entries(initialValues).forEach(([key, value]) => {
          setValue(key, value, { shouldValidate: true, shouldDirty: false });
        });
        
        // Set local state
        setCourseTags(initialValues.courseTags);
        setRequirements(initialValues.requirements);
        
        // 3. If we have a category, load its subcategories
        if (categoryId) {
          console.log(`Loading subcategories for category: ${categoryId}`);
          const subCategories = await fetchCourseSubCategories(categoryId);
          if (!isMounted) return;
          
          console.log('Subcategories loaded:', subCategories);
          setCourseSubCategories(subCategories);
          lastFetchedCategoryRef.current = selectedCategory;
          
          // Set the subcategory if it exists in the loaded subcategories
          if (subCategoryId) {
            const subCategoryExists = subCategories.some(
              subCat => subCat._id === subCategoryId || subCat === subCategoryId
            );
            
            if (subCategoryExists) {
              console.log('Setting subcategory:', subCategoryId);
              setValue('courseSubCategory', subCategoryId, { 
                shouldValidate: true,
                shouldDirty: false 
              });
            } else {
              console.warn(`Subcategory ${subCategoryId} not found in loaded subcategories`);
            }
          }
        }
        
        // 4. Handle thumbnail
        if (course.thumbnail) {
          console.log('Processing thumbnail:', course.thumbnail);
          if (typeof course.thumbnail === 'string') {
            // Handle both full URLs and relative paths
            const fullUrl = course.thumbnail.startsWith('http') 
              ? course.thumbnail 
              : `${process.env.REACT_APP_BASE_URL || ''}${course.thumbnail}`;
            
            console.log('Setting thumbnail URL:', fullUrl);
            setThumbnailPreview(fullUrl);
            setValue('courseImage', fullUrl, { 
              shouldValidate: true,
              shouldDirty: false
            });
          } else if (course.thumbnail instanceof File || course.thumbnail instanceof Blob) {
            console.log('Processing thumbnail file');
            const reader = new FileReader();
            reader.onloadend = () => {
              if (!isMounted) return;
              console.log('Thumbnail loaded successfully');
              setThumbnailPreview(reader.result);
              setValue('courseImage', course.thumbnail, { 
                shouldValidate: true,
                shouldDirty: false
              });
            };
            reader.onerror = (error) => {
              console.error('Error reading thumbnail file:', error);
            };
            reader.readAsDataURL(course.thumbnail);
          } else {
            console.warn('Unsupported thumbnail format:', course.thumbnail);
          }
        }
        
        // 5. Store initial form data for change detection
        setInitialFormData({
          ...initialValues,
          requirements: [...initialValues.requirements],
          courseTags: [...initialValues.courseTags],
          courseImage: course.thumbnail || ''
        });
        
      } catch (error) {
        console.error('Error initializing form:', error);
        toast.error('Failed to initialize form');
      }
    };
    
    initializeForm();
    
    return () => {
      isMounted = false;
    };
  }, [editCourse, course, setValue]);

  // Function to check if form has changes
  const hasFormChanges = (formData) => {
    if (!initialFormData) return true; // If no initial data, consider it as changed
    
    const fieldsToCheck = [
      'courseTitle', 
      'courseShortDesc', 
      'coursePrice', 
      'courseBenefits',
      'courseCategory',
      'courseSubCategory',
      'courseImage',
      'introVideo'
    ];

    // Check if any field has changed
    const hasChanges = fieldsToCheck.some(key => {
      return JSON.stringify(formData[key]) !== JSON.stringify(initialFormData[key]);
    });

    // Check if requirements have changed
    const reqChanged = JSON.stringify(formData.requirements || []) !== 
                      JSON.stringify(initialFormData.requirements || []);
    
    // Check if tags have changed
    const tagsChanged = JSON.stringify(formData.courseTags || []) !== 
                       JSON.stringify(initialFormData.courseTags || []);

    return hasChanges || reqChanged || tagsChanged;
  };

  // Watch for category changes to load subcategories
  const selectedCategory = watch('courseCategory');

  // Store the initial subcategory ID when the component mounts or course changes
  useEffect(() => {
    if (editCourse && course?.subCategory) {
      const subCategoryId = course.subCategory?._id || course.subCategory;
      console.log('Initial subcategory ID from course:', subCategoryId);
      subCategoryIdRef.current = subCategoryId;
      initialSubCategoryIdRef.current = subCategoryId;
      
      // Set the subcategory value immediately if we have it
      if (subCategoryId) {
        console.log('Setting initial subcategory value:', subCategoryId);
        setValue('courseSubCategory', subCategoryId, { 
          shouldValidate: true,
          shouldDirty: false 
        });
        
        // No forced update needed; react-hook-form value change triggers re-render
      }
    }
  }, [editCourse, course, setValue]);

  useEffect(() => {
    const getSubCategories = async () => {
      if (selectedCategory) {
        // Skip fetch if we already fetched for this category and have data
        if (lastFetchedCategoryRef.current === selectedCategory && courseSubCategories.length > 0) {
          return;
        }
        setLoading(true);
        try {
          const response = await fetchCourseSubCategories(selectedCategory);
          console.log('Full API response:', response);
          
          // Handle different response structures
          const subCategories = Array.isArray(response) ? response : (response?.data || []);
          
          console.log('Setting subcategories:', subCategories);
          setCourseSubCategories(subCategories);
          
          // If we're in edit mode and have a subcategory, ensure it's set
          const subCategoryId = subCategoryIdRef.current || watch('courseSubCategory');
          
          if (subCategoryId) {
            console.log('Attempting to set subcategory:', subCategoryId);
            
            // Find the matching subcategory
            const matchingSubCategory = subCategories.find(
              subCat => (subCat._id === subCategoryId || subCat === subCategoryId)
            );
            
            if (matchingSubCategory) {
              const idToSet = matchingSubCategory._id || matchingSubCategory;
              console.log('Found matching subcategory, setting value to:', idToSet);
              
              // Use setTimeout to ensure this runs after the state update
              // Only update if value actually differs
              const currentVal = watch('courseSubCategory');
              if (currentVal !== idToSet) {
                setValue('courseSubCategory', idToSet, { 
                  shouldValidate: true,
                  shouldDirty: false 
                });
              }
            } else {
              console.warn(`Subcategory ${subCategoryId} not found in loaded subcategories`);
            }
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          toast.error('Failed to load subcategories');
        } finally {
          setLoading(false);
        }
      } else {
        setCourseSubCategories([]);
        setValue('courseSubCategory', '', { shouldValidate: true });
      }
    };

    getSubCategories();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [selectedCategory, editCourse, course?.subCategory, setValue]);

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
        currentValues.courseImage !== course.thumbnail ||
        currentValues.introVideo !== (course.introVideo || '')
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
    
    // Check if in edit mode and no changes were made
    if (editCourse && !hasFormChanges(data)) {
      toast('No changes were made to the course');
      // Do not advance steps; keep user on the same form
      return;
    }
    
    // Get the current requirements from the form state
    const formRequirements = getValues('courseRequirements') || [];
    console.log('Form requirements:', formRequirements);
    
    // Filter out any empty requirements
    const validRequirements = Array.isArray(formRequirements) 
      ? formRequirements.filter(req => req && req.trim() !== '')
      : [];
    console.log('Valid requirements:', validRequirements);
    
    // Ensure we have at least one valid requirement
    if (validRequirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

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
      if (editCourse && course?._id) {
        console.log('Editing course with ID:', course._id);
        formData.append('courseId', course._id);
        formData.append('_id', course._id); // Some APIs might expect _id
      }
      
      // Required fields from the form
      formData.append('courseName', data.courseTitle || '');
      formData.append('courseDescription', data.courseShortDesc || '');
      formData.append('price', data.coursePrice || 0);
      formData.append('category', data.courseCategory || '');
      formData.append('whatYouWillLearn', data.courseBenefits || '');
      
      // Use the filtered requirements
      console.log('Final requirements:', validRequirements);
      formData.append('instructions', JSON.stringify(validRequirements));
      
      // Default status for new courses
      formData.append('status', 'Draft');
      
      // Always include subCategory, even if empty (some backends might require it)
      formData.append('subCategory', data.courseSubCategory || '');
      
      // Handle thumbnail upload
      if (data.courseImage instanceof File) {
        // New file was uploaded
        formData.append('thumbnailImage', data.courseImage);
        console.log('New thumbnail file attached:', data.courseImage.name);
      } else if (editCourse && typeof data.courseImage === 'string') {
        // In edit mode, if courseImage is a string (URL), it's the existing thumbnail
        formData.append('thumbnailUrl', data.courseImage);
        console.log('Using existing thumbnail URL');
      } else if (!editCourse) {
        // For new courses, require a thumbnail
        console.error('Thumbnail is required');
        toast.error('Please upload a course thumbnail');
        setLoading(false);
        return;
      }

      // Handle intro video upload or URL (optional)
      if (data.introVideo instanceof File) {
        formData.append('introVideo', data.introVideo);
        console.log('Intro video file attached:', data.introVideo.name);
      } else if (editCourse && typeof data.introVideo === 'string' && data.introVideo) {
        formData.append('introVideoUrl', data.introVideo);
        console.log('Using existing intro video URL');
      }

      // Log form data for debugging
      console.log('=== FormData contents ===');
      const formDataObj = {};
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
        formDataObj[key] = value;
      }
      console.log('=== End FormData ===');

      // Call the appropriate API based on edit mode
      const result = editCourse 
        ? await editCourseDetails(formData, currentToken)
        : await addCourseDetails(formData, currentToken);

      console.log('API Response:', result);
      
      if (result) {
        // Update Redux store with the course data
        dispatch(setCourse(result));

        toast.success(
          editCourse 
            ? 'Course updated successfully!'
            : 'Course created successfully!'
        );

        // Navigate on create; keep step flow on edit
        if (!editCourse) {
          navigate('/admin/course/allCourses');
        } else {
          dispatch(setStep(2));
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while saving the course. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 0'
        }}
      >
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1a202c',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #edf2f7'
          }}>Course Information</h2>
        </div>
        
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
            {/* Course Thumbnail <span style={{ color: '#e53e3e' }}>*</span> */}
          </label>
          <Upload
            name="courseImage"
            label="Choose Thumbnail"
            register={register}
            setValue={setValue}
            errors={errors}
            accept="image/png, image/jpg, image/jpeg"
            required={!editCourse}
            editData={thumbnailPreview || ''}
            viewData={thumbnailPreview || ''}
          />
        </div>

        {/* Intro Video Section (optional) */}
        <div style={{ marginTop: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }}>
            {/* Intro Video (optional) */}
          </label>
          <Upload
            name="introVideo"
            label="Choose Intro Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            required={false}
            editData={course?.introVideo || ''}
            viewData={course?.introVideo || ''}
          />
        </div>

        {/* Course Details Section */}
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
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
            value={watch('courseCategory') || ''}
            onChange={(e) => {
              const categoryId = e.target.value;
              setValue('courseCategory', categoryId, { shouldValidate: true });
              setValue('courseSubCategory', '', { shouldValidate: true });
              
              // Fetch subcategories for the selected category
              if (categoryId) {
                fetchCourseSubCategories(categoryId)
                  .then(subCategories => {
                    setCourseSubCategories(subCategories);
                  })
                  .catch(error => {
                    console.error('Error fetching subcategories:', error);
                    toast.error('Failed to load subcategories');
                  });
              } else {
                setCourseSubCategories([]);
              }
            }}
            ref={register('courseCategory', { 
              required: 'Category is required'
            }).ref}
          >
            <option value="" disabled>Choose a Category</option>
            {courseCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.courseCategory && (
            <p style={formStyles.error}>{errors.courseCategory.message}</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={formStyles.label} htmlFor="courseSubCategory">
            Course Subcategory <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <select
            id="courseSubCategory"
            style={{
              ...formStyles.select,
              border: `1px solid ${errors.courseSubCategory ? '#e53e3e' : '#e2e8f0'}`,
              boxShadow: errors.courseSubCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              opacity: courseSubCategories.length > 0 ? 1 : 0.7
            }}
            disabled={!watch('courseCategory') || loading}
            value={watch('courseSubCategory') || ''}
            onChange={(e) => {
              const value = e.target.value;
              console.log('Subcategory changed to:', value);
              setValue('courseSubCategory', value, { 
                shouldValidate: true,
                shouldDirty: true
              });
            }}
            onBlur={() => {
              trigger('courseSubCategory');
            }}
            ref={register('courseSubCategory', { 
              required: 'Subcategory is required',
              validate: (value) => {
                const isValid = !!value;
                return isValid || 'Please select a subcategory';
              }
            }).ref}
            required
          >
            <option value="">
              {!watch('courseCategory') 
                ? 'Please select a category first' 
                : loading
                  ? 'Loading subcategories...'
                  : courseSubCategories.length === 0 
                    ? 'No subcategories available' 
                    : 'Select a subcategory'}
            </option>
            {courseSubCategories.map((subCategory) => {
              const subCategoryId = subCategory._id || subCategory;
              const name = subCategory.name || subCategory;
              const isSelected = watch('courseSubCategory') === subCategoryId;
              
              console.log('Subcategory option:', { id: subCategoryId, name, isSelected });
              
              return (
                <option 
                  key={subCategoryId} 
                  value={subCategoryId}
                >
                  {name}
                </option>
              );
            })}
          </select>
          {errors.courseSubCategory && (
            <p style={formStyles.error}>{errors.courseSubCategory.message}</p>
          )}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
            Current value: {watch('courseSubCategory') || 'Not selected'}
          </div>
        </div>

        {errors.courseCategory && (
          <p style={formStyles.error}>{errors.courseCategory.message}</p>
        )}

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

      
      {/* Form Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '2rem',
        padding: '0 1rem 2rem 1rem'
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
  </div>
  );
}
