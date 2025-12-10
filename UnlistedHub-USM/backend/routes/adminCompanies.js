import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { protect, authorize } from '../middleware/auth.js';
import Company from '../models/Company.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// CSV-specific uploader (used for bulk CSV upload). Allows common CSV MIME types.
const uploadCsv = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for CSVs
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowed.includes(file.mimetype) || (file.originalname && file.originalname.toLowerCase().endsWith('.csv'))) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed for this endpoint'), false);
    }
  }
});

// @route   POST /api/admin/ocr/extract
// @desc    Extract company data from image using OCR
// @access  Admin
router.post('/ocr/extract', protect, authorize('admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    console.log('Processing OCR for image...');

    // Convert buffer to base64 for Tesseract
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Run OCR
    const { data: { text } } = await Tesseract.recognize(base64Image, 'eng', {
      logger: m => console.log(m)
    });

    console.log('Extracted text:', text);

    // Parse the extracted text to find company data
    const extractedData = parseCompanyData(text);

    res.json({
      success: true,
      rawText: text,
      extractedData,
      message: 'OCR completed successfully'
    });
  } catch (error) {
    console.error('OCR Error:', error);
    next(error);
  }
});

// Helper function to parse company data from OCR text
function parseCompanyData(text) {
  const data = {
    companyName: null,
    scripName: null,
    isin: null,
    pan: null,
    cin: null,
    sector: null,
    registrationDate: null,
    outstandingShares: null,
    faceValue: null,
    eps: null,
    peRatio: null,
    psRatio: null,
    marketCap: null,
    bookValue: null,
    pbv: null
  };

  // Extract Company Name
  const companyNameMatch = text.match(/Company Name[:\s]*([^\n]+)/i);
  if (companyNameMatch) {
    data.companyName = companyNameMatch[1].trim();
  }

  // Extract Scrip Name
  const scripNameMatch = text.match(/Scrip Name[:\s]*([^\n]+)/i);
  if (scripNameMatch) {
    data.scripName = scripNameMatch[1].trim();
  }

  // Extract ISIN
  const isinMatch = text.match(/ISIN\s*(?:No\.?)?[:\s]*(INE[A-Z0-9]+)/i);
  if (isinMatch) {
    data.isin = isinMatch[1].trim();
  }

  // Extract PAN
  const panMatch = text.match(/PAN\s*(?:No\.?)?[:\s]*([A-Z]{5}[0-9]{4}[A-Z])/i);
  if (panMatch) {
    data.pan = panMatch[1].trim();
  }

  // Extract CIN
  const cinMatch = text.match(/CIN[:\s]*(U\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d+)/i);
  if (cinMatch) {
    data.cin = cinMatch[1].trim();
  }

  // Extract Sector
  const sectorMatch = text.match(/Sector[:\s]*([^\n]+)/i);
  if (sectorMatch) {
    data.sector = sectorMatch[1].trim();
  }

  // Extract Registration Date
  const regDateMatch = text.match(/Registration Date[:\s]*([\d\/]+)/i);
  if (regDateMatch) {
    data.registrationDate = regDateMatch[1].trim();
  }

  // Extract Outstanding Shares
  const sharesMatch = text.match(/(?:No\.\s*of\s*)?Outstanding Shares[:\s]*([\d,]+)/i);
  if (sharesMatch) {
    data.outstandingShares = sharesMatch[1].replace(/,/g, '');
  }

  // Extract Face Value
  const faceValueMatch = text.match(/Face Value[:\s]*₹?\s*([\d.]+)/i);
  if (faceValueMatch) {
    data.faceValue = parseFloat(faceValueMatch[1]);
  }

  // Extract EPS
  const epsMatch = text.match(/EPS[:\s]*₹?\s*([\d.]+)/i);
  if (epsMatch) {
    data.eps = parseFloat(epsMatch[1]);
  }

  // Extract PE Ratio
  const peMatch = text.match(/PE\s*[Rr]atio[:\s]*([\d.]+)/i);
  if (peMatch) {
    data.peRatio = parseFloat(peMatch[1]);
  }

  // Extract P/S Ratio
  const psMatch = text.match(/P\/S\s*[Rr]atio[:\s]*([\d.]+)/i);
  if (psMatch) {
    data.psRatio = parseFloat(psMatch[1]);
  }

  // Extract Market Cap
  const marketCapMatch = text.match(/Market\s*Capitali[sz]ation[:\s]*₹?\s*([\d,.]+)\s*Crore/i);
  if (marketCapMatch) {
    data.marketCap = marketCapMatch[1].replace(/,/g, '');
  }

  // Extract Book Value
  const bookValueMatch = text.match(/Book\s*[Vv]alue[:\s]*₹?\s*([\d.]+)/i);
  if (bookValueMatch) {
    data.bookValue = parseFloat(bookValueMatch[1]);
  }

  // Extract P/BV
  const pbvMatch = text.match(/P\/BV[:\s]*([\d.]+)/i);
  if (pbvMatch) {
    data.pbv = parseFloat(pbvMatch[1]);
  }

  return data;
}

