const fs = require('fs');
const path = require('path');

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  content = content.replace(/const User = require\(['"]\.\.?\/models\/User['"]\);/g, "const userRepository = require('../repositories/UserRepository');");
  content = content.replace(/const User = require\(['"]\.\/models\/User['"]\);/g, "const userRepository = require('./repositories/UserRepository');");
  
  // Special case for files at the same level vs subdirectories
  if (filePath.includes('routes')) {
      content = content.replace(/const userRepository = require\('\.\/repositories\/UserRepository'\);/g, "const userRepository = require('../repositories/UserRepository');");
  } else if (!filePath.includes('server.js') && !filePath.includes('reset') && !filePath.includes('clear') && !filePath.includes('check')) {
      // Just keep as is
  }

  // Replace methods
  content = content.replace(/User\.findById\(/g, 'userRepository.findById(');
  content = content.replace(/User\.findOne\(/g, 'userRepository.findOne(');
  content = content.replace(/User\.findByIdAndUpdate\(/g, 'userRepository.updateById(');
  content = content.replace(/User\.findOneAndUpdate\(/g, 'userRepository.updateOne(');
  content = content.replace(/User\.create\(/g, 'userRepository.create(');
  content = content.replace(/User\.findByIdAndDelete\(/g, 'userRepository.deleteById(');
  content = content.replace(/User\.find\(/g, 'userRepository.findMany(');
  
  fs.writeFileSync(filePath, content);
}

const files = [
  'server.js',
  'reset_test_data.js',
  'reset_db.js',
  'clear_txns.js',
  'check_tokens.js'
];

files.forEach(f => {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) {
    migrateFile(fp);
    console.log(`Migrated ${f}`);
  }
});
