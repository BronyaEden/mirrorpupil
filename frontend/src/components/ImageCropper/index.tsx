import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Space, Slider } from 'antd';
import { UploadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface ImageCropperProps {
  imageSrc: string;
  visible: boolean;
  onCancel: () => void;
  onCropComplete: (croppedImage: string) => void;
  cropType?: 'avatar' | 'cover';
  coverFillMode?: 'cover' | 'contain' | 'fill';
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  imageSrc, 
  visible, 
  onCancel, 
  onCropComplete,
  cropType = 'avatar',
  coverFillMode = 'cover'
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 重置状态
  useEffect(() => {
    if (visible) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [visible]);

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 生成裁剪后的图片
  const getCroppedImg = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !containerRef.current) {
        reject(new Error('Missing elements'));
        return;
      }

      const img = imgRef.current;
      
      // 等待图片加载完成
      if (!img.complete) {
        img.onload = () => {
          performCrop().then(resolve).catch(reject);
        };
        img.onerror = () => {
          reject(new Error('Image failed to load'));
        };
        return;
      }
      
      performCrop().then(resolve).catch(reject);
    });
    
    function performCrop(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!imgRef.current || !containerRef.current) {
          reject(new Error('Missing elements'));
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const img = imgRef.current;
        
        // 根据裁剪类型设置canvas大小
        if (cropType === 'avatar') {
          // 头像大小(200x200)
          canvas.width = 200;
          canvas.height = 200;
        } else {
          // 背景图大小(1920x600)
          canvas.width = 1920;
          canvas.height = 600;
        }

        // 计算缩放比例
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        
        // 获取容器和图片的位置信息
        const containerRect = containerRef.current.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        // 计算图片相对于容器的位置
        const imgOffsetX = imgRect.left - containerRect.left;
        const imgOffsetY = imgRect.top - containerRect.top;
        
        // 根据裁剪类型设置裁剪区域大小
        const cropWidth = cropType === 'avatar' ? 200 : 1920;
        const cropHeight = cropType === 'avatar' ? 200 : 600;
        
        // 计算裁剪区域（在容器中固定为指定大小的中心区域）
        const cropAreaX = (containerRect.width - (cropType === 'avatar' ? 200 : 300)) / 2;
        const cropAreaY = (containerRect.height - (cropType === 'avatar' ? 200 : 200)) / 2;
        
        // 计算裁剪区域相对于图片的位置
        const cropRelativeX = cropAreaX - imgOffsetX - position.x;
        const cropRelativeY = cropAreaY - imgOffsetY - position.y;
        
        // 考虑缩放因素，计算在原始图片中的裁剪区域
        const sourceX = (cropRelativeX * scaleX) / scale;
        const sourceY = (cropRelativeY * scaleY) / scale;
        const sourceWidth = ((cropType === 'avatar' ? 200 : 300) * scaleX) / scale;
        const sourceHeight = ((cropType === 'avatar' ? 200 : 200) * scaleY) / scale;

        // 确保裁剪区域不超出图片边界
        const safeSourceX = Math.max(0, Math.min(img.naturalWidth - sourceWidth, sourceX));
        const safeSourceY = Math.max(0, Math.min(img.naturalHeight - sourceHeight, sourceY));

        // 对于背景图，根据coverFillMode参数决定如何绘制
        if (cropType === 'cover') {
          // 先清空canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 根据填充模式绘制图片
          if (coverFillMode === 'cover') {
            // cover模式：保持宽高比，完全覆盖canvas
            const scaleX = canvas.width / sourceWidth;
            const scaleY = canvas.height / sourceHeight;
            const scale = Math.max(scaleX, scaleY);
            
            const drawWidth = sourceWidth * scale;
            const drawHeight = sourceHeight * scale;
            const drawX = (canvas.width - drawWidth) / 2;
            const drawY = (canvas.height - drawHeight) / 2;
            
            ctx.drawImage(
              img,
              safeSourceX,
              safeSourceY,
              sourceWidth,
              sourceHeight,
              drawX,
              drawY,
              drawWidth,
              drawHeight
            );
          } else if (coverFillMode === 'contain') {
            // contain模式：保持宽高比，完整显示图片
            const scaleX = canvas.width / sourceWidth;
            const scaleY = canvas.height / sourceHeight;
            const scale = Math.min(scaleX, scaleY);
            
            const drawWidth = sourceWidth * scale;
            const drawHeight = sourceHeight * scale;
            const drawX = (canvas.width - drawWidth) / 2;
            const drawY = (canvas.height - drawHeight) / 2;
            
            ctx.drawImage(
              img,
              safeSourceX,
              safeSourceY,
              sourceWidth,
              sourceHeight,
              drawX,
              drawY,
              drawWidth,
              drawHeight
            );
          } else {
            // fill模式：拉伸图片以填充整个canvas
            ctx.drawImage(
              img,
              safeSourceX,
              safeSourceY,
              sourceWidth,
              sourceHeight,
              0,
              0,
              canvas.width,
              canvas.height
            );
          }
        } else {
          // 对于头像，保持原有逻辑
          ctx.drawImage(
            img,
            safeSourceX,
            safeSourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            cropWidth,
            cropHeight
          );
        }

        // 转换为base64
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      });
    }
  };

  // 确认裁剪
  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg();
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  // 处理缩放变化
  const handleScaleChange = (value: number) => {
    setScale(value);
  };

  return (
    <Modal
      title={cropType === 'avatar' ? "裁剪头像" : "裁剪背景图"}
      open={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button 
            icon={<CloseOutlined />} 
            onClick={onCancel}
          >
            取消
          </Button>
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={handleConfirm}
          >
            确认裁剪
          </Button>
        </Space>
      }
      width={600}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 400
      }}>
        {imageSrc && (
          <div>
            <div 
              ref={containerRef}
              style={{ 
                width: 300, 
                height: 300, 
                border: '2px dashed #ddd',
                position: 'relative',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                margin: '0 auto'
              }}
              onMouseDown={handleMouseDown}
            >
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="待裁剪" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
                }} 
              />
              {/* 裁剪区域遮罩 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: cropType === 'avatar' ? 200 : 300,
                height: cropType === 'avatar' ? 200 : 200,
                border: '2px solid #1890ff',
                borderRadius: cropType === 'avatar' ? '50%' : '0',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'none'
              }} />
            </div>
            
            <div style={{ 
              marginTop: 20, 
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: 10 }}>缩放:</div>
              <Slider
                min={0.5}
                max={3}
                step={0.1}
                value={scale}
                onChange={handleScaleChange}
                style={{ width: 200, margin: '0 auto' }}
              />
            </div>
            
            <div style={{ 
              marginTop: 10, 
              textAlign: 'center',
              fontSize: 14,
              color: '#666'
            }}>
              拖拽移动图片，调整缩放来选择{cropType === 'avatar' ? '头像' : '背景图'}区域
            </div>
            
            {cropType === 'cover' && (
              <div style={{ 
                marginTop: 10, 
                textAlign: 'center',
                fontSize: 14,
                color: '#666'
              }}>
                背景填充模式: {coverFillMode === 'cover' ? '覆盖' : coverFillMode === 'contain' ? '包含' : '填充'}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageCropper;