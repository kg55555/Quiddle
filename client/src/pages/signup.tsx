// pages/signup.tsx - Basic Quizzle signup
import Footer from "components/organisms/footer";
import Header from "components/organisms/header";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
 import {
   Formik,
   FormikHelpers,
   FormikProps,
   Form,
   Field,
   FieldProps,
 } from 'formik';

interface FormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  institutionID: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidInstitutions {
  institutionID: number;
  institutionName: string;
  validEmail: string[];
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    institutionID: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validInstitutions: ValidInstitutions[] = [
    { institutionID: 1,
      institutionName: "BCIT",
      validEmail: ["bcit.ca", "my.bcit.ca"], 
    },
    { institutionID: 2,
      institutionName: "UBC",
      validEmail: ["ubc.ca", "student.ubc.ca"], 
    },
    { institutionID: 3,
      institutionName: "SFU",
      validEmail: ["sfu.ca", "student.sfu.ca"], 
    },
  ];

  const institutionOptions = validInstitutions.map((institution) => ({
    value: institution.institutionID,
    label: institution.institutionName,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .matches(/^[A-Za-z]+$/, 'Only letters are allowed')
    .required('Required'),
  middleName: Yup.string()
    .max(50, 'Too Long!')
    .matches(/^[A-Za-z]+$/, 'Only letters are allowed')
    .nullable(),
  lastName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .matches(/^[A-Za-z]+$/, 'Only letters are allowed')
    .required('Required'),
  institutionID: Yup.string()
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required').when('institutionID', {
    is: (institutionID: string) => institutionID !== "",
    then: (schema) => schema.test('email-domain', 'Email domain does not match institution', function(value) {
      const institution = validInstitutions.find(i => i.institutionID === parseInt(this.parent.institutionID));
      if (!institution) return false;
      const emailDomain = value?.split('@')[1];
      return institution.validEmail.includes(emailDomain);
    }),
  }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Must contain: 1 uppercase, 1 lowercase, 1 number, and 1 symbol among @$!%*?&'
    )
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
});

  return (
    // Background
    <>
    <Header />
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 lg:p-16 flex items-center justify-center">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center"> {/* #1, #2 */}
        
        {/* Left: Welcome */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Welcome to
          </h1>
          <h2 className="text-6xl lg:text-7xl font-black text-gray-900 mb-6">
            Quiddle
          </h2>
          <div className="flex justify-center lg:justify-start">
            <p className="text-lg  text-gray-600 max-w-lg">
              Join thousands of students mastering their courses!
            </p>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            
            {/*Card Title*/}
            <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sign up page
            </h3>

            <Formik
              initialValues={form}
              validationSchema={SignupSchema}
              onSubmit={(values) => {
                setIsSubmitting(true);
                console.log({values});
                setIsSubmitting(true);
              }}
            >
              {({ errors, touched }: FormikProps<FormData>) => (
              <Form>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">First Name</label>
                {errors.firstName && touched.firstName ? (<div className="text-red-500 text-sm">{errors.firstName}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="firstName" name="firstName" placeholder="First Name" />
                </div>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="middleName">Middle Name (Optional)</label>
                {errors.middleName && touched.middleName ? (<div className="text-red-500 text-sm">{errors.middleName}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="middleName" name="middleName" placeholder="Middle Name" />
                </div>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
                {errors.lastName && touched.lastName ? (<div className="text-red-500 text-sm">{errors.lastName}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="lastName" name="lastName" placeholder="Last Name" />
                </div>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="institutionID">Institution</label>
                {errors.institutionID && touched.institutionID ? (<div className="text-red-500 text-sm">{errors.institutionID}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="institutionID" name="institutionID" as="select" >
                  <option value="" disabled>Select your institution</option>
                  {institutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                </div>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email</label>
                {errors.email && touched.email ? (<div className="text-red-500 text-sm">{errors.email}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="email" name="email" placeholder="Email" type="email" />
                </div>
                <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
                {errors.password && touched.password ? (<div className="text-red-500 text-sm">{errors.password}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="password" name="password" placeholder="Password" type="password" />
                </div>
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
                {errors.confirmPassword && touched.confirmPassword ? (<div className="text-red-500 text-sm">{errors.confirmPassword}</div>) : null}
                <Field className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" type="password" />
                </div>

                {/* Create Account Button*/}
                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                    >
                    Create Account
                  </button>
                </div>
              </Form>)}
            </Formik>
            
            {/* Login button */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <Link 
                to="/login" 
                className="block w-full py-3 px-6 border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mx-auto max-w-sm"
              >
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Signup;
