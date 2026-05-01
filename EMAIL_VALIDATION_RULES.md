# Email Validation Rules - Cosaku Elections

## Valid Email Format

**Pattern:** `YYYYaPPPPNNNNGG@kab.ac.ug`

### Components Breakdown:

1. **Year (YYYY):** `2023`, `2024`, or `2025`
   
2. **Letter 'a':** Required after year
   
3. **Program (PPPP):** Must be one of:
   - `kcs` - Computer Science
   - `bit` - Information Technology (new code)
   - `kit` - Information Technology (legacy code)
   - `dcs` - Data Science
   - `dit` - Digital IT
   - `kls` - Legal Studies
   - `krm` - Resource Management
   - `drm` - Data Resource Management
   - `dls` - Data Legal Studies

4. **Student Number (N-NNNN):** 1 to 4 digits (1-9999, padded with leading zeros as needed)

5. **Gender (GG):** 
   - `gf` - Female
   - `f` - Female

6. **Domain:** Must be `@kab.ac.ug`

---

## ✅ VALID Email Examples

```
2024akcs005f@kab.ac.ug       ✓ Female Computer Science student (1-digit padded), 2024
2024akcs0001gf@kab.ac.ug     ✓ Female Computer Science student (4-digit), 2024
2024akcs100f@kab.ac.ug       ✓ Female Computer Science student (3-digit)
2023abit779f@kab.ac.ug       ✓ Female IT student with new code (3-digit), 2023
2023akit779f@kab.ac.ug       ✓ Female IT student with legacy code (3-digit), 2023
2023abit059f@kab.ac.ug       ✓ Female IT student (2-digit padded), 2023
2025adcs9999gf@kab.ac.ug     ✓ Female Data Science student (4-digit), 2025
2024adrm0100f@kab.ac.ug      ✓ Female Data Resource Management student (4-digit)
2023akrm2847gf@kab.ac.ug     ✓ Female Resource Management student (4-digit)
2024adls1234f@kab.ac.ug      ✓ Female Data Legal Studies student (4-digit)
```

---

## ❌ INVALID Email Examples

| Email | Reason |
|-------|--------|
| `2024akcs0001@kab.ac.ug` | ❌ Missing gender (gf/f) |
| `2022akcs0001gf@kab.ac.ug` | ❌ Invalid year (must be 2023, 2024, or 2025) |
| `2024akcs@kab.ac.ug` | ❌ Missing student number (must be 1-4 digits) |
| `2024akcs00001gf@kab.ac.ug` | ❌ Student number must be 4 digits (has 5) |
| `2024akcs0001m@kab.ac.ug` | ❌ Invalid gender (must be gf or f) |
| `2024aXCS0001gf@kab.ac.ug` | ❌ Invalid program code (must be lowercase) |
| `2024akcs0001gf@gmail.com` | ❌ Wrong domain (must be @kab.ac.ug) |
| `2024akcs0001gf@kabac.ug` | ❌ Invalid domain format |
| `john@kab.ac.ug` | ❌ Doesn't match Kabale University format |
| `2024 akcs0001gf@kab.ac.ug` | ❌ Contains spaces |

---

## 🔐 Additional Validation Rules

### Password Requirements:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)

**Example Valid Passwords:**
- `Student2024`
- `MyPassword123`
- `Cosaku@2024`

### Full Name Requirements:
- ✅ Minimum 2 characters
- ✅ Only letters and spaces allowed
- ❌ No numbers, special characters, or symbols

**Example Valid Names:**
- `John Doe`
- `Mary Smith`
- `Peter` (minimum 2 chars)

**Example Invalid Names:**
- `J` (too short)
- `John123` (contains numbers)
- `Mary@Smith` (contains special chars)

---

## Summary

**Only Kabale University students can register with their official email format.**

The system enforces this to ensure:
- Only authorized students can vote
- Email addresses are verifiable and unique
- No spam or fake accounts
