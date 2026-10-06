const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/ServiceDetailModal.tsx');
let content = fs.readFileSync(file, 'utf8');

const serviceProjectCardCode = `
interface ServiceProjectCardProps {
  project: Project;
  onOpenProject?: (project: Project) => void;
}

function ServiceProjectCard({ project, onOpenProject }: ServiceProjectCardProps) {
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const clean = url.trim();
    if (getYouTubeId(clean)) return false;
    if (project.videos && project.videos.some(v => v.trim() === clean)) return true;
    if (project.video && project.video.trim() === clean) return true;
    if (/\\.(mp4|webm|ogg|mov)($|\\?)/i.test(clean)) return true;
    return false;
  };

  const primaryUrl = project.image || (project.images && project.images[0]) || project.video || (project.videos && project.videos[0]) || '';
  const isYt = primaryUrl ? getYouTubeId(primaryUrl) !== null : false;
  const isVid = primaryUrl ? isVideoUrl(primaryUrl) : false;
  const optimizedUrl = getOptimizedMediaUrl(primaryUrl);
  const ytId = isYt ? getYouTubeId(primaryUrl) : null;
  const ytPoster = ytId ? \`https://img.youtube.com/vi/\${ytId}/hqdefault.jpg\` : '';

  return (
    <div 
      onClick={() => onOpenProject?.(project)}
      className="aspect-[4/3] rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden relative group cursor-none transition-all duration-500 shadow-none"
    >
      {primaryUrl ? (
        <>
          {/* Blurred Background Media for Filling Card Space */}
          {isVid ? (
            <video
              src={optimizedUrl}
              muted
              playsInline
              loop
              autoPlay
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          ) : isYt ? (
            <img
              src={ytPoster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          ) : (
            <img
              src={optimizedUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          )}

          {/* Foreground Media */}
          {isVid ? (
            <video
              src={optimizedUrl}
              muted
              playsInline
              loop
              autoPlay
              className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 group-hover:scale-105"
            />
          ) : isYt ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out z-10 group-hover:scale-105">
              <iframe
                src={\`https://www.youtube.com/embed/\${ytId}?autoplay=0&controls=0&showinfo=0&rel=0\`}
                allow="autoplay; encrypted-media"
                className="w-full aspect-video pointer-events-none"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <img
              src={optimizedUrl}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 group-hover:scale-105"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/40 text-xs font-sans uppercase tracking-wider">Sin imagen</div>
        </div>
      )}

      {/* Title & Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <h3 className="text-white font-sans font-bold text-lg">
          {project.title}
        </h3>
        {project.tags && (
          <p className="text-slate-300 font-sans text-xs font-medium tracking-wide truncate mt-0.5">
            {project.tags}
          </p>
        )}
        <span className="text-brand-green font-sans text-xs uppercase tracking-widest mt-1">
          Ver Proyecto →
        </span>
      </div>
    </div>
  );
}

export default function ServiceDetailModal({`;

content = content.replace('export default function ServiceDetailModal({', serviceProjectCardCode);

const oldMapCode = `service.projects.map((proj, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (onOpenProject) {
                            onOpenProject(proj);
                          }
                        }}
                        className="aspect-[4/3] rounded-2xl bg-white backdrop-blur-sm  flex items-center justify-center overflow-hidden relative group cursor-pointer"
                      >
                        {/* Blurred Background Image */}
                        {proj.image && (
                          <img
                            src={getOptimizedMediaUrl(proj.image)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
                          />
                        )}
                        {/* Foreground Image */}
                        {proj.image && (
                          <img
                            src={getOptimizedMediaUrl(proj.image)}
                            alt={proj.title}
                            className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 group-hover:scale-105"
                          />
                        )}
                        {/* Title overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex flex-col justify-end">
                          <h3 className="text-white font-sans font-bold text-lg">{proj.title}</h3>
                          <span className="text-brand-green font-sans text-xs uppercase tracking-widest mt-1">Ver Proyecto</span>
                        </div>
                      </div>
                    ))`;

const newMapCode = `service.projects.map((proj, idx) => (
                      <ServiceProjectCard 
                        key={proj.id || idx} 
                        project={proj} 
                        onOpenProject={onOpenProject} 
                      />
                    ))`;

content = content.replace(oldMapCode, newMapCode);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched ServiceDetailModal.tsx');