// @route   POST /api/admin/companies
// @desc    Create new company (with logo upload)
// @access  Admin
router.post('/companies', protect, authorize('admin'), upload.single('logo'), async (req, res, next) => {
  try {
    const { name, sector, scriptName, isin, cin, pan, registrationDate, description, ...otherData } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ 
      $or: [
        { name: name },
        ...(isin ? [{ isin: isin }] : []),
        ...(cin ? [{ cin: cin }] : [])
      ]
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company already exists with this name, ISIN or CIN'
      });
    }

    // Handle logo file upload - convert to base64 data URL
    let logoUrl = '';
    if (req.file) {
      logoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.logo) {
      // Allow passing a logo URL in the request body (Cloudinary/remote URL)
      logoUrl = req.body.logo;
    }

    // Create company
    const company = await Company.create({
      name,
      scriptName: scriptName || '',
      sector,
      logo: logoUrl,
      isin: isin || '',
      cin: cin || '',
      pan: pan || '',
      registrationDate: registrationDate || null,
      description: description || '',
      ...otherData
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/companies/:id
// @desc    Update company details (with logo upload or URL)
// @access  Admin
router.put('/companies/:id', protect, authorize('admin'), upload.single('logo'), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Handle logo - either file upload (base64) or URL from body
    if (req.file) {
      company.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.logo) {
      company.logo = req.body.logo; // For Cloudinary URLs or other links
    }

    // Update other fields from body (excluding logo since we handle it separately)
    const { logo, ...otherFields } = req.body;
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined && otherFields[key] !== '') {
        company[key] = otherFields[key];
      }
    });

    await company.save();

    res.json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/companies/:id
// @desc    Delete company
// @access  Admin
router.delete('/companies/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if company has active listings
    const Listing = (await import('../models/Listing.js')).default;
    const activeListings = await Listing.countDocuments({ 
      companyId: req.params.id,
      status: 'active'
    });

    if (activeListings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company with ${activeListings} active listings`
      });
    }

    await company.deleteOne();

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/companies
// @desc    Get all companies (admin view with stats)
// @access  Admin
router.get('/companies', protect, authorize('admin'), async (req, res, next) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 });

    // Get listing counts for each company
    const Listing = (await import('../models/Listing.js')).default;
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const listingsCount = await Listing.countDocuments({ 
          companyId: company._id,
          status: 'active'
        });
        
        return {
          ...company.toObject(),
          listingsCount
        };
      })
    );

    res.json({
      success: true,
      count: companiesWithStats.length,
      companies: companiesWithStats
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/companies/sample-csv
// @desc    Download sample CSV format for bulk company upload
// @access  Admin
router.get('/companies/sample-csv', protect, authorize('admin'), (req, res) => {
  const sampleCsv = `name,scriptName,isin,pan,cin,sector,registrationDate,logo,website,description
PhonePe,PhonePe,INE00PP01014,AAECH7240N,U72900KA2012PTC066107,Fintech,01/07/2012,https://example.com/logo1.png,https://www.phonepe.com,Leading digital payments platform
CRED,CRED,INE00CR01015,AABCC1234F,U74999KA2018PTC108912,Fintech,15/03/2018,https://example.com/logo2.png,https://cred.club,Credit card bill payment rewards platform
Zepto,Zepto,INE143401029,AAICK4821A,U46909MH2020PTC351333,eCommerce,01/07/2020,https://example.com/logo3.png,https://zeptonow.com,Quick commerce delivery platform`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample-companies.csv"');
  res.send(sampleCsv);
});

