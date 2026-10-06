import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { X, Upload, RotateCcw, Sparkles, FileText, Video, Image as ImageIcon, Link2 } from 'lucide-react';
import { saveMediaBlob, deleteMediaBlob, clearAllMediaBlobs } from '../lib/db';

const getOptimizedMediaUrl = (url: string) => {
  if (!url) return url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const directDriveUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    return `/api/proxy-image?url=${encodeURIComponent(directDriveUrl)}&v=2`;
  }
  const driveUcMatch = url.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/);
  if (driveUcMatch && driveUcMatch[1]) {
    const directDriveUrl = `https://drive.google.com/uc?export=view&id=${driveUcMatch[1]}`;
    return `/api/proxy-image?url=${encodeURIComponent(directDriveUrl)}&v=2`;
  }
  return url;
};

interface MediaCenterProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onUpdateProjects: (updated: Project[]) => void;
  customLogo: string;
  onUpdateLogo: (logo: string) => void;
}

const PREMIUM_PRESETS: Partial<Project>[] = [
  {
    id: '1',
    title: 'Sfera Branding',
    tags: 'Branding · Identidad Visual',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-futuristic-tech-glass-ring-43187-large.mp4'
  },
  {
    id: '2',
    title: 'Kinetic Loops',
    tags: 'Diseño de Movimiento · Bucle 3D',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-creative-fluid-shapes-gradient-animation-40176-large.mp4'
  },
  {
    id: '3',
    title: 'Editorial Folio',
    tags: 'Ilustración · Prensa',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-connection-wave-pattern-40250-large.mp4'
  },
  {
    id: '4',
    title: 'Archivo Social',
    tags: 'Contenido Digital · Redes Sociales',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-paint-swirling-background-loop-40130-large.mp4'
  },
  {
    id: '5',
    title: 'Experimento Tipográfico',
    tags: 'Diseño de Afiches · Imprenta',
    image: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41851-large.mp4'
  },
  {
    id: '6',
    title: 'Reel Cinemático',
    tags: 'Video · Dirección de Arte',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-futuristic-neon-city-tunnel-loop-43890-large.mp4'
  }
];

