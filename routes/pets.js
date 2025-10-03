// MODELS
const Pet = require('../models/pet');

// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

// Debug AWS credentials and ImageMagick
console.log('=== AWS Configuration Debug ===');
console.log('S3_BUCKET:', process.env.S3_BUCKET);
console.log('S3_REGION:', process.env.S3_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');

// Add ImageMagick to PATH for s3-uploader
const imageMagickPath = 'C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI';
const currentDir = __dirname;

// Add current directory (with wrapper scripts) and ImageMagick to PATH
process.env.PATH = currentDir + ';' + imageMagickPath + ';' + process.env.PATH;

// Set environment variables for ImageMagick v7 compatibility
process.env.MAGICK_HOME = imageMagickPath;
process.env.MAGICK_CONFIGURE_PATH = imageMagickPath;

// Check if ImageMagick is available
const { exec } = require('child_process');
exec('magick identify -version', (error, stdout, stderr) => {
  if (error) {
    console.log('ImageMagick identify command not found, trying legacy command...');
    // Try creating a symlink or alias for legacy 'identify' command
    exec(`"${imageMagickPath}\\magick.exe" identify -version`, (error2, stdout2, stderr2) => {
      if (error2) {
        console.log('ImageMagick not working:', error2.message);
      } else {
        console.log('ImageMagick found with full path');
      }
    });
  } else {
    console.log('ImageMagick identify command found in PATH');
  }
});

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    suffix: '-standard'
  },{
    maxWidth: 300,
    maxHeight: 300,
    suffix: '-square'
  }]
});

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', upload.single('avatar'), (req, res, next) => {
    console.log('=== POST /pets REQUEST ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    
    var pet = new Pet(req.body);
    pet.save(function (err) {
      if (err) {
        console.log('Pet save error:', err);
        return res.status(400).send({ err: err });
      }
      
      console.log('Pet saved successfully:', pet._id);
      
      if (req.file) {
        console.log('Starting S3 upload...');
        console.log('AWS Config:', {
          bucket: process.env.S3_BUCKET,
          region: process.env.S3_REGION,
          hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
        });
        
        // Upload the images
        client.upload(req.file.path, {}, function (err, versions, meta) {
          if (err) { 
            console.log('S3 upload error:', err);
            console.log('Error details:', JSON.stringify(err, null, 2));
            // Don't fail the request, just save without avatar
            pet.avatarUrl = null;
            pet.save();
            return res.send({ pet: pet, uploadError: err.message });
          }

          console.log('S3 upload successful:', versions);
          
          // Pop off the -square and -standard and just use the one URL to grab the image
          versions.forEach(function (image) {
            var urlArray = image.url.split('-');
            urlArray.pop();
            var url = urlArray.join('-');
            console.log('Setting avatarUrl to:', url);
            pet.avatarUrl = url;
            pet.save();
          });

          console.log('Sending response...');
          res.send({ pet: pet });
        });
      } else {
        console.log('No file uploaded, sending response...');
        res.send({ pet: pet });
      }
    })
  });

  // Keep old error handling for other routes
  app.post('/pets-old-handler', (req, res) => {
    var pet = new Pet(req.body);
    pet.save()
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`);
      })
      .catch((err) => {
        res.redirect(`/pets/${pet._id}`);
      })
      .catch((err) => {
        console.log(err);
        res.render('pets-new');
      });
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });

  // SEARCH PET
  app.get('/search', (req, res) => {
    const term = new RegExp(req.query.term, 'i')
    const page = req.query.page || 1
    
    Pet.paginate(
      {
        $or: [
          { 'name': term },
          { 'species': term }
        ]
      },
      { page: page }).then((results) => {
        res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page, term: req.query.term });
      });
  });
}
