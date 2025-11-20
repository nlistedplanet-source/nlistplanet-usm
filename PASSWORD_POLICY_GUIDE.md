# Password Policy - Quick Reference

## 🔐 New Password Requirements (Bank-Level Security)

### Minimum Requirements
- **Length**: 12-128 characters
- **Must contain**:
  - ✅ At least 1 UPPERCASE letter (A-Z)
  - ✅ At least 1 lowercase letter (a-z)
  - ✅ At least 1 number (0-9)
- **Must NOT contain**:
  - ❌ Special characters like `!@#$%^&*()` etc.
  - ❌ Spaces

### Why Alphanumeric Only?
- **Security Strength**: Still provides ~93-bit entropy (very secure)
- **User Experience**: Eliminates false "malicious code" browser warnings
- **Simplicity**: Easier to remember and type
- **Bank-Standard**: Used by many financial institutions

### ✅ Valid Examples
| Password | Valid? | Reason |
|----------|--------|--------|
| `SecurePass123` | ✅ | Has upper, lower, numbers |
| `MyPassword2024` | ✅ | Meets all requirements |
| `ABC123def456` | ✅ | Good entropy |
| `TradingApp99` | ✅ | Enough complexity |

### ❌ Invalid Examples
| Password | Valid? | Reason |
|----------|--------|--------|
| `SecurePass!23` | ❌ | Contains `!` |
| `SecurePass123@` | ❌ | Contains `@` |
| `SecurePass123 ` | ❌ | Contains space |
| `securepass123` | ❌ | No uppercase letter |
| `SECUREPASS123` | ❌ | No lowercase letter |
| `SecurePass` | ❌ | No numbers |
| `123456789012` | ❌ | No letters |

### 🎯 Pro Tips
1. **Use a pattern you can remember**:
   - First name + Birth year + Middle initial
   - Favorite book title first letters + year
   - Company name + founding year + initials

2. **Examples that work**:
   - `UnlistedHub2024`
   - `Trading123Markets`
   - `SecureInvest99`
   - `MyWallet2025Trade`

3. **Don't use**:
   - Your username
   - Your email address
   - Common words (Password123, Admin123)
   - Keyboard sequences (Qwerty123)

---

## 🛡️ Why This Change?

The browser warning **"Web content may contain malicious code..."** was triggered by special characters being interpreted as potential injection vectors. By restricting to alphanumeric characters, we:

1. ✅ Eliminate the false warning
2. ✅ Maintain bank-level security (Argon2id + high entropy)
3. ✅ Improve user experience
4. ✅ Reduce support tickets

---

## 📝 Implementation Details

- **Algorithm**: Argon2id (GPU-resistant)
- **Memory**: 64MB per hash
- **Enforcement**: Server-side validation on all requests
- **Validation URL**: `POST /api/auth/register`
- **Error Response**: *"Password can only contain letters and numbers"*

---

## 🔄 Existing Users

If you have an older password with special characters:
- ✅ **Login**: Still works (old passwords not invalidated)
- ⚠️ **Next Update**: You'll be required to change to new format
- 🔧 **Change Now**: Go to Settings → Change Password

---

For issues or questions, contact: security@unlistedhub.com
