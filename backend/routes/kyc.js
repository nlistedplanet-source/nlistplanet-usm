import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/kyc/upload
// @desc    Upload KYC documents (all at once)
// @access  Private
router.post('/upload', protect, async (req, res) => {
  try {
    const { pan, aadhaar, bank, demat } = req.body;

    // Validate all documents provided
    if (!pan || !aadhaar || !bank || !demat) {
      return res.status(400).json({ message: 'All KYC documents are required' });
    }

    // TODO: Implement file upload to storage (S3/local)
    // TODO: Implement OCR extraction
    // TODO: Cross-check names across documents

    // Update user KYC status
    const user = await User.findById(req.user._id);
    user.kycDocuments = {
      pan: { ...pan, uploadedAt: new Date() },
      aadhaar: { ...aadhaar, uploadedAt: new Date() },
      bank: { ...bank, uploadedAt: new Date() },
      demat: { ...demat, uploadedAt: new Date() }
    };
    user.kycStatus = 'pending';
    await user.save();

    res.json({
      message: 'KYC documents submitted successfully',
      kycStatus: user.kycStatus
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/kyc/status
// @desc    Get KYC status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kycStatus kycDocuments');
    res.json({
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/kyc/mock-extract
// @desc    Mock OCR extraction (for testing, replace with real OCR)
// @access  Private
router.post('/mock-extract', protect, async (req, res) => {
  try {
    const { documentType } = req.body;
    
    // Mock extracted data based on document type
    const mockData = {
      pan: {
        name: req.user.fullName,
        dob: '01/01/1990',
        panNo: 'ABCDE1234F',
        fatherName: 'Father Name'
      },
      aadhaar: {
        address: 'Address Line 1, City, State - 123456',
        last4Digits: '1234'
      },
      bank: {
        accountHolder: req.user.fullName,
        accountNo: '1234567890',
        ifsc: 'SBIN0001234',
        micr: '400002001',
        branch: 'Main Branch'
      },
      demat: {
        dpId: '12345678',
        name: req.user.fullName
      }
    };

    res.json({
      extracted: mockData[documentType] || {}
    });
  } catch (error) {
    console.error('Mock extract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
