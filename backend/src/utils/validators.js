// Kabale University email validation regex
const KAB_EMAIL_REGEX =
  /^(2023|2024|2025)a(kcs|kit|dcs|dit|kls|krm|drm|dls)\d{4}(gf|f)@kab\.ac\.ug$/i;

export const isValidKabEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return KAB_EMAIL_REGEX.test(email.trim());
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

export const parseKabEmail = (email) => {
  const match = email.match(KAB_EMAIL_REGEX);
  if (!match) return null;

  return {
    year: match[1],
    program: match[2],
    studentNumber: match[3],
    studyType: match[4],
  };
};
