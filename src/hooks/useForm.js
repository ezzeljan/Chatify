import { useState, useCallback } from 'react';

const useForm = (initialState, onSubmit, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues(prevValues => ({ ...prevValues, [name]: value }));
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  }, [values, validate, onSubmit]);

  const setError = useCallback((field, message) => {
    setErrors(prevErrors => ({ ...prevErrors, [field]: message }));
  }, []);

  return { values, errors, handleChange, handleSubmit, setError };
};

export default useForm;
