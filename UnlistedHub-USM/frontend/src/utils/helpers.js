// Format currency to INR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Calculate platform fee
export const calculatePlatformFee = (amount) => {
  const feePercentage = parseFloat(process.env.REACT_APP_PLATFORM_FEE_PERCENTAGE || 2);
  return (amount * feePercentage) / 100;
};

// Calculate total with platform fee
export const calculateTotalWithFee = (amount) => {
  return amount + calculatePlatformFee(amount);
};

// Format date
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return formatDate(date);
};

// Validate username
export const validateUsername = (username) => {
  const regex = /^[a-z0-9_]{3,20}$/;
  return regex.test(username);
};

// Validate email
export const validateEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

// Generate share URL with referral code
export const generateShareURL = (referralCode, listingId = null) => {
  const baseURL = window.location.origin;
  if (listingId) {
    return `${baseURL}/marketplace?ref=${referralCode}&listing=${listingId}`;
  }
  return `${baseURL}?ref=${referralCode}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    sold: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
    countered: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Convert number to words (Indian format) with decimal support
export const numberToWords = (num) => {
  if (num === 0) return 'Zero Rupees';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertTwoDigits = (n) => {
    if (n < 10) return ones[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  
  const convertThreeDigits = (n) => {
    if (n === 0) return '';
    if (n < 100) return convertTwoDigits(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertTwoDigits(n % 100) : '');
  };
  
  // Split into rupees and paise
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  let remaining = rupees;
  
  // Crores
  if (remaining >= 10000000) {
    const crores = Math.floor(remaining / 10000000);
    result += convertThreeDigits(crores) + ' Crore ';
    remaining %= 10000000;
  }
  
  // Lakhs
  if (remaining >= 100000) {
    const lakhs = Math.floor(remaining / 100000);
    result += convertTwoDigits(lakhs) + ' Lakh ';
    remaining %= 100000;
  }
  
  // Thousands
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    result += convertTwoDigits(thousands) + ' Thousand ';
    remaining %= 1000;
  }
  
  // Hundreds
  if (remaining >= 100) {
    result += ones[Math.floor(remaining / 100)] + ' Hundred ';
    remaining %= 100;
  }
  
  // Remaining
  if (remaining > 0) {
    result += convertTwoDigits(remaining);
  }
  
  result = result.trim();
  
  // Add rupees
  if (rupees === 0) {
    result = 'Zero';
  }
  result += ' Rupees';
  
  // Add paise if present
  if (paise > 0) {
    result += ' ' + convertTwoDigits(paise) + ' Paise';
  }
  
  return result.replace(/\s+/g, ' ');
};

// Format amount in short form (₹6.25L)
export const formatShortAmount = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return formatCurrency(amount);
};

// Format quantity in short form
export const formatShortQuantity = (qty) => {
  if (qty >= 100000) return `${(qty / 100000).toFixed(2)}L`;
  if (qty >= 1000) return `${(qty / 1000).toFixed(1)}K`;
  return qty?.toString() || '0';
};
