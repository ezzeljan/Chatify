export const registerStyles = {
  container: {
    pt: 4,
    pb: 4,
    px: 4,
    boxShadow: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  textField: {
    boxShadow: 1,
    borderRadius: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#9D7BB0',
      },
      '&:hover fieldset': {
        borderColor: '#7E5A9B',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#7E5A9B',
      },
    },
  },
  submitButton: {
    py: 1.5,
    backgroundColor: "#7E5A9B",
    color: "white",
    "&:hover": { backgroundColor: "#9D7BB0" },
  },
  backButton: {
    py: 1.5,
    borderColor: "#9D7BB0",
    color: "#7E5A9B",
    "&:hover": { backgroundColor: "#E0B1CB", borderColor: "#7E5A9B" },
  },
};

export const loginStyles = {
  container: {
    pt: 4,
    pb: 4,
    px: 4,
    boxShadow: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  textField: {
    boxShadow: 1,
    borderRadius: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#9D7BB0',
      },
      '&:hover fieldset': {
        borderColor: '#7E5A9B',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#7E5A9B',
      },
    },
  },
  submitButton: {
    py: 1.5,
    backgroundColor: "#7E5A9B",
    color: "white",
    "&:hover": { backgroundColor: "#9D7BB0" },
  },
  signUpButton: {
    py: 1.5,
    borderColor: "#9D7BB0",
    color: "#7E5A9B",
    "&:hover": { backgroundColor: "#E0B1CB", borderColor: "#7E5A9B" },
  },
  forgotPasswordLink: {
    textAlign: "center",
    mt: 2,
    color: "#7E5A9B",
  },
};

export const forgotPasswordStyles = {
  container: {
    pt: 4,
    pb: 4,
    px: 4,
    boxShadow: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  textField: {
    boxShadow: 1,
    borderRadius: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#9D7BB0',
      },
      '&:hover fieldset': {
        borderColor: '#7E5A9B',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#7E5A9B',
      },
    },
  },
  submitButton: {
    py: 1.5,
    backgroundColor: "#7E5A9B",
    color: "white",
    "&:hover": { backgroundColor: "#9D7BB0" },
    "&:disabled": { backgroundColor: "#9D7BB0", color: "white" },
  },
  backButton: {
    py: 1.5,
    borderColor: "#9D7BB0",
    color: "#7E5A9B",
    "&:hover": { backgroundColor: "#E0B1CB", borderColor: "#7E5A9B" },
  },
};
