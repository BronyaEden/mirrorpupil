import File from '../models/File.js';

/**
 * 清理软删除超过12小时的文件
 * 该脚本会真正删除标记为软删除且超过12小时的文件
 */
const cleanupDeletedFiles = async () => {
  try {
    // 计算12小时前的时间
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // 查找软删除且删除时间超过12小时的文件
    const filesToDelete = await File.find({
      deleted: true,
      deletedAt: { $lt: twelveHoursAgo }
    });
    
    if (filesToDelete.length === 0) {
      console.log('没有需要清理的文件');
      return { success: true, message: '没有需要清理的文件', deletedCount: 0 };
    }
    
    // 删除文件记录（实际删除）
    const deletePromises = filesToDelete.map(async (file) => {
      // 在实际应用中，这里可能还需要删除文件系统中的实际文件
      // 例如: fs.unlinkSync(file.filePath);
      return await file.remove();
    });
    
    await Promise.all(deletePromises);
    
    console.log(`成功清理 ${filesToDelete.length} 个文件`);
    return { 
      success: true, 
      message: `成功清理 ${filesToDelete.length} 个文件`, 
      deletedCount: filesToDelete.length 
    };
  } catch (error) {
    console.error('清理文件时出错:', error);
    return { success: false, message: '清理文件时出错', error: error.message };
  }
};

export default cleanupDeletedFiles;