const coursesData = {
    ug: {
      title: "Undergraduate (UG) Courses",
      registrationFee: 2000,
      courses: {
        "B.Sc Physics (Honours)": { courseFee: 120000, semesterFee: 60000 },
        "B.Sc Chemistry (Honours)": { courseFee: 115000, semesterFee: 57500 },
        "B.A English": { courseFee: 100000, semesterFee: 50000 },
        "B.Com": { courseFee: 110000, semesterFee: 55000 },
        "B.Tech Computer Science": { courseFee: 350000, semesterFee: 175000 },
      },
    },
  
    pg: {
      title: "Postgraduate (PG) Courses",
      registrationFee: 3000,
      courses: {
        "M.Sc Physics": { courseFee: 150000, semesterFee: 75000 },
        "M.Sc Chemistry": { courseFee: 145000, semesterFee: 72500 },
        "M.A English": { courseFee: 130000, semesterFee: 65000 },
        "MBA": { courseFee: 280000, semesterFee: 140000 },
        "M.Tech Computer Science": { courseFee: 400000, semesterFee: 200000 },
      },
    },
  
    phd: {
      title: "Doctoral (PhD) Courses",
      registrationFee: 5000,
      courses: {
        "PhD Physics": { courseFee: 200000, semesterFee: 100000 },
        "PhD Chemistry": { courseFee: 190000, semesterFee: 95000 },
        "PhD English": { courseFee: 170000, semesterFee: 85000 },
        "PhD Computer Science": { courseFee: 220000, semesterFee: 110000 },
      },
    },
  };
  
  export default coursesData;
  