export default function MediaCenter({
  isOpen,
  onClose,
  projects,
  onUpdateProjects,
  customLogo,
  onUpdateLogo,
}: MediaCenterProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('1');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Load Premium presets to look professional instantly
  const handleLoadPresets = () => {
    const updated = projects.map(proj => {
      const preset = PREMIUM_PRESETS.find(p => p.id === proj.id);
      if (preset) {
        return {
          ...proj,
          image: preset.image,
          video: preset.video,
        };
      }
      return proj;
    });
    onUpdateProjects(updated);
  };

  // Reset to default vector SVG graphics
  const handleResetToVectors = async () => {
    try {
      await clearAllMediaBlobs();
    } catch (err) {
      console.warn('Could not clear IndexedDB custom media:', err);
    }
    const updated = projects.map(proj => {
      const { image, video, ...rest } = proj;
      return rest as Project;
    });
    onUpdateProjects(updated);
    onUpdateLogo('');
    localStorage.removeItem('cc_custom_logo');
    localStorage.removeItem('cc_custom_media');
  };

  const handleTextChange = (field: keyof Project, value: string) => {
    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    onUpdateProjects(updated);
  };

  // Process selected file (Image or Video)
  const processFile = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Por favor, selecciona un archivo de imagen (.jpg, .png, etc.) o video (.mp4, .webm).');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Read file as base64
      const reader = new FileReader();
      const uploadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            if (!e.target?.result) {
              reject(new Error('Fallo al leer el archivo'));
              return;
            }
            const base64Str = e.target.result.toString().split(',')[1];
            
            // 2. Upload to backend server
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filename: file.name,
                fileData: base64Str,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              reject(new Error(errData.error || 'Error al subir el archivo al servidor'));
              return;
            }

            const data = await res.json();
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error('No se recibió la URL del archivo subido'));
            }
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error || new Error('Error de lectura'));
        reader.readAsDataURL(file);
      });

      const permanentUrl = await uploadPromise;

      // 3. Keep local IndexedDB in sync as a local fallback
      try {
        const key = isImage ? `img_${selectedProjectId}` : `vid_${selectedProjectId}`;
        await saveMediaBlob(key, file);
      } catch (err) {
        console.warn('Could not save media to IndexedDB:', err);
      }

      // Also try saving base64 for images/videos as a local fallback
      const readerLocal = new FileReader();
      readerLocal.onload = (e) => {
        if (e.target?.result) {
          try {
            const base64Str = e.target.result as string;
            const savedCustomMedia = JSON.parse(localStorage.getItem('cc_custom_media') || '{}');
            savedCustomMedia[isImage ? `img_${selectedProjectId}` : `vid_${selectedProjectId}`] = base64Str;
            localStorage.setItem('cc_custom_media', JSON.stringify(savedCustomMedia));
          } catch (err) {
            console.warn('Could not persist media to localStorage: ', err);
          }
        }
      };
      readerLocal.readAsDataURL(file);

      // 4. Update project with the server relative URL (e.g. /uploads/...)
      const updated = projects.map(proj => {
        if (proj.id === selectedProjectId) {
          if (isImage) {
            const currentImgs = proj.images || (proj.image ? [proj.image] : []);
            const newImgs = [...currentImgs.filter(i => i !== permanentUrl), permanentUrl];
            return {
              ...proj,
              image: permanentUrl,
              images: newImgs,
            };
          } else {
            const currentVids = proj.videos || (proj.video ? [proj.video] : []);
            const newVids = [...currentVids.filter(v => v !== permanentUrl), permanentUrl];
            return {
              ...proj,
              video: permanentUrl,
              videos: newVids,
            };
          }
        }
        return proj;
      });

      onUpdateProjects(updated);
      console.log('File successfully uploaded and saved permanently:', permanentUrl);
    } catch (err: any) {
      console.error('Error in processFile:', err);
      alert(`Error al guardar el archivo de forma permanente: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => processFile(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => processFile(file));
    }
  };

  // Add media via URL input
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        if (urlType === 'image') {
          const url = urlInput.trim();
          const currentImgs = proj.images || (proj.image ? [proj.image] : []);
          const newImgs = [...currentImgs.filter(i => i !== url), url];
          return {
            ...proj,
            image: url,
            images: newImgs
          };
        } else {
          const url = urlInput.trim();
          const currentVids = proj.videos || (proj.video ? [proj.video] : []);
          const newVids = [...currentVids.filter(v => v !== url), url];
          return {
            ...proj,
            video: url,
            videos: newVids
          };
        }
      }
      return proj;
    });

    onUpdateProjects(updated);
    setUrlInput('');
  };

  // Custom Logo Upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        // 1. Read file as base64
        const reader = new FileReader();
        const uploadPromise = new Promise<string>((resolve, reject) => {
          reader.onload = async (event) => {
            try {
              if (!event.target?.result) {
                reject(new Error('Fallo al leer el archivo de logo'));
                return;
              }
              const base64Str = event.target.result.toString().split(',')[1];
              
              // 2. Upload to server
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  filename: file.name,
                  fileData: base64Str,
                }),
              });

              if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                reject(new Error(errData.error || 'Error al subir el logo al servidor'));
                return;
              }

              const data = await res.json();
              if (data.url) {
                resolve(data.url);
              } else {
                reject(new Error('No se recibió la URL del logo subido'));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(reader.error || new Error('Error de lectura'));
          reader.readAsDataURL(file);
        });

        const permanentUrl = await uploadPromise;

        // 3. Local IndexedDB & localStorage fallback
        try {
          await saveMediaBlob('logo', file);
        } catch (err) {
          console.warn('Could not save logo blob to IndexedDB:', err);
        }

        const readerLocal = new FileReader();
        readerLocal.onload = (event) => {
          if (event.target?.result) {
            const logoBase64 = event.target.result as string;
            localStorage.setItem('cc_custom_logo', logoBase64);
          }
        };
        readerLocal.readAsDataURL(file);

        // 4. Update the parent app custom logo state with permanent url!
        onUpdateLogo(permanentUrl);
        console.log('Logo successfully uploaded and saved permanently:', permanentUrl);
      } catch (err: any) {
        console.error('Error in handleLogoUpload:', err);
        alert(`Error al guardar el logo de forma permanente: ${err.message || err}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto no-scrollbar cursor-none">
      <div className="bg-white border border-brand-green/30 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(27,242,163,0.2)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green animate-pulse" />
            <h2 className="font-sans font-black text-lg text-brand-red uppercase tracking-wide">
              Centro de Carga Multimedia
            </h2>
          </div>
          
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-brand-darkred hover:text-brand-red transition-colors duration-200 cursor-none"
            >
              <X className="w-5 h-5" />
            </button>
          
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-brand-green/5 flex flex-wrap gap-3 items-center justify-between">
          <div className="text-xs text-brand-blue font-semibold">
            🚀 Personaliza tu portafolio de Montevideo con fotos y videos reales
          </div>
          <div className="flex gap-2">
            
              <button
                onClick={handleLoadPresets}
                className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-white bg-brand-green hover:bg-brand-green/90 px-3 py-1.5 rounded-sm transition-all duration-300 shadow-sm cursor-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cargar Preset Premium
              </button>
            
            
              <button
                onClick={handleResetToVectors}
                className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-brand-red bg-transparent border border-brand-red/20 hover:border-brand-red hover:bg-brand-red/5 px-3 py-1.5 rounded-sm transition-all duration-300 cursor-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Vectores SVG
              </button>
            
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Project Selector */}
          <div className="md:col-span-4 border-r border-gray-100 pr-0 md:pr-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-brand-darkred uppercase tracking-wider mb-2">
              Seleccionar Proyecto
            </div>
            {projects.map(proj => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`w-full text-left p-3 rounded-md border transition-all duration-300 flex items-center justify-between cursor-none ${
                  selectedProjectId === proj.id
                    ? 'border-brand-green bg-brand-green/10 text-brand-red font-bold'
                    : 'border-gray-100 hover:border-brand-blue/30 text-brand-darkred hover:bg-gray-50'
                }`}
              >
                <div className="truncate">
                  <div className="text-xs font-mono text-brand-darkred">PROYECTO 0{proj.id}</div>
                  <div className="text-sm truncate font-sans tracking-wide uppercase">{proj.title}</div>
                </div>
                <div className="flex gap-1">
                  {proj.image && <ImageIcon className="w-3.5 h-3.5 text-brand-green" />}
                  {proj.video && <Video className="w-3.5 h-3.5 text-brand-blue" />}
                </div>
              </button>
            ))}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-xs font-bold text-brand-darkred uppercase tracking-wider mb-2">
                Logotipo del Estudio
              </div>
              <div className="p-3 bg-gray-50 rounded-md border border-dashed border-gray-200 relative min-h-[64px] flex items-center justify-center">
                {isUploading ? (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-red animate-pulse">
                    Guardando Logo...
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 cursor-none w-full">
                    <Upload className="w-4 h-4 text-brand-green" />
                    <span className="text-[11px] font-bold uppercase text-brand-blue">Subir Logo Personalizado</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
                {customLogo && (
                  <div className="mt-2 p-1.5 bg-white border rounded flex items-center justify-between gap-2">
                    <img loading="lazy" decoding="async" src={customLogo} alt="Custom Logo" className="h-6 object-contain" />
                    <button
                      onClick={() => {
                        onUpdateLogo('');
                        localStorage.removeItem('cc_custom_logo');
                      }}
                      className="text-[10px] text-brand-red uppercase font-bold cursor-none"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Form */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Title & Metadata inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">
                  Título del Proyecto
                </label>
                <input
                  type="text"
                  value={currentProject.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-green font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">
                  Categoría / Tags
                </label>
                <input
                  type="text"
                  value={currentProject.tags}
                  onChange={(e) => handleTextChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-green font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">
                Detalles del Proyecto
              </label>
              <textarea
                value={currentProject.details}
                onChange={(e) => handleTextChange('details', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-green font-sans"
              />
            </div>

            {/* Media Uploader Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Local File Dropzone */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">
                  1. Subir Archivo Local (Arrastrar o Clic)
                </span>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`flex-1 min-h-[160px] border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:border-brand-green/60 hover:bg-brand-green/[0.02] cursor-none relative ${
                    isDragging ? 'border-brand-green bg-brand-green/10' : 'border-gray-200 bg-white'
                  } ${isUploading ? 'opacity-80' : ''}`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-red mb-1">
                        Subiendo archivo...
                      </span>
                      <span className="text-[10px] text-gray-400 max-w-[180px]">
                        Guardando de forma permanente en el servidor de Montevideo
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-brand-green mb-2 animate-bounce" />
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-red mb-1">
                        Selecciona Imagen o Video
                      </span>
                      <span className="text-[10px] text-gray-400 max-w-[200px]">
                        Admite JPG, PNG, GIF o loops MP4 (ideal menor a 4MB)
                      </span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Paste URL Input */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">
                  2. Cargar desde un Enlace URL
                </span>
                <form onSubmit={handleAddUrl} className="flex-1 flex flex-col justify-between p-4 border border-gray-100 rounded-md bg-gray-50/50">
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase cursor-none">
                      <input
                        type="radio"
                        checked={urlType === 'image'}
                        onChange={() => setUrlType('image')}
                        className="accent-brand-green cursor-none"
                      />
                      Imagen URL
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase cursor-none">
                      <input
                        type="radio"
                        checked={urlType === 'video'}
                        onChange={() => setUrlType('video')}
                        className="accent-brand-green cursor-none"
                      />
                      Video MP4 URL
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={
                        urlType === 'image'
                          ? 'https://ejemplo.com/foto.jpg'
                          : 'https://ejemplo.com/loop.mp4'
                      }
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-sm text-xs focus:outline-none focus:border-brand-green font-sans"
                    />
                    <button
                      type="submit"
                      className="bg-brand-blue hover:bg-brand-blue/90 text-white font-sans text-xs font-bold uppercase px-3 py-1.5 rounded-sm transition-all cursor-none"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="text-[10px] text-gray-400 mt-2 italic">
                    💡 Consejo: Puedes copiar enlaces directos de Pexels, Unsplash o repositorios públicos para mantener el portafolio ligero.
                  </div>
                </form>
              </div>

            </div>

            {/* Live Card Preview */}
            <div className="mt-2 p-4 bg-neutral-950 rounded-md text-white">
              <div className="text-[10px] font-mono text-brand-green uppercase tracking-widest mb-2">
                Vista previa de Multimedia asignada
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-neutral-900 border border-white/10 rounded overflow-hidden flex items-center justify-center relative">
                  {(() => {
                    const previewIsDefaultVideo = currentProject.video && currentProject.video.includes('mixkit.co');
                    const previewIsDefaultImage = currentProject.image && currentProject.image.includes('unsplash.com');
                    const previewHasCustomImage = currentProject.image && !previewIsDefaultImage;
                    const previewHasCustomVideo = currentProject.video && !previewIsDefaultVideo;
                    const previewEffectiveVideo = (previewHasCustomImage && !previewHasCustomVideo) ? undefined : currentProject.video;

                    if (previewEffectiveVideo) {
                      return (
                        <video
                          src={getOptimizedMediaUrl(previewEffectiveVideo)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          ref={(el) => { if (el) el.muted = true; }}
                          className="w-full h-full object-cover"
                        />
                      );
                    } else if (currentProject.image) {
                      return (
                        <img loading="lazy" decoding="async"
                          src={getOptimizedMediaUrl(currentProject.image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      );
                    } else {
                      return (
                        <span className="text-[9px] font-mono text-gray-500 uppercase">Vector SVG</span>
                      );
                    }
                  })()}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-green">{currentProject.title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{currentProject.tags}</div>
                  <div className="flex gap-1.5 mt-2">
                    {currentProject.image && (
                      <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                        <ImageIcon className="w-2.5 h-2.5 text-brand-green" /> Imagen Cargada
                      </span>
                    )}
                    {(() => {
                      const previewIsDefaultVideo = currentProject.video && currentProject.video.includes('mixkit.co');
                      const previewIsDefaultImage = currentProject.image && currentProject.image.includes('unsplash.com');
                      const previewHasCustomImage = currentProject.image && !previewIsDefaultImage;
                      const previewHasCustomVideo = currentProject.video && !previewIsDefaultVideo;
                      const previewEffectiveVideo = (previewHasCustomImage && !previewHasCustomVideo) ? undefined : currentProject.video;

                      return previewEffectiveVideo && (
                        <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                          <Video className="w-2.5 h-2.5 text-brand-blue" /> Loop Video Activo
                        </span>
                      );
                    })()}
                    {!currentProject.image && !currentProject.video && (
                      <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-gray-400 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                        Gráfica Generativa SVG Activa
                      </span>
                    )}
                  </div>
                </div>
                {(currentProject.image || currentProject.video) && (
                  <button
                    onClick={() => {
                      const updated = projects.map(p => {
                        if (p.id === selectedProjectId) {
                          const { image, video, ...rest } = p;
                          return rest as Project;
                        }
                        return p;
                      });
                      onUpdateProjects(updated);
                    }}
                    className="text-xs text-brand-red border border-brand-red/30 hover:border-brand-red px-2 py-1 rounded hover:bg-brand-red/5 font-sans font-bold uppercase transition-all cursor-none"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="text-[10px] text-gray-400 font-mono">
            Montevideo, Uruguay · Estilo Suizo-Alemán & Cinético
          </div>
          
            <button
              onClick={onClose}
              className="font-sans text-[11px] font-bold tracking-[0.1em] text-white hover:text-brand-green bg-brand-red hover:bg-neutral-900 uppercase transition-all duration-300 px-6 py-2.5 rounded-sm cursor-none"
            >
              Listo, aplicar cambios
            </button>
          
        </div>

      </div>
    </div>
  );
}
