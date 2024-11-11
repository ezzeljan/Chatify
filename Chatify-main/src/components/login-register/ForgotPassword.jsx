import React, { useState, useEffect, useCallback, useMemo } from "react";
import { sendPasswordResetEmail } from "firebase/auth"; // Firebase function for password reset
import { TextField, Button, Container, Box, Alert } from "@mui/material";
import { auth } from "../../firebaseConfig";
import { Link as RouterLink } from "react-router-dom";
import PageTransition from "../PageTransition";
import AuthBackground from "../AuthBackground";
import useForm from "../../hooks/useForm";
import { forgotPasswordStyles } from "./styles"; // Add this to the styles.js file

const initialState = {
  email: "",
};

const ForgotPassword = React.memo(() => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (isButtonDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsButtonDisabled(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [isButtonDisabled, timer]);

  const validateForm = useCallback((values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Email is invalid";
    }
    return errors;
  }, []);

  const onSubmit = useCallback(async (values) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      setMessage("Link has been sent. If an account exists for this email, a password reset link will be sent shortly.");
      setError("");
      setIsButtonDisabled(true);
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error(err);
    }
  }, []);

  const { values, errors, handleChange, handleSubmit } = useForm(
    initialState,
    onSubmit,
    validateForm
  );

  const formFields = useMemo(() => [
    { name: "email", label: "Email", type: "email" },
  ], []);

  return (
    <AuthBackground label="Forgot Password" labelVariant="h6" showLogo={false} labelAlign="center">
      <Container maxWidth="xs" sx={forgotPasswordStyles.container}>
        <PageTransition>
          <Box component="form" onSubmit={handleSubmit} sx={forgotPasswordStyles.form}>
            {message && <Alert severity="info">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
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
                sx={forgotPasswordStyles.textField}
              />
            ))}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isButtonDisabled}
              sx={forgotPasswordStyles.submitButton}
            >
              {isButtonDisabled ? `Resend in ${timer}s` : "Send Password Reset Email"}
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              fullWidth
              size="large"
              sx={forgotPasswordStyles.backButton}
            >
              Back to Login
            </Button>
          </Box>
        </PageTransition>
      </Container>
    </AuthBackground>
  );
});

export default ForgotPassword;
