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
  const { token } = useSelector((state) => state.auth);
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

  // Handle form submission
  const onSubmit = async (data) => {
    if (!isFormUpdated()) {
      toast.error('No changes made to update');
      return;
    }

    if (courseTags.length === 0) {
      toast.error('Please add at least one course tag');
      return;
    }

    if (requirements.length === 1 && requirements[0] === '') {
      toast.error('Please add at least one requirement');
      return;
    }

    const formData = new FormData();
    formData.append('courseName', data.courseTitle);
    formData.append('courseDescription', data.courseShortDesc);
    formData.append('price', data.coursePrice);
    formData.append('tag', JSON.stringify(courseTags));
    formData.append('whatYouWillLearn', data.courseBenefits);
    formData.append('category', data.courseCategory);
    formData.append('subCategory', data.courseSubCategory);
    formData.append('instructions', JSON.stringify(data.courseRequirements));
    formData.append('thumbnailImage', data.courseImage);

    setLoading(true);
    if (editCourse) {
      if (isFormUpdated()) {
        formData.append('courseId', course._id);
        const result = await editCourseDetails(formData, token);
        if (result) {
          dispatch(setStep(2));
          dispatch(setCourse(result));
        }
      } else {
        toast.error('No changes made');
      }
    } else {
      formData.append('status', 'Draft');
      const result = await addCourseDetails(formData, token);
      if (result) {
        dispatch(setStep(2));
        dispatch(setCourse(result));
      }
    }
    setLoading(false);
  };

  return (
    // <form onSubmit={handleSubmit(onSubmit)} style={formStyles.container}>
    //   {/* Course Information Section */}
    //   <div style={formStyles.section}>
    //     <h2 style={formStyles.sectionTitle}>Course Information</h2>
        
    //     <div>
    //       <label style={formStyles.label} htmlFor="courseTitle">
    //         Course Title <span style={{ color: '#e53e3e' }}>*</span>
    //       </label>
    //       <input
    //         id="courseTitle"
    //         type="text"
    //         placeholder="Enter course title"
    //         style={formStyles.input}
    //         {...register('courseTitle', { required: 'Course title is required' })}
    //       />
    //       {errors.courseTitle && (
    //         <p style={formStyles.error}>{errors.courseTitle.message}</p>
    //       )}
    //     </div>

    //     <div>
    //       <label style={formStyles.label} htmlFor="courseShortDesc">
    //         Course Short Description <span style={{ color: '#e53e3e' }}>*</span>
    //       </label>
    //       <textarea
    //         id="courseShortDesc"
    //         placeholder="Enter short description"
    //         style={formStyles.textarea}
    //         {...register('courseShortDesc', { 
    //           required: 'Short description is required',
    //           minLength: { value: 50, message: 'Description must be at least 50 characters' }
    //         })}
    //       />
    //       {errors.courseShortDesc && (
    //         <p style={formStyles.error}>{errors.courseShortDesc.message}</p>
    //       )}
    //     </div>

    //     <div>
    //       <label style={formStyles.label}>
    //         Course Thumbnail <span style={{ color: '#e53e3e' }}>*</span>
    //       </label>
    //       <Upload
    //         name="courseImage"
    //         label="Choose Thumbnail"
    //         register={register}
    //         setValue={setValue}
    //         errors={errors}
    //         accept="image/png, image/jpg, image/jpeg"
    //         required={!editCourse}
    //       />
    //     </div>
    //   </div>

    //   {/* Course Details Section */}
    //   <div style={formStyles.section}>
    //     <h2 style={formStyles.sectionTitle}>Course Details</h2>
        
    //     <div>
    //       <label style={formStyles.label} htmlFor="coursePrice">
    //         Course Price (in INR) <span style={{ color: '#e53e3e' }}>*</span>
    //       </label>
    //       <div style={{ position: 'relative' }}>
    //         <HiOutlineCurrencyRupee 
    //           style={{
    //             position: 'absolute',
    //             left: '12px',
    //             top: '50%',
    //             transform: 'translateY(-50%)',
    //             color: '#718096',
    //             fontSize: '1.25rem'
    //           }} 
    //         />
    //         <input
    //           id="coursePrice"
    //           type="number"
    //           placeholder="Enter course price"
    //           style={{
    //             ...formStyles.input,
    //             paddingLeft: '40px',
    //             WebkitAppearance: 'none',
    //             MozAppearance: 'textfield'
    //           }}
    //           min="0"
    //           {...register('coursePrice', { 
    //             required: 'Course price is required',
    //             min: { value: 0, message: 'Price cannot be negative' }
    //           })}
    //         />
    //       </div>
    //       {errors.coursePrice && (
    //         <p style={formStyles.error}>{errors.coursePrice.message}</p>
    //       )}
    //     </div>
    //     <label htmlFor='courseCategory' className='text-sm text-richblack-5'>Course Category <sup className='text-pink-200'>*</sup></label>
    //     <select id='courseCategory' defaultValue='' {...register('courseCategory', { required: true })} className='form-style w-full'>
    //       <option value='' disabled>Choose a Category</option>
    //       {!loading && courseCategories.map((category) => (
    //         <option key={category._id} value={category._id}>{category.name}</option>
    //       ))}
    //     </select>
    //     {errors.courseCategory && <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Category is required</span>}
    //   </div>

    //   <div>
    //     <label htmlFor='courseSubCategory' className='text-sm text-richblack-5'>Course Sub-Category <sup className='text-pink-200'>*</sup></label>
    //     <select id='courseSubCategory' defaultValue='' {...register('courseSubCategory', { required: true })} className='form-style w-full' disabled={!selectedCategory || loading}>
    //       <option value='' disabled>Choose a Sub Category</option>
    //       {!loading && courseSubCategories.map((subCategory) => (
    //         <option key={subCategory._id} value={subCategory._id}>{subCategory.name}</option>
    //       ))}
    //     </select>
    //     {errors.courseSubCategory && <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Sub-Category is required</span>}
    //   </div>

    //   <ChipInput label='Tags' name='courseTags' placeholder='Enter tags and press enter' register={register} errors={errors} setValue={setValue} getValues={getValues} />

    //   <Upload name='courseImage' label='Course Thumbnail' register={register} setValue={setValue} errors={errors} editData={editCourse ? course?.thumbnail : null} />

    //   <div>
    //     <label htmlFor='courseBenefits' className='text-sm text-richblack-5'>Benefits of the course <sup className='text-pink-200'>*</sup></label>
    //     <textarea id='courseBenefits' placeholder='Enter benefits of the course' {...register('courseBenefits', { required: true })} className='form-style resize-x-none min-h-[130px] w-full' />
    //     {errors.courseBenefits && <span className='ml-2 text-xs tracking-wide text-pink-200'>Benefits of the course are required</span>}
    //   </div>

    //   <RequirementsField name='courseRequirements' label='Requirements/Instructions' register={register} errors={errors} setValue={setValue} getValues={getValues} />

    //   <div className='flex justify-end gap-x-2'>
    //     {editCourse && (
    //       <button onClick={() => dispatch(setStep(2))} disabled={loading} className='flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900'>
    //         Continue Without Saving
    //       </button>
    //     )}
    //     <button type='submit' disabled={loading} style={{ backgroundColor: ED_TEAL }} className='flex items-center gap-x-2 rounded-md py-2 px-5 font-semibold text-white'>
    //       {!editCourse ? 'Next' : 'Save Changes'}
    //       <MdNavigateNext />
    //     </button>
    //   </div>
    // </form>

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

        {/* <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="courseCategory">
            Course Category <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <select
            id="courseCategory"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors.courseCategory ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: errors.courseCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjd2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center'
            }}
            {...register('courseCategory', { required: 'Category is required' })}
          >
            <option value="" disabled>Choose a Category</option>
            {!loading && courseCategories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          {errors.courseCategory && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.courseCategory.message}</p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }} htmlFor="courseSubCategory">
            Course Sub-Category <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <select
            id="courseSubCategory"
            disabled={!selectedCategory || loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors.courseSubCategory ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: errors.courseSubCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjd2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              opacity: !selectedCategory || loading ? 0.7 : 1
            }}
            {...register('courseSubCategory', { required: 'Sub-category is required' })}
          >
            <option value="" disabled>Choose a Sub-Category</option>
            {!loading && courseSubCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>{subCategory.name}</option>
            ))}
          </select>
          {errors.courseSubCategory && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#e53e3e'
            }}>{errors.courseSubCategory.message}</p>
          )}
        </div> */}

<div style={{ marginBottom: '1.5rem' }}>
  <label style={formStyles.label} htmlFor="courseCategory">
    Course Category <span style={{ color: '#e53e3e' }}>*</span>
  </label>
  <select
    id="courseCategory"
    style={{
      ...formStyles.select,
      border: `1px solid ${errors.courseCategory ? '#e53e3e' : '#e2e8f0'}`,
      boxShadow: errors.courseCategory ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none'
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
      opacity: !selectedCategory || loading ? 0.7 : 1
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
            errors={errors} 
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



