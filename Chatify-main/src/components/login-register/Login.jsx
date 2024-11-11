import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, TextField, Container, Typography, Box, Snackbar, Alert, Link as MuiLink } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";
import PageTransition from "../PageTransition";
import AuthBackground from "../AuthBackground";
import { getAuth } from "firebase/auth";
import useForm from "../../hooks/useForm";
import { loginStyles } from "./styles"; // Add this to the styles.js file

const initialState = {
  email: "",
  password: "",
};

const Login = React.memo(() => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const auth = getAuth();

  useEffect(() => {
    const registered = sessionStorage.getItem("registered");
    if (registered) {
      setOpenSnackbar(true);
      sessionStorage.removeItem("registered");
    }
  }, []);

  const validateForm = useCallback((values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is required";
    }
    if (!values.password) {
      errors.password = "Password is required";
    }
    return errors;
  }, []);

  const onSubmit = useCallback(async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        if (userData && userData.language && userData.username && userData.username !== userData.email) {
          navigate('/chat');
        } else {
          navigate('/profile-setup');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login, auth, navigate]);

  const { values, errors, handleChange, handleSubmit } = useForm(
    initialState,
    onSubmit,
    validateForm
  );

  const formFields = useMemo(() => [
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
  ], []);

  return (
    <AuthBackground label="Login">
      <Container maxWidth="xs" sx={loginStyles.container}>
        <PageTransition>
          <Box component="form" onSubmit={handleSubmit} sx={loginStyles.form}>
            {error && <Typography color="error">{error}</Typography>}
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
                sx={loginStyles.textField}
              />
            ))}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={loginStyles.submitButton}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={loginStyles.signUpButton}
            >
              Sign up
            </Button>
            <MuiLink
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={loginStyles.forgotPasswordLink}
            >
              Forgot Password?
            </MuiLink>
          </Box>
        </PageTransition>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Sign up successful! Please log in.
        </Alert>
      </Snackbar>
    </AuthBackground>
  );
});

export default Login;
