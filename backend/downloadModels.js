const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const modelsDir = path.join(__dirname, 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
  console.log('✅ models folder created\n');
}

const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(modelsDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);

    console.log(`📥 Downloading: ${filename}...`);

    https.get(MODEL_URL + filename, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const downloadAll = async () => {
  console.log('🚀 Starting face recognition models download...\n');
  console.log(`📂 Download location: ${modelsDir}\n`);

  try {
    for (const file of files) {
      await downloadFile(file);
    }
    
    console.log('\n✅ All models downloaded successfully!');
    console.log('📊 Total files:', files.length);
    console.log('📂 Location:', modelsDir);
    console.log('\n🎉 You can now start your server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error downloading models:', error.message);
    console.log('\n💡 Alternative: Download manually from:');
    console.log('   https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
    process.exit(1);
  }
};

downloadAll();