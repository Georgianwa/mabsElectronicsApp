// routes/uploadRoutes.js - Add this new file to your backend

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const authMiddleware = require('../middlewares/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `mabs-electronics/${folder}`,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * @route   POST /api/upload/product
 * @desc    Upload product image
 * @access  Private (Admin only)
 */
router.post('/product', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 Uploading product image to Cloudinary...');
    
    const result = await uploadToCloudinary(req.file.buffer, 'products');

    console.log('✅ Product image uploaded successfully');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('❌ Product image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/category
 * @desc    Upload category image
 * @access  Private (Admin only)
 */
router.post('/category', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 Uploading category image to Cloudinary...');
    
    const result = await uploadToCloudinary(req.file.buffer, 'categories');

    console.log('✅ Category image uploaded successfully');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('❌ Category image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/brand
 * @desc    Upload brand logo
 * @access  Private (Admin only)
 */
router.post('/brand', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 Uploading brand logo to Cloudinary...');
    
    const result = await uploadToCloudinary(req.file.buffer, 'brands');

    console.log('✅ Brand logo uploaded successfully');

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('❌ Brand logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Private (Admin only)
 */
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/,/g, '/'); // Handle encoded slashes

    console.log('🗑️  Deleting image from Cloudinary:', publicId);

    await cloudinary.uploader.destroy(publicId);

    console.log('✅ Image deleted successfully');

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('❌ Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple product images
 * @access  Private (Admin only)
 */
router.post('/multiple', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    console.log(`📤 Uploading ${req.files.length} images to Cloudinary...`);

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'products')
    );

    const results = await Promise.all(uploadPromises);

    const urls = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    console.log(`✅ ${urls.length} images uploaded successfully`);

    res.json({
      success: true,
      message: `${urls.length} images uploaded successfully`,
      images: urls
    });

  } catch (error) {
    console.error('❌ Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;

// ============================================
// FRONTEND: Update adminProducts.ejs form
// ============================================

/*
Replace image URL input with file upload:

<div class="form-group">
  <label for="imageFile">Product Image *</label>
  <input type="file" id="imageFile" name="imageFile" accept="image/*" required>
  <small>Max size: 5MB. Formats: JPG, PNG, WebP</small>
  
  <!-- Preview -->
  <div id="imagePreview" style="margin-top: 10px;"></div>
  
  <!-- Hidden field to store uploaded URL -->
  <input type="hidden" id="images" name="images">
</div>

<script>
// Image upload handler
document.getElementById('imageFile').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('imagePreview').innerHTML = 
      `<img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;">`;
  };
  reader.readAsDataURL(file);
  
  // Upload to server
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('/upload-product-image', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('images').value = data.url;
      alert('Image uploaded successfully!');
    } else {
      alert('Upload failed: ' + data.message);
    }
  } catch (error) {
    alert('Upload error: ' + error.message);
  }
});
</script>
*/
