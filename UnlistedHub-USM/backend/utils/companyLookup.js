/**
 * Company Lookup Utility
 * Searches for unlisted company details from external sources (WWIPL.com)
 * and creates new companies in the database when users list shares of unknown companies
 */

import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Sector mapping for common company types
const SECTOR_KEYWORDS = {
  'Financial Service': ['bank', 'finance', 'fund', 'securities', 'capital', 'investment', 'credit', 'loan', 'nse', 'bse', 'stock exchange', 'asset management', 'mutual fund', 'nbfc'],
  'eCommerce': ['flipkart', 'amazon', 'snapdeal', 'meesho', 'myntra', 'nykaa', 'firstcry', 'bigbasket', 'zepto', 'blinkit', 'instamart'],
  'Technology': ['tech', 'software', 'it ', 'digital', 'cloud', 'data', 'cyber', 'ai ', 'machine learning'],
  'Fintech': ['paytm', 'phonepe', 'razorpay', 'cred', 'mobikwik', 'payment', 'wallet', 'upi'],
  'Food & Beverage': ['swiggy', 'zomato', 'food', 'restaurant', 'beverage', 'beer', 'bira', 'cafe'],
  'Transport': ['ola', 'uber', 'rapido', 'cab', 'taxi', 'logistics', 'delhivery', 'delivery'],
  'Hospitality': ['oyo', 'hotel', 'travel', 'tourism', 'resort', 'stay'],
  'Healthcare': ['pharmeasy', 'netmeds', 'apollo', 'hospital', 'pharma', 'health', 'medical', 'diagnostic'],
  'Education': ['byju', 'unacademy', 'upgrad', 'vedantu', 'education', 'edtech', 'learning'],
  'Insurance': ['insurance', 'acko', 'policybazaar', 'digit', 'general insurance', 'life insurance'],
  'Automobile': ['hero', 'ola electric', 'ather', 'automobile', 'vehicle', 'car', 'bike', 'motor'],
  'Real Estate': ['real estate', 'property', 'housing', 'construction', 'realty'],
  'Media': ['media', 'entertainment', 'news', 'broadcast', 'streaming'],
  'Manufacturing': ['manufacturing', 'industrial', 'steel', 'cement', 'chemical'],
  'Energy': ['energy', 'power', 'solar', 'renewable', 'oil', 'gas', 'electricity'],
  'Telecom': ['telecom', 'airtel', 'jio', 'vodafone', 'communication'],
  'Retail': ['retail', 'store', 'mart', 'reliance retail', 'dmart', 'big bazaar'],
  'Agriculture': ['agri', 'farm', 'seeds', 'fertilizer', 'organic'],
  'Shipping': ['shipping', 'port', 'shipyard', 'maritime', 'cargo']
};

/**
 * Detect sector based on company name
 */
function detectSector(companyName) {
  const nameLower = companyName.toLowerCase();
  
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return sector;
      }
    }
  }
  
  return 'Other';
}

/**
 * Generate logo URL using Clearbit or UI Avatars fallback
 */
