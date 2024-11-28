import React, { useState, useCallback, useMemo } from "react";
import { TextField, Button, Container, Box } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import PageTransition from "../PageTransition";
import AuthBackground from "../AuthBackground";
import useForm from "../../hooks/useForm"; // New custom hook
import { registerStyles } from "./styles"; // New styles file

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = React.memo(() => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const validateForm = useCallback((values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Email is invalid";
    }
    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  }, []);

  const onSubmit = useCallback(async (values) => {
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, values.email);
      if (methods.length > 0) {
        throw new Error("Email is already in use");
      }
      await registerUser(values.email, values.password);
      sessionStorage.setItem("registered", "true");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("email", "Invalid email address");
      } else {
        setError("email", error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [registerUser, navigate]);

  const { values, errors, handleChange, handleSubmit, setError } = useForm(
    initialState,
    onSubmit,
    validateForm
  );

  const formFields = useMemo(() => [
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password" },
  ], []);

  return (
    <AuthBackground label="Sign up">
      <Container maxWidth="xs" sx={registerStyles.container}>
        <PageTransition>
          <Box component="form" onSubmit={handleSubmit} sx={registerStyles.form}>
            {formFields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                variant="outlined"
                fullWidth
                value={values[field.name]}
                onChange={handleChange}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name] || ""}
                required
                sx={registerStyles.textField}
              />
            ))}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={registerStyles.submitButton}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>

            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              fullWidth
              size="large"
              sx={registerStyles.backButton}
            >
              Back to Login
            </Button>
          </Box>
        </PageTransition>
      </Container>
    </AuthBackground>
  );
});

export default Register;
