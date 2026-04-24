export const isValidKabEmail = (email) => {
  const kabEmailRegex =
    /^(2023|2024|2025)a(kcs|kit|dcs|dit|kls|krm|drm|dls)\d{4}(gf|f)@kab\.ac\.ug$/i;
  return kabEmailRegex.test(email.trim());
};

export const isValidPassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidName = (name) => {
  // At least 2 characters, no special characters except spaces
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name?.trim() || "");
};

export const validateEmail = (email) => {
  if (!isValidKabEmail(email)) {
    return "Invalid Kabale University email. Use format: 2024akcs0001gf@kab.ac.ug";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return "Name can only contain letters and spaces";
  }
  return null;
};