function generateLogoUrl(companyName) {
  // Try to extract domain-like name
  const cleanName = companyName
    .toLowerCase()
    .replace(/\s+(limited|ltd|pvt|private|india|unlisted)\.?$/gi, '')
    .replace(/[^a-z0-9]/g, '');
  
  // Common company domain mappings
  const domainMappings = {
    'nationalstockexchange': 'nseindia.com',
    'nse': 'nseindia.com',
    'hdfc': 'hdfcbank.com',
    'hdfcsecurities': 'hdfcsec.com',
    'swiggy': 'swiggy.com',
    'zomato': 'zomato.com',
    'phonepe': 'phonepe.com',
    'razorpay': 'razorpay.com',
    'paytm': 'paytm.com',
    'flipkart': 'flipkart.com',
    'oyo': 'oyorooms.com',
    'oyorooms': 'oyorooms.com',
    'ola': 'olacabs.com',
    'pharmeasy': 'pharmeasy.in',
    'snapdeal': 'snapdeal.com',
    'byju': 'byjus.com',
    'byjus': 'byjus.com',
    'meesho': 'meesho.com',
    'zepto': 'zepto.co',
    'cred': 'cred.club',
    'dream11': 'dream11.com',
    'lenskart': 'lenskart.com',
    'boat': 'boat-lifestyle.com',
    'sbi': 'sbi.co.in',
    'sbifunds': 'sbimf.com',
    'reliance': 'relianceindustries.com',
    'relianceretail': 'relianceretail.com',
    'hero': 'heromotocorp.com',
    'herofincorp': 'herofincorp.com',
    'acko': 'acko.com',
    'policybazaar': 'policybazaar.com',
    'delhivery': 'delhivery.com',
    'bigbasket': 'bigbasket.com',
    'upgrad': 'upgrad.com',
    'unacademy': 'unacademy.com',
    'cochin': 'cial.aero',
    'cochinairport': 'cial.aero',
    'goashipyard': 'goashipyard.com'
  };

  const domain = domainMappings[cleanName] || `${cleanName}.com`;
  
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Create a new company entry when user lists shares of unknown company
 * This is called when companyId is not provided and company doesn't exist in database
 */
export async function createNewCompanyFromListing(companyName, userId, additionalData = {}) {
  try {
    // Check if company already exists (case-insensitive)
    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') }
    });

    if (existingCompany) {
      return {
        success: true,
        company: existingCompany,
        isNew: false
      };
    }

    // Detect sector from company name
    const sector = additionalData.sector || detectSector(companyName);
    
    // Generate logo URL
    const logo = generateLogoUrl(companyName);

    // Create new company with pending verification
    const newCompany = await Company.create({
      name: companyName.trim(),
      scriptName: additionalData.scriptName || companyName.split(' ')[0],
      sector: sector,
      logo: logo,
      isin: additionalData.isin || null,
      pan: additionalData.pan || null,
      cin: additionalData.cin || null,
      website: additionalData.website || null,
      description: `${companyName} - Unlisted company. Details pending verification.`,
      verificationStatus: 'pending',
      addedBy: 'user',
      addedByUser: userId,
      isActive: true,
      totalListings: 1
    });

    // Notify all admins about new company
    await notifyAdminsAboutNewCompany(newCompany, userId);

    return {
      success: true,
      company: newCompany,
      isNew: true
    };

  } catch (error) {
    console.error('Error creating new company from listing:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Notify all admins about new company added by user
 */
async function notifyAdminsAboutNewCompany(company, addedByUserId) {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('No admins found to notify about new company');
      return;
    }

    // Get user who added the company
    const addedByUser = await User.findById(addedByUserId);
    const username = addedByUser?.username || 'Unknown User';

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      userId: admin._id,
      type: 'admin_alert',
      title: '🏢 New Company Added - Verification Required',
      message: `User @${username} added "${company.name}" (${company.sector}). Please verify company details.`,
      data: {
        companyId: company._id,
        companyName: company.name,
        sector: company.sector,
        addedBy: addedByUserId,
        addedByUsername: username,
        verificationStatus: 'pending',
        action: 'verify_company'
      },
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    console.log(`Notified ${admins.length} admins about new company: ${company.name}`);

  } catch (error) {
    console.error('Error notifying admins about new company:', error);
  }
}

/**
 * Search for company in database with fuzzy matching
 */
export async function searchCompanyByName(companyName) {
  try {
    const searchTerm = companyName.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // First: Exact match on name (case-insensitive)
    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${searchTerm}$`, 'i') }
    });
    if (company) return company;

    // Second: Exact match on scriptName (case-insensitive)
    company = await Company.findOne({
      scriptName: { $regex: new RegExp(`^${searchTerm}$`, 'i') }
    });
    if (company) return company;

    // Third: Exact match on CompanyName (legacy field)
    company = await Company.findOne({
      CompanyName: { $regex: new RegExp(`^${searchTerm}$`, 'i') }
    });
    if (company) return company;

    // Fourth: Partial match on name
    company = await Company.findOne({
      name: searchRegex
    });
    if (company) return company;

    // Fifth: Partial match on scriptName
    company = await Company.findOne({
      scriptName: searchRegex
    });
    if (company) return company;

    // Sixth: Partial match on CompanyName (legacy)
    company = await Company.findOne({
      CompanyName: searchRegex
    });

    return company;

  } catch (error) {
    console.error('Error searching company:', error);
    return null;
  }
}

/**
 * Verify company by admin
 */
export async function verifyCompany(companyId, adminId, status, notes = null) {
  try {
    const company = await Company.findById(companyId);
    
    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    company.verificationStatus = status;
    company.verificationNotes = notes;
    company.verifiedBy = adminId;
    company.verifiedAt = new Date();

    // If verified by admin, update addedBy to indicate it's now admin-approved
    if (status === 'verified') {
      console.log(`Company ${company.name} verified by admin`);
    }

    await company.save();

    // Notify the user who added the company
    if (company.addedByUser) {
      await Notification.create({
        userId: company.addedByUser,
        type: status === 'verified' ? 'success' : 'warning',
        title: status === 'verified' 
          ? '✅ Company Verified' 
          : '⚠️ Company Verification Update',
        message: status === 'verified'
          ? `${company.name} has been verified by admin. Your listing is now visible with full company details.`
          : `${company.name} verification status updated to ${status}. ${notes || ''}`,
        data: {
          companyId: company._id,
          companyName: company.name,
          verificationStatus: status
        }
      });
    }

    return { success: true, company };

  } catch (error) {
    console.error('Error verifying company:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createNewCompanyFromListing,
  searchCompanyByName,
  verifyCompany,
  detectSector,
  generateLogoUrl
};
