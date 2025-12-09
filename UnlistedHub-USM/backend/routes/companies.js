import express from 'express';
import Company from '../models/Company.js';

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { search, sector, page = 1, limit = 50 } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { CompanyName: { $regex: search, $options: 'i' } },
        { scriptName: { $regex: search, $options: 'i' } },
        { ScripName: { $regex: search, $options: 'i' } },
        { sector: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (sector) {
      query.sector = sector;
    }

    const skip = (page - 1) * limit;

    const companies = await Company.find(query)
      .select('-logo') // Exclude logo field to reduce response size
      .sort('name')
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

// @route   GET /api/companies/:id/highlights
// @desc    Get company highlights for share card
// @access  Public
router.get('/:id/highlights', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).select('name scriptName sector highlights description foundedYear');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Generate default highlights if none exist
    let highlights = company.highlights || [];
    
    if (highlights.length === 0) {
      // Auto-generate basic highlights
      const autoHighlights = [];
      if (company.sector) autoHighlights.push(`Sector: ${company.sector}`);
      if (company.foundedYear) autoHighlights.push(`Established: ${company.foundedYear}`);
      if (company.description) {
        // Extract first meaningful sentence
        const firstSentence = company.description.split('.')[0];
        if (firstSentence && firstSentence.length < 100) {
          autoHighlights.push(firstSentence);
        }
      }
      autoHighlights.push('Pre-IPO Unlisted Share');
      autoHighlights.push('Trade on NlistPlanet');
      highlights = autoHighlights.slice(0, 4);
    }

    res.json({
      success: true,
      data: {
        companyId: company._id,
        name: company.name,
        scriptName: company.scriptName,
        sector: company.sector,
        highlights: highlights.slice(0, 4) // Max 4 highlights
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/companies/:id/highlights
// @desc    Update company highlights (Admin only)
// @access  Private/Admin
router.put('/:id/highlights', async (req, res, next) => {
  try {
    const { highlights } = req.body;

    if (!Array.isArray(highlights) || highlights.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Highlights must be an array with max 5 items'
      });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { highlights: highlights.map(h => h.trim()).filter(h => h.length > 0) },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Highlights updated',
      data: company
    });
  } catch (error) {
    next(error);
  }
});

export default router;
