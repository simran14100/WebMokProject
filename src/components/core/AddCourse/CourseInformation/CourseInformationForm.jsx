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
import { setToken } from '../../../../store/slices/authSlice';
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
  const { token: authToken, isAuthenticated } = useSelector((state) => state.auth);
  
  // Get token from multiple sources with priority
  const getAuthToken = () => {
    // 1. Try Redux auth state first
    if (authToken) return authToken;
    
    // 2. Try user object in profile state
    if (user?.token) {
      console.log('Using token from user profile');
      dispatch(setToken(user.token)); // Update auth state using dispatch hook
      return user.token;
    }
    
    // 3. Try localStorage
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken) {
      console.log('Using token from localStorage');
      dispatch(setToken(localStorageToken)); // Update auth state using dispatch hook
      return localStorageToken;
    }
    
    // 4. Check for debug token in development
    if (process.env.NODE_ENV === 'development') {
      const debugToken = localStorage.getItem('debug_token');
      if (debugToken) {
        console.warn('Using debug token from localStorage');
        dispatch(setToken(debugToken)); // Update auth state using dispatch hook
        return debugToken;
      }
    }
    
    console.warn('No authentication token found in any source');
    return null;
  };
  
  const token = getAuthToken();
  
  // Debug: Log auth state
  useEffect(() => {
    const state = store.getState();
    console.log('Auth state:', {
      hasToken: !!token,
      tokenSource: token ? 
        (state.auth.token === token ? 'auth' : 
         state.profile.user?.token === token ? 'profile' : 
         'localStorage') : 'None',
      user: user ? 'Authenticated' : 'No user',
      isAuthenticated: !!token && !!user,
      fullState: state
    });
    
    if (!token) {
      console.error('No authentication token found. User may need to log in again.');
      // Redirect to login if no token is found
      navigate('/login');
    }
  }, [token, navigate, user]);
  
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
    // Ensure RHF knows about these fields before any setValue calls
    try {
      if (typeof register === 'function') {
        register('courseCategory');
        register('courseSubCategory');
      }
    } catch (e) {
      console.warn('Register fallback failed (non-blocking):', e);
    }

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

  // Ensure clean intro video in create mode
  useEffect(() => {
    if (!editCourse) {
      try {
        setValue('introVideo', '', { shouldValidate: false, shouldDirty: false });
      } catch (_) {}
    }
  }, [editCourse, setValue]);

  // Effect to handle subcategory selection when subcategories change
  useEffect(() => {
    if (initialSubCategoryIdRef.current && courseSubCategories.length > 0) {
      const targetId = String(initialSubCategoryIdRef.current);
      const subCategoryExists = courseSubCategories.some(
        (subCat) => String(subCat._id || subCat) === targetId
      );
      
      if (subCategoryExists) {
        console.log('Setting subcategory from effect:', targetId);
        setValue('courseSubCategory', targetId, {
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
        const rawCategory = course.category ?? course.Category ?? course.categoryId ?? course.CategoryId;
        const rawSubCategory = course.subCategory ?? course.subcategory ?? course.subCategoryId ?? course.subcategoryId ?? course.sub_category ?? course.sub_category_id;
        const categoryId = String((rawCategory && (rawCategory._id || rawCategory.id)) || rawCategory || '');
        const subCategoryId = String((rawSubCategory && (rawSubCategory._id || rawSubCategory.id)) || rawSubCategory || '');
        
        console.log('=== COURSE DATA ===');
        console.log('Full course object:', course);
        console.log('Category ID:', categoryId);
        console.log('Subcategory ID:', subCategoryId);
        console.log('Subcategory object (raw):', rawSubCategory);
        
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
          // If API returned empty or missing the saved subcategory, inject it so UI can display current value
          let finalSubs = subCategories;
          if (
            editCourse && subCategoryId && (
              !Array.isArray(subCategories) || subCategories.length === 0 ||
              !subCategories.some((s) => String(s._id || s) === String(subCategoryId))
            )
          ) {
            const injected = {
              _id: String(subCategoryId),
              name: course?.subCategory?.name || 'Current Subcategory',
            };
            console.warn('Injecting current subcategory into options:', injected);
            finalSubs = [injected, ...(Array.isArray(subCategories) ? subCategories : [])];
          }
          setCourseSubCategories(finalSubs);
          // Ensure value is applied after options update
          Promise.resolve().then(() => {
            if (subCategoryId) {
              const currentVal = String(watch('courseSubCategory') || '');
              if (currentVal !== String(subCategoryId)) {
                console.log('Force-setting subcategory after options render:', subCategoryId);
                setValue('courseSubCategory', String(subCategoryId), {
                  shouldValidate: true,
                  shouldDirty: false,
                });
              }
            }
          });
          // Track the category ID we fetched for, not the watched field which may be stale
          lastFetchedCategoryRef.current = categoryId;
          
          // Set the subcategory if it exists in the loaded subcategories
          if (subCategoryId) {
            const subCategoryExists = finalSubs.some(
              (subCat) => String(subCat._id || subCat.id || subCat) === String(subCategoryId)
            );
            
            if (subCategoryExists) {
              console.log('Setting subcategory:', subCategoryId);
              setValue('courseSubCategory', String(subCategoryId), { 
                shouldValidate: true,
                shouldDirty: false 
              });
            } else {
              console.warn(`Subcategory ${subCategoryId} not found in loaded subcategories`);
            }
          } else if (editCourse) {
            // Try to infer by name if ID is missing
            const savedName = course?.subCategory?.name || course?.subcategory?.name || course?.subCategoryName || course?.subcategoryName || '';
            if (savedName) {
              const match = finalSubs.find((s) => (s.name || String(s))?.toLowerCase() === String(savedName).toLowerCase());
              if (match) {
                const idToSet = String(match._id || match.id || match);
                console.log('Resolved subcategory by name, setting ID:', { savedName, idToSet });
                setValue('courseSubCategory', idToSet, {
                  shouldValidate: true,
                  shouldDirty: false,
                });
                initialSubCategoryIdRef.current = idToSet;
                subCategoryIdRef.current = idToSet;
              } else {
                console.warn('Could not resolve subcategory by name:', savedName);
              }
            } else if (finalSubs && finalSubs.length > 0) {
              // As a last resort in edit mode, pick the first available subcategory
              const fallbackId = String(finalSubs[0]._id || finalSubs[0].id || finalSubs[0]);
              console.warn('No saved subcategory ID/name found. Auto-selecting first option:', fallbackId);
              setValue('courseSubCategory', fallbackId, {
                shouldValidate: true,
                shouldDirty: false,
              });
              initialSubCategoryIdRef.current = fallbackId;
              subCategoryIdRef.current = fallbackId;
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
  const hasFormChanges = () => {
    if (!initialFormData) return true; // If no initial data, consider it as changed

    const current = getValues();
    const fieldsToCheck = [
      'courseTitle',
      'courseShortDesc',
      'coursePrice',
      'courseBenefits',
      'courseCategory',
      'courseSubCategory',
      'courseImage',
      'introVideo',
    ];

    const anyFieldChanged = fieldsToCheck.some((key) => {
      return JSON.stringify(current[key]) !== JSON.stringify(initialFormData[key]);
    });

    // Compare requirements from the RHF field name 'courseRequirements'
    const currentRequirements = current.courseRequirements || [];
    const reqChanged = JSON.stringify(currentRequirements) !== JSON.stringify(initialFormData.requirements || []);

    // Compare tags from component state (authoritative)
    const tagsChanged = JSON.stringify(courseTags || []) !== JSON.stringify(initialFormData.courseTags || []);

    return anyFieldChanged || reqChanged || tagsChanged;
  };

  // Watch for category changes to load subcategories
  const selectedCategory = watch('courseCategory');

  // Store the initial subcategory ID when the component mounts or course changes
  useEffect(() => {
    if (editCourse) {
      const rawSubCategory = course?.subCategory ?? course?.subcategory ?? course?.subCategoryId ?? course?.subcategoryId ?? course?.sub_category ?? course?.sub_category_id;
      const subCategoryId = String((rawSubCategory && (rawSubCategory._id || rawSubCategory.id)) || rawSubCategory || '');
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
          
          // Inject saved subcategory if missing so UI can display it in edit mode
          const savedId = String(subCategoryIdRef.current || watch('courseSubCategory') || '');
          let finalSubs = subCategories;
          if (
            editCourse && savedId && (
              !Array.isArray(subCategories) || subCategories.length === 0 ||
              !subCategories.some((s) => String(s._id || s) === savedId)
            )
          ) {
            const injected = {
              _id: savedId,
              name: course?.subCategory?.name || 'Current Subcategory',
            };
            console.warn('Injecting current subcategory into options (category change):', injected);
            finalSubs = [injected, ...(Array.isArray(subCategories) ? subCategories : [])];
          }
          
          console.log('Setting subcategories:', finalSubs);
          setCourseSubCategories(finalSubs);
          
          // Ensure value is applied after options update
          Promise.resolve().then(() => {
            if (savedId) {
              const currentVal = String(watch('courseSubCategory') || '');
              if (currentVal !== savedId) {
                console.log('Force-setting subcategory after options render (category change):', savedId);
                setValue('courseSubCategory', savedId, { 
                  shouldValidate: true,
                  shouldDirty: false 
                });
              }
            } else if (editCourse && Array.isArray(finalSubs) && finalSubs.length > 0) {
              const fallbackId = String(finalSubs[0]._id || finalSubs[0].id || finalSubs[0]);
              console.warn('No saved subcategory during category change. Auto-selecting first option:', fallbackId);
              setValue('courseSubCategory', fallbackId, {
                shouldValidate: true,
                shouldDirty: false,
              });
              initialSubCategoryIdRef.current = fallbackId;
              subCategoryIdRef.current = fallbackId;
            }
          });
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

  // Helper function to convert file to base64 (only used for small files like thumbnails)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // For large files, we'll handle them directly in the form data
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for base64 conversion
        console.warn('File is too large for base64 conversion, will be handled as multipart form data');
        resolve(file); // Return the file as is for direct upload
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    
    // Check permissions first
    if (!checkCoursePermissions()) {
      return;
    }
    
    // Check if in edit mode and no changes were made
    if (editCourse && !hasFormChanges()) {
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

    // Do not move to Step 2 yet; wait for API success so we have course._id
    setLoading(true);
    
    try {
      // Get the current token from Redux store or localStorage
      const currentToken = token || localStorage.getItem('token');
      console.log('Current token from Redux:', token);
      console.log('Token from localStorage:', localStorage.getItem('token'));
      
      if (!currentToken) {
        console.error('No authentication token found in Redux or localStorage');
        console.log('Full Redux state:', store.getState());
        toast.error('Your session has expired. Please log in again.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Create form data with all required fields
      const formData = new FormData();
      
      // If editing, include the course ID in multiple formats for backend compatibility
      if (editCourse) {
        if (!course?._id) {
          throw new Error('Course ID is required for editing');
        }
        
        console.log('Editing course with ID:', course._id);
        
        // Add course ID in different formats for backend compatibility
        formData.append('courseId', course._id);
        formData.append('_id', course._id);
        formData.append('course._id', course._id);
        
        // Log the course ID being sent
        console.log('FormData courseId:', course._id);
        
        // Add course ID as a query parameter to the URL if needed
        const url = new URL(window.location.href);
        url.searchParams.set('courseId', course._id);
        window.history.replaceState({}, '', url);
      }
      
      // Required fields from the form - ensure field names match backend expectations
      formData.append('courseName', data.courseTitle || '');
      formData.append('courseDescription', data.courseShortDesc || '');
      formData.append('price', data.coursePrice || 0);
      formData.append('category', data.courseCategory || '');
      formData.append('whatYouWillLearn', data.courseBenefits || '');
      
      // Ensure all required fields are present with default values if empty
      if (!data.courseTitle) formData.set('courseName', 'Untitled Course');
      if (!data.courseShortDesc) formData.set('courseDescription', 'No description provided');
      if (!data.coursePrice) formData.set('price', 0);
      if (!data.courseCategory) formData.set('category', '');
      if (!data.courseBenefits) formData.set('whatYouWillLearn', 'No learning outcomes specified');
      
      // Use the filtered requirements
      console.log('Final requirements:', validRequirements);
      formData.append('instructions', JSON.stringify(validRequirements));
      
      // Default status for new courses
      formData.append('status', 'Draft');
      
      // Always include subCategory, even if empty (some backends might require it)
      formData.append('subCategory', data.courseSubCategory || '');
      
      // Handle thumbnail: prefer Cloudinary URL (string), else File->base64
      if (typeof data.courseImage === 'string' && data.courseImage) {
        formData.append('thumbnailImage', data.courseImage);
        console.log('Using Cloudinary thumbnail URL');
      } else if (data.courseImage instanceof File) {
        try {
          const base64Thumbnail = await fileToBase64(data.courseImage);
          formData.append('thumbnailImage', base64Thumbnail);
          console.log('Thumbnail converted to base64');
        } catch (error) {
          console.error('Error converting thumbnail to base64:', error);
          toast.error('Error processing thumbnail image');
          setLoading(false);
          return;
        }
      } else if (!editCourse) {
        // For new courses, thumbnail is recommended but do not block progression to next step
        console.warn('Thumbnail not provided for new course');
        toast((t) => 'Tip: Add a course thumbnail in Step 1 for better visibility');
      }

      // Handle intro video: Cloudinary URL or File
      if (typeof data.introVideo === 'string' && data.introVideo) {
        formData.append('introVideo', data.introVideo);
        console.log('Using Cloudinary intro video URL');
      } else if (data.introVideo instanceof File) {
        // For large files, we'll let the server handle the upload directly
        formData.append('introVideo', data.introVideo);
        console.log('Added video file for upload');
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
        // Ensure result is a valid course object
        if (!result._id) {
          console.error('Course create/edit returned without _id:', result);
          toast.error('Course not saved. Please try again.');
          return;
        }

        // Update Redux store with the course data
        dispatch(setCourse(result));

        toast.success(
          editCourse 
            ? 'Course updated successfully!'
            : 'Course created successfully!'
        );

        // Move to next step only after success
        dispatch(setStep(2));
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
            useSignedUploads={true}
            getSignature={async () => {
              const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
              const res = await fetch(`${baseUrl}/api/v1/cloudinary/signature`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({}),
                credentials: 'include',
              });
              const json = await res.json();
              if (!res.ok || !json.success) throw new Error(json.message || 'Failed to get signature');
              return json.data;
            }}
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
            key={editCourse ? 'intro-edit' : 'intro-create'}
            name="introVideo"
            label="Choose Intro Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            required={false}
            editData={editCourse ? (course?.introVideo || '') : ''}
            viewData={editCourse ? (course?.introVideo || '') : ''}
            useSignedUploads={true}
            getSignature={async () => {
              const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
              const res = await fetch(`${baseUrl}/api/v1/cloudinary/signature`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({}),
                credentials: 'include',
              });
              const json = await res.json();
              if (!res.ok || !json.success) throw new Error(json.message || 'Failed to get signature');
              return json.data;
            }}
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
            {...register('courseCategory', { 
              required: 'Category is required'
            })}
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
          {(() => {
            const watchedVal = watch('courseSubCategory');
            const computedSubValue = String(watchedVal || initialSubCategoryIdRef.current || '');
            if (process.env.NODE_ENV !== 'production') {
              console.log('Subcategory select computed value:', { watchedVal, initialRef: initialSubCategoryIdRef.current, computedSubValue });
            }
            return (
          <select
            id="courseSubCategory"
            style={{
              ...formStyles.select,
              border: `1px solid ${errors.courseSubCategory ? '#e53e3e' : '#e2e8f0'}`,
              boxShadow: errors.courseSubCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              opacity: courseSubCategories.length > 0 ? 1 : 0.7
            }}
            disabled={(loading) || (!watch('courseCategory') && !editCourse)}
            value={computedSubValue}
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
            {...register('courseSubCategory', { 
              required: 'Subcategory is required',
              validate: (value) => {
                const isValid = !!value;
                if (!isValid) return 'Please select a subcategory';
                // Ensure selected value exists in the available options
                const exists = courseSubCategories.some(
                  (subCat) => String(subCat._id || subCat) === String(value)
                );
                return exists || 'Selected subcategory is not valid for the chosen category';
              }
            })}
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
              const subCategoryId = String(subCategory._id || subCategory);
              const name = subCategory.name || subCategory;
              const isSelected = String(computedSubValue) === subCategoryId;
              
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
            )
          })()}
          {errors.courseSubCategory && (
            <p style={formStyles.error}>{errors.courseSubCategory.message}</p>
          )}
          
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
