const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

try {
  // Get the git commit hash from the parent directory
  const hash = execSync('git rev-parse --short HEAD', { cwd: '..' }).toString().trim();
  console.log(`Git commit hash: ${hash}`);

  // Path to the index.html file
  const browserPath = path.join(__dirname, 'dist', 'angular-app', 'browser');
  const indexPath = path.join(browserPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    // Read the index.html file
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Prepare the build number div, styled to be invisible
    const buildNumberDiv = `<div id="build-number" style="color: transparent; font-size: 1px; position: absolute;">Build: ${hash}</div>`;

    // Append the div just before the closing body tag
    indexHtml = indexHtml.replace('</body>', `  ${buildNumberDiv}\n</body>`);

    // Write the modified file back
    fs.writeFileSync(indexPath, indexHtml, 'utf8');

    console.log('Successfully added build number to index.html');
  } else {
    console.error(`Error: index.html not found at ${indexPath}`);
    process.exit(1);
  }

  // Now, copy files to the root
  const rootPath = path.join(__dirname, '..');
  const distPath = path.join(__dirname, 'dist', 'angular-app');
  
  // Copy all files from browser directory
  fs.readdirSync(browserPath).forEach(file => {
    const srcPath = path.join(browserPath, file);
    const destPath = path.join(rootPath, file);
    fs.copySync(srcPath, destPath, { overwrite: true });
  });
  console.log('Successfully copied build files from browser directory to the root directory.');

  // Copy additional files from dist root
  const additionalFiles = ['3rdpartylicenses.txt', 'prerendered-routes.json'];
  additionalFiles.forEach(file => {
    const srcPath = path.join(distPath, file);
    const destPath = path.join(rootPath, file);
    if (fs.existsSync(srcPath)) {
      fs.copySync(srcPath, destPath, { overwrite: true });
      console.log(`Successfully copied ${file} to the root directory.`);
    }
  });

} catch (error) {
  console.error('Error during post-build script:', error);
  process.exit(1);
} 