// @route   POST /api/admin/companies/bulk-csv
// @desc    Bulk upload companies from CSV file
// @access  Admin
router.post('/companies/bulk-csv', protect, authorize('admin'), uploadCsv.single('csv'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV file must contain at least header and one data row'
      });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const companies = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const company = {};
      headers.forEach((header, index) => {
        // Normalize header to a safe key (lowercase, remove dots/spaces)
        const key = header.replace(/\s+/g, ' ').trim();
        const lower = key.toLowerCase();

        // Map common header variations to schema fields
        let mappedKey = lower;
        if (['name', 'company', 'companyname', 'company name'].includes(lower)) mappedKey = 'name';
        else if (['scripname', 'scrip', 'script', 'scriptname', 'scrip name'].includes(lower)) mappedKey = 'scriptName';
        else if (['logo', 'logo url', 'logo_url', 'image'].includes(lower)) mappedKey = 'logo';
        else if (['sector', 'industry'].includes(lower)) mappedKey = 'sector';
        else if (['description', 'desc'].includes(lower)) mappedKey = 'description';
        else if (['isin'].includes(lower)) mappedKey = 'isin';
        else if (['pan'].includes(lower)) mappedKey = 'pan';
        else if (['cin'].includes(lower)) mappedKey = 'cin';
        else if (['website', 'url', 'website_url'].includes(lower)) mappedKey = 'website';
        else if (['reg date', 'reg. date', 'registrationdate', 'registration date', 'registration_date', 'regdate'].includes(lower)) mappedKey = 'registrationDate';

        let cell = values[index] || '';

        // Parse registration date into ISO if mapped
        if (mappedKey === 'registrationDate' && cell) {
          try {
            // Remove any quotes or extra spaces
            cell = cell.trim().replace(/['"]/g, '');
            
            console.log('Parsing date:', cell); // Debug log
            
            // Try common date formats: dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd, dd-mm-yyyy
            const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
            const match = cell.match(datePattern);
            
            if (match) {
              let day, month, year;
              const part1 = match[1];
              const part2 = match[2];
              const part3 = match[3];
              
              // Detect format: if part3 is 4 digits, it's likely dd/mm/yyyy
              if (part3.length === 4) {
                year = part3;
                // Check if it's dd/mm/yyyy (day first) - common in India
                if (parseInt(part1) > 12) {
                  day = part1.padStart(2, '0');
                  month = part2.padStart(2, '0');
                } else if (parseInt(part2) > 12) {
                  day = part2.padStart(2, '0');
                  month = part1.padStart(2, '0');
                } else {
                  // Assume dd/mm/yyyy format (Indian standard)
                  day = part1.padStart(2, '0');
                  month = part2.padStart(2, '0');
                }
              } else {
                // Format is likely dd/mm/yy or mm/dd/yy
                year = part3.length === 2 ? `20${part3}` : part3;
                // Assume dd/mm/yyyy format
                day = part1.padStart(2, '0');
                month = part2.padStart(2, '0');
              }
              
              // Create ISO date string
              const isoDate = `${year}-${month}-${day}T00:00:00.000Z`;
              console.log('Parsed date to:', isoDate); // Debug log
              cell = isoDate;
            } else {
              // Try direct Date parsing as fallback
              console.log('No pattern match, trying Date parse'); // Debug log
              const parsed = new Date(cell);
              if (!isNaN(parsed.getTime())) {
                cell = parsed.toISOString();
                console.log('Date parsed to:', cell); // Debug log
              } else {
                // If all else fails, set to empty string to skip field
                console.log('Date parsing failed, skipping'); // Debug log
                cell = '';
              }
            }
          } catch (err) {
            console.error('Date parsing error:', err, 'for value:', cell);
            cell = ''; // Set to empty string if parsing fails
          }
        }

        // Only add non-empty values to company object
        if (cell !== '' && cell !== null && cell !== undefined) {
          company[mappedKey] = cell;
        }
      });
      companies.push(company);
    }

    // Validate and save companies
    const savedCompanies = [];
    const errors = [];
    
    for (const companyData of companies) {
      try {
        // Log company data for debugging
        console.log('Saving company:', companyData.name, 'with registrationDate:', companyData.registrationDate);
        
        // Check if company with same name already exists
        const existing = await Company.findOne({ name: companyData.name });
        if (existing) {
          errors.push(`Company ${companyData.name} already exists`);
          continue;
        }
        
        const company = new Company(companyData);
        await company.save();
        savedCompanies.push(company);
        console.log('Saved company:', company.name, 'with date:', company.registrationDate);
      } catch (error) {
        console.error('Error saving company:', companyData.name, error);
        errors.push(`Error saving ${companyData.name}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Bulk upload completed. ${savedCompanies.length} companies added.`,
      added: savedCompanies.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/companies/bulk-delete
// @desc    Bulk delete companies by IDs (skips companies with active listings)
// @access  Admin
router.post('/companies/bulk-delete', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of company IDs to delete' });
    }

    const Listing = (await import('../models/Listing.js')).default;
    const results = {
      deleted: [],
      skipped: [],
      errors: []
    };

    for (const id of ids) {
      try {
        const company = await Company.findById(id);
        if (!company) {
          results.errors.push(`Company ${id} not found`);
          continue;
        }

        const activeListings = await Listing.countDocuments({ companyId: id, status: 'active' });
        if (activeListings > 0) {
          results.skipped.push({ id, reason: `Has ${activeListings} active listings` });
          continue;
        }

        await company.deleteOne();
        results.deleted.push(id);
      } catch (err) {
        results.errors.push(`Error deleting ${id}: ${err.message}`);
      }
    }

    res.json({ success: true, message: 'Bulk delete processed', results });
  } catch (error) {
    next(error);
  }
});

export default router;
