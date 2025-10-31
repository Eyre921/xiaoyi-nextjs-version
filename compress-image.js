const sharp = require('sharp');
const path = require('path');

async function compressImage() {
  const inputPath = path.join(__dirname, 'public', 'autopia-music-festival-bg.png');
  const outputJpgPath = path.join(__dirname, 'public', 'autopia-music-festival-bg.jpg');
  const outputWebpPath = path.join(__dirname, 'public', 'autopia-music-festival-bg.webp');
  
  try {
    console.log('开始压缩图片...');
    
    // 获取原始图片信息
    const metadata = await sharp(inputPath).metadata();
    console.log('原始图片信息:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    });
    
    // 压缩为JPEG格式 (质量80%, 最大宽度1920px)
    await sharp(inputPath)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(outputJpgPath);
    
    // 压缩为WebP格式 (质量85%, 最大宽度1920px)
    await sharp(inputPath)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 85
      })
      .toFile(outputWebpPath);
    
    // 检查压缩后的文件大小
    const fs = require('fs');
    const originalSize = fs.statSync(inputPath).size;
    const jpgSize = fs.statSync(outputJpgPath).size;
    const webpSize = fs.statSync(outputWebpPath).size;
    
    console.log('压缩结果:');
    console.log(`原始PNG: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`压缩JPEG: ${(jpgSize / 1024 / 1024).toFixed(2)} MB (减少 ${((1 - jpgSize/originalSize) * 100).toFixed(1)}%)`);
    console.log(`压缩WebP: ${(webpSize / 1024 / 1024).toFixed(2)} MB (减少 ${((1 - webpSize/originalSize) * 100).toFixed(1)}%)`);
    
    console.log('图片压缩完成！');
    
  } catch (error) {
    console.error('压缩图片时出错:', error);
  }
}

compressImage();