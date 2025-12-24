import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nlistplanet',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder, userId, docType, fileType) => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on file type
    const isPDF = fileType === 'application/pdf';
    const resourceType = isPDF ? 'raw' : 'image';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `nlistplanet/${folder}/${userId}`,
        public_id: `${docType}_${Date.now()}`,
        resource_type: resourceType,
        // Only apply transformations for images
        transformation: folder === 'profile-images' && !isPDF ? [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ] : undefined,
        // For PDFs, add flags for better delivery
        flags: isPDF ? 'attachment' : undefined,
        format: isPDF ? 'pdf' : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// @route   POST /api/auth/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      'profile-images',
      req.user._id.toString(),
      'profile',
      req.file.mimetype
    );

    // Update user profile
    const user = await User.findById(req.user._id);
    user.profileImage = imageUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload profile image' 
    });
  }
});

// @route   POST /api/kyc/upload-document
// @desc    Upload KYC document (PAN, Aadhar, Cheque, CML)
// @access  Private
router.post('/upload-document', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { docType } = req.body;
    
    // Validate document type
    const validDocTypes = ['pan', 'aadhar', 'cancelledCheque', 'cml'];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({ 
        message: 'Invalid document type. Must be: pan, aadhar, cancelledCheque, or cml' 
      });
    }

    // Upload to Cloudinary
    const documentUrl = await uploadToCloudinary(
      req.file.buffer,
      'kyc-documents',
      req.use,
      req.file.mimetyper._id.toString(),
      docType
    );

    // Update user KYC documents
    const user = await User.findById(req.user._id);
    user.kycDocuments[docType] = documentUrl;
    
    // Update KYC status to pending if all required docs are uploaded
    const { pan, aadhar, cancelledCheque } = user.kycDocuments;
    if (pan && aadhar && cancelledCheque && user.kycStatus === 'not_verified') {
      user.kycStatus = 'pending';
    }
    
    await user.save();

    res.json({
      success: true,
      message: `${docType.toUpperCase()} uploaded successfully`,
      documentUrl,
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload document' 
    });
  }
});

// @route   GET /api/kyc/documents
// @desc    Get user's KYC documents
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kycDocuments kycStatus');
    
    res.json({
      success: true,
      kycDocuments: user.kycDocuments,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve documents' 
    });
  }
});

// @route   DELETE /api/kyc/document/:docType
// @desc    Delete a KYC document
// @access  Private
router.delete('/document/:docType', protect, async (req, res) => {
  try {
    const { docType } = req.params;
    
    const validDocTypes = ['pan', 'aadhar', 'cancelledCheque', 'cml'];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({ 
        message: 'Invalid document type' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.kycDocuments[docType]) {
      return res.status(404).json({ 
        message: 'Document not found' 
      });
    }

    // Delete from Cloudinary (optional - commented out to keep history)
    // const publicId = extractPublicIdFromUrl(user.kycDocuments[docType]);
    // await cloudinary.uploader.destroy(publicId);

    // Remove from database
    user.kycDocuments[docType] = null;
    await user.save();

    res.json({
      success: true,
      message: `${docType.toUpperCase()} deleted successfully`
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      message: 'Failed to delete document' 
    });
  }
});

export default router;
