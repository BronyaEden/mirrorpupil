import express from 'express';
import cors from 'cors';
import ImageController from '../controllers/imageController.js';

const router = express.Router();

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true,
  optionsSuccessStatus: 200
};

// 获取图片数据
router.get('/:imageId', cors(corsOptions), ImageController.getImage);

// 获取图片信息
router.get('/:imageId/info', cors(corsOptions), ImageController.getImageInfo);

export default router;