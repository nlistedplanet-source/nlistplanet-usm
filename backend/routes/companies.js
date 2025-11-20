import express from 'express';
import Company from '../models/Company.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies (with pagination and search)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { search, sector, page = 1, limit = 50 } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { CompanyName: { $regex: search, $options: 'i' } },
        { ScripName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (sector) {
      query.$or = [
        { Sector: sector },
        { sector: sector }
      ];
    }

    const skip = (page - 1) * limit;

    const companies = await Company.find(query)
      .sort('CompanyName')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/companies/search
// @desc    Search companies by name (for listing creation)
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }

    const companies = await Company.find({
      $or: [
        { CompanyName: { $regex: q, $options: 'i' } },
        { ScripName: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('Logo CompanyName ScripName ISIN PAN CIN Sector')
    .limit(10)
    .sort({ CompanyName: 1 });
    
    res.json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes - require authentication and admin role

// @route   POST /api/companies
// @desc    Create new company (admin only)
// @access  Private/Admin
router.post('/', auth, admin, async (req, res, next) => {
  try {
    const { Logo, CompanyName, ScripName, ISIN, PAN, CIN, RegistrationDate, Sector } = req.body;

    // Check if company with same ISIN, PAN, or CIN already exists
    const existingCompany = await Company.findOne({
      $or: [
        { ISIN: ISIN?.toUpperCase() },
        { PAN: PAN?.toUpperCase() },
        { CIN: CIN?.toUpperCase() }
      ]
    });

    if (existingCompany) {
      return res.status(400).json({ 
        success: false,
        message: 'Company with this ISIN, PAN, or CIN already exists' 
      });
    }

    const company = new Company({
      Logo: Logo || '',
      CompanyName,
      ScripName,
      ISIN: ISIN.toUpperCase(),
      PAN: PAN.toUpperCase(),
      CIN: CIN.toUpperCase(),
      RegistrationDate,
      Sector
    });

    await company.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Company created successfully', 
      data: company 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    next(error);
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company (admin only)
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res, next) => {
  try {
    const { Logo, CompanyName, ScripName, ISIN, PAN, CIN, RegistrationDate, Sector } = req.body;

    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Check if ISIN, PAN, or CIN is being changed and if it conflicts with another company
    if (ISIN && ISIN.toUpperCase() !== company.ISIN) {
      const existingISIN = await Company.findOne({ 
        ISIN: ISIN.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingISIN) {
        return res.status(400).json({ 
          success: false,
          message: 'ISIN already exists' 
        });
      }
    }

    if (PAN && PAN.toUpperCase() !== company.PAN) {
      const existingPAN = await Company.findOne({ 
        PAN: PAN.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingPAN) {
        return res.status(400).json({ 
          success: false,
          message: 'PAN already exists' 
        });
      }
    }

    if (CIN && CIN.toUpperCase() !== company.CIN) {
      const existingCIN = await Company.findOne({ 
        CIN: CIN.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingCIN) {
        return res.status(400).json({ 
          success: false,
          message: 'CIN already exists' 
        });
      }
    }

    // Update fields
    if (Logo !== undefined) company.Logo = Logo;
    if (CompanyName) company.CompanyName = CompanyName;
    if (ScripName) company.ScripName = ScripName;
    if (ISIN) company.ISIN = ISIN.toUpperCase();
    if (PAN) company.PAN = PAN.toUpperCase();
    if (CIN) company.CIN = CIN.toUpperCase();
    if (RegistrationDate) company.RegistrationDate = RegistrationDate;
    if (Sector) company.Sector = Sector;

    await company.save();
    
    res.json({ 
      success: true,
      message: 'Company updated successfully', 
      data: company 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    next(error);
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company (admin only)
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    await Company.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Company deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
