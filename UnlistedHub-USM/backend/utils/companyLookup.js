/**
 * Company Lookup Utility
 * Searches for unlisted company details from external sources (WWIPL.com)
 * and creates new companies in the database when users list shares of unknown companies
 */

import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { createAndSendNotification } from './pushNotifications.js';

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
    const trimmedName = companyName.trim();
    
    // Check if company already exists (case-insensitive, escaped regex)
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });

    if (existingCompany) {
      console.log(`Company "${trimmedName}" already exists in database.`);
      return {
        success: true,
        company: existingCompany,
        isNew: false
      };
    }

    // Check if ISIN already exists if provided
    if (additionalData.isin) {
      const existingIsin = await Company.findOne({ isin: additionalData.isin.toUpperCase().trim() });
      if (existingIsin) {
        console.log(`Company with ISIN "${additionalData.isin}" already exists: ${existingIsin.name}`);
        return {
          success: true,
          company: existingIsin,
          isNew: false
        };
      }
    }

    // Detect sector from company name (NEVER use companySegmentation as sector)
    // companySegmentation is market segment (SME/Mainboard), not business sector (Technology/Finance)
    const sector = detectSector(trimmedName);
    
    // Note: We always auto-detect sector from company name.
    // additionalData.sector might contain companySegmentation (SME, Mainboard, etc.) which is NOT a business sector.
    // Business sectors are: Technology, Financial Service, eCommerce, etc.

    // Generate logo URL
    const logo = generateLogoUrl(trimmedName);

    // Market segment from additionalData (SME, Mainboard, etc.) - optional
    const segments = ['SME', 'Mainboard', 'Unlisted', 'Pre-IPO', 'Startup', 'Private'];
    const marketSegment = additionalData.segment && segments.includes(additionalData.segment) 
      ? additionalData.segment 
      : null;

    // Create new company with pending verification
    // Build company data object - only include ISIN/PAN/CIN if they have values
    // This avoids MongoDB unique index issues with null values
    const companyData = {
      name: trimmedName,
      scriptName: additionalData.scriptName || trimmedName.split(' ')[0],
      sector: sector, // Business sector (Technology, Finance, etc.) - auto-detected
      marketSegment: marketSegment, // Market segment (SME, Mainboard, etc.) - from user input
      logo: logo,
      description: `${trimmedName} - Unlisted company. Details pending verification.`,
      verificationStatus: 'pending',
      addedBy: 'user',
      addedByUser: userId,
      isActive: true,
      totalListings: 1
    };

    // Only add ISIN if provided (avoid null value in unique index)
    if (additionalData.isin && additionalData.isin.trim()) {
      companyData.isin = additionalData.isin.trim().toUpperCase();
    }

    // Only add PAN if provided
    if (additionalData.pan && additionalData.pan.trim()) {
      companyData.pan = additionalData.pan.trim().toUpperCase();
    }

    // Only add CIN if provided
    if (additionalData.cin && additionalData.cin.trim()) {
      companyData.cin = additionalData.cin.trim().toUpperCase();
    }

    // Only add website if provided
    if (additionalData.website && additionalData.website.trim()) {
      companyData.website = additionalData.website.trim();
    }

    const newCompany = await Company.create(companyData);

    console.log(`Successfully created new company: ${newCompany.name}`);

    // Notify all admins about new company with Push Notifications
    // We don't await this to avoid slowing down the response
    notifyAdminsAboutNewCompany(newCompany, userId).catch(err => 
      console.error('Error in background admin notification:', err)
    );

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

    // Send Push Notification to each admin
    for (const admin of admins) {
      try {
        await createAndSendNotification(admin._id, {
          type: 'admin_alert',
          title: '🏢 New Company Added',
          message: `@${username} added "${company.name}". Verification required.`,
          data: {
            companyId: company._id.toString(),
            companyName: company.name,
            addedBy: addedByUserId.toString(),
            action: 'verify_company'
          },
          priority: 'high',
          actionUrl: '/admin/dashboard?tab=admin-companies'
        });
      } catch (err) {
        console.error(`Failed to send push to admin ${admin.username}:`, err.message);
      }
    }

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
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedTerm, 'i');
    
    // First: Exact match on name (case-insensitive)
    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${escapedTerm}$`, 'i') }
    });
    if (company) return company;

    // Second: Exact match on scriptName (case-insensitive)
    company = await Company.findOne({
      scriptName: { $regex: new RegExp(`^${escapedTerm}$`, 'i') }
    });
    if (company) return company;

    // Third: Exact match on CompanyName (legacy field)
    company = await Company.findOne({
      CompanyName: { $regex: new RegExp(`^${escapedTerm}$`, 'i') }
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
