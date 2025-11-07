/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { generateFilteredImage, generateAdjustedImage, generateProductDescription } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import FilterPanel from './components/FilterPanel';
import GeneratePanel from './components/GeneratePanel';
import CropPanel from './components/CropPanel';
import ProductDescriptionBox from './components/ProductDescriptionBox';
import { UndoIcon, RedoIcon } from './components/icons';
import StartScreen from './components/StartScreen';
import ImageThumbnails, { type ImageStateWithUrl } from './components/ImageThumbnails';
import BatchEditModal from './components/BatchEditModal';
import ImageComparator from './components/ImageComparator';
import ZoomPanContainer from './components/ZoomPanContainer';
import ImageToolbar from './components/ImageToolbar';
import CompareSliderHandle from './components/CompareSliderHandle';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

interface HistoryItem {
  file: File;
  productTitle?: string;
  productDescription?: string;
}

export interface ImageState {
  id: string;
  originalFile: File;
  history: HistoryItem[];
  historyIndex: number;
  isLoading: boolean;
  isGeneratingDescription: boolean;
}

type Tab = 'generate' | 'filters' | 'crop';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageState[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [isBatchEditModalOpen, setIsBatchEditModalOpen] = useState<boolean>(false);
  const [isCompareSliderActive, setIsCompareSliderActive] = useState<boolean>(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [sliderPosition, setSliderPosition] = useState(50);

  const imgRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const selectedImage = images.find(img => img.id === selectedImageId);
  const currentHistoryItem = selectedImage ? selectedImage.history[selectedImage.historyIndex] : null;
  const currentImage = currentHistoryItem?.file ?? null;
  const originalImage = selectedImage ? selectedImage.history[0].file : null;
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);

  const canUndo = selectedImage && selectedImage.historyIndex > 0;
  const canRedo = selectedImage && selectedImage.historyIndex < selectedImage.history.length - 1;

  const handleGenerateDescription = useCallback(async (imageFile: File, imageId: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, isGeneratingDescription: true } : img));
    try {
        const { title, description } = await generateProductDescription(imageFile);
        setImages(prev => prev.map(img => {
            if (img.id === imageId) {
                const newHistory = [...img.history];
                const targetIndex = img.historyIndex;
                if (newHistory[targetIndex]) {
                    newHistory[targetIndex] = {
                        ...newHistory[targetIndex],
                        productTitle: title,
                        productDescription: description,
                    };
                }
                return { ...img, history: newHistory, isGeneratingDescription: false };
            }
            return img;
        }));
    } catch (err) {
        console.error("Failed to generate product description", err);
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, isGeneratingDescription: false } : img));
    }
  }, []);

  const addNewImageVersion = useCallback((newImageFile: File, imageId: string) => {
    setImages(prevImages => prevImages.map(image => {
        if (image.id === imageId) {
            const newHistory = image.history.slice(0, image.historyIndex + 1);
            newHistory.push({ file: newImageFile });
            return {
                ...image,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                isLoading: false
            };
        }
        return image;
    }));
    setCrop(undefined);
    setCompletedCrop(undefined);
    handleGenerateDescription(newImageFile, imageId);
  }, [handleGenerateDescription]);

  const handleImageUpload = useCallback((files: FileList) => {
    setError(null);
    const newImages: ImageState[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        originalFile: file,
        history: [{ file }],
        historyIndex: 0,
        isLoading: false,
        isGeneratingDescription: false,
    }));
    setImages(newImages);
    setSelectedImageId(newImages[0]?.id ?? null);
    setActiveTab('generate');
    setCrop(undefined);
    setCompletedCrop(undefined);
    
    if (newImages.length > 1) {
      setIsBatchEditModalOpen(true);
    }
  }, []);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage || !selectedImageId) {
      setError('No image loaded to apply a filter to.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const filteredImageUrl = await generateFilteredImage(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addNewImageVersion(newImageFile, selectedImageId);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the filter. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addNewImageVersion, selectedImageId]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage || !selectedImageId) {
      setError('No image loaded to apply an adjustment to.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const adjustedImageUrl = await generateAdjustedImage(currentImage, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addNewImageVersion(newImageFile, selectedImageId);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the adjustment. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addNewImageVersion, selectedImageId]);
  
  const handleApplyAdjustmentToAll = useCallback(async (adjustmentPrompt: string) => {
    if (images.length === 0) {
      setError('No images loaded to apply adjustments to.');
      return;
    }
    
    setIsLoading(true);
    setImages(prev => prev.map(img => ({ ...img, isLoading: true })));
    setError(null);
    
    const adjustmentPromises = images.map(image => {
      const imageToAdjust = image.history[image.historyIndex].file;
      return generateAdjustedImage(imageToAdjust, adjustmentPrompt)
        .then(adjustedImageUrl => {
          const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${image.id}-${Date.now()}.png`);
          return { imageId: image.id, newImageFile, status: 'fulfilled' as const };
        })
        .catch(err => {
          console.error(`Failed to apply adjustment to image ${image.id}:`, err);
          return { imageId: image.id, error: err, status: 'rejected' as const };
        });
    });

    const results = await Promise.all(adjustmentPromises);

    setImages(prevImages => {
      let newImages = [...prevImages];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
            const imgIndex = newImages.findIndex(img => img.id === result.imageId);
            if (imgIndex !== -1) {
                const image = newImages[imgIndex];
                const newHistory = image.history.slice(0, image.historyIndex + 1);
                newHistory.push({ file: result.newImageFile });
                newImages[imgIndex] = {
                    ...image,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    isLoading: false
                };
            }
        } else {
            const imgIndex = newImages.findIndex(img => img.id === result.imageId);
            if (imgIndex !== -1) {
                newImages[imgIndex] = { ...newImages[imgIndex], isLoading: false };
            }
        }
      });
      return newImages;
    });

    setIsLoading(false);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        handleGenerateDescription(result.newImageFile, result.imageId);
      }
    });

    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      setError(`${failedCount} image(s) could not be processed. Please check the console for details.`);
    }

  }, [images, handleGenerateDescription]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current || !selectedImageId) {
        setError('Please select an area to crop.');
        return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        setError('Could not process the crop.');
        return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );
    
    const croppedImageUrl = canvas.toDataURL('image/png');
    const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
    addNewImageVersion(newImageFile, selectedImageId);

  }, [completedCrop, addNewImageVersion, selectedImageId]);

  const handleUndo = useCallback(() => {
    if (canUndo && selectedImageId) {
      setImages(prev => prev.map(img => img.id === selectedImageId ? { ...img, historyIndex: img.historyIndex - 1 } : img));
    }
  }, [canUndo, selectedImageId]);
  
  const handleRedo = useCallback(() => {
    if (canRedo && selectedImageId) {
      setImages(prev => prev.map(img => img.id === selectedImageId ? { ...img, historyIndex: img.historyIndex + 1 } : img));
    }
  }, [canRedo, selectedImageId]);

  const handleReset = useCallback(() => {
    if (selectedImageId) {
      setImages(prev => prev.map(img => img.id === selectedImageId ? { ...img, historyIndex: 0 } : img));
      setError(null);
    }
  }, [selectedImageId]);

  const handleUploadNew = useCallback(() => {
      setImages([]);
      setSelectedImageId(null);
      setError(null);
      setIsBatchEditModalOpen(false);
  }, []);
  
  const handleBatchEditSubmit = useCallback(async (prompt: string) => {
    await handleApplyAdjustmentToAll(prompt);
    setIsBatchEditModalOpen(false);
  }, [handleApplyAdjustmentToAll]);


  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };
  
  const imagesWithUrls: ImageStateWithUrl[] = images.map(image => ({
    ...image,
    url: URL.createObjectURL(image.history[image.historyIndex].file)
  }));
  
  useEffect(() => {
    return () => {
      imagesWithUrls.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, [images]);

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    if (!currentImageUrl || images.length === 0) {
      return <StartScreen onFileSelect={handleFileSelect} />;
    }

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
        <div ref={imageContainerRef} className="relative w-full h-[60vh] shadow-2xl rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
            {isLoading && !selectedImage?.isLoading && (
                <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Spinner />
                    <p className="text-gray-300">AI is working its magic...</p>
                </div>
            )}
            
            {activeTab === 'crop' ? (
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[60vh]"
              >
                <img 
                    ref={imgRef}
                    key={`crop-${currentImageUrl}`}
                    src={currentImageUrl} 
                    alt="Crop this image"
                    className="w-full h-auto object-contain max-h-[60vh] rounded-xl"
                  />
              </ReactCrop>
            ) : (
                <ZoomPanContainer zoom={zoom} setZoom={setZoom} pan={pan} setPan={setPan}>
                    {isCompareSliderActive && originalImageUrl ? (
                        <ImageComparator beforeSrc={originalImageUrl} afterSrc={currentImageUrl} sliderPosition={sliderPosition} />
                    ) : (
                        <img
                            ref={imgRef}
                            key={currentImageUrl}
                            src={currentImageUrl}
                            alt="Current"
                            className="w-full h-full object-contain"
                        />
                    )}
                </ZoomPanContainer>
            ) }

            {activeTab !== 'crop' && isCompareSliderActive && canUndo && (
              <CompareSliderHandle 
                position={sliderPosition}
                setPosition={setSliderPosition}
                containerRef={imageContainerRef}
              />
            )}

            <ImageToolbar 
              zoom={zoom}
              setZoom={setZoom}
              pan={pan}
              setPan={setPan}
              isCompareSliderActive={isCompareSliderActive}
              setIsCompareSliderActive={setIsCompareSliderActive}
              canCompare={canUndo && !!originalImageUrl}
            />
        </div>
        
        {images.length > 0 && (
          <ImageThumbnails 
            images={imagesWithUrls}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
          />
        )}

        <div className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm">
            {(['generate', 'filters', 'crop'] as Tab[]).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full capitalize font-semibold py-3 px-5 rounded-md transition-all duration-200 text-base ${
                        activeTab === tab 
                        ? 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/40' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
        
        <div className="w-full">
            {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop?.width && completedCrop.width > 0} />}
            {activeTab === 'generate' && selectedImage && (
                <GeneratePanel
                    onGenerate={handleApplyAdjustment}
                    isLoading={isLoading}
                />
            )}
            {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} />}
        </div>
        
        {selectedImage && (currentHistoryItem?.productTitle || selectedImage.isGeneratingDescription) && (
            <div className="w-full mt-6">
                <ProductDescriptionBox
                    isLoading={selectedImage.isGeneratingDescription}
                    title={currentHistoryItem?.productTitle}
                    description={currentHistoryItem?.productDescription}
                />
            </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button 
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
                aria-label="Undo last action"
            >
                <UndoIcon className="w-5 h-5 mr-2" />
                Undo
            </button>
            <button 
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
                aria-label="Redo last action"
            >
                <RedoIcon className="w-5 h-5 mr-2" />
                Redo
            </button>
            
            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>

            <button 
                onClick={handleReset}
                disabled={!canUndo}
                className="text-center bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent"
              >
                Reset
            </button>
            <button 
                onClick={handleUploadNew}
                className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base"
            >
                Upload New
            </button>

            <button 
                onClick={handleDownload}
                className="flex-grow sm:flex-grow-0 ml-auto bg-gradient-to-br from-red-600 to-red-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base"
            >
                Download Image
            </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className={`flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center ${images.length > 0 ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
      <BatchEditModal 
        isOpen={isBatchEditModalOpen}
        onClose={() => setIsBatchEditModalOpen(false)}
        onSubmit={handleBatchEditSubmit}
        imageCount={images.length}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;