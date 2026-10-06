import { AppState } from '../types';

interface NavigationProps {
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

export default function Navigation({ activeState, onNavigate }: NavigationProps) {
  const isNavHidden = activeState !== 'hero';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-8 md:px-16 pt-10 ${
        isNavHidden
          ? 'opacity-0 -translate-y-10 pointer-events-none'
          : 'opacity-100 translate-y-0'
      }`}
    >
      <ul className="flex justify-between items-center w-full list-none">
        <li>
          <button
            onClick={() => onNavigate('services')}
            className={`font-sans text-[15px] md:text-[18px] font-bold tracking-wider uppercase cursor-none transition-colors duration-300 ${
              activeState === 'services' ? 'text-brand-red' : 'text-brand-red hover:text-brand-green'
            }`}
          >
            Servicios
          </button>
        </li>
        <li>
          <button
            onClick={() => onNavigate('about')}
            className={`font-sans text-[15px] md:text-[18px] font-bold tracking-wider uppercase cursor-none transition-colors duration-300 ${
              activeState === 'about' ? 'text-brand-red' : 'text-brand-red hover:text-brand-green'
            }`}
          >
            Sobre Mí
          </button>
        </li>
        <li>
          <button
            onClick={() => onNavigate('services')} // We could also make this scroll to the bottom or open mailto
            className={`font-sans text-[15px] md:text-[18px] font-bold tracking-wider uppercase cursor-none transition-colors duration-300 ${
              activeState === 'services' ? 'text-brand-red' : 'text-brand-red hover:text-brand-green'
            }`}
          >
            Contacto
          </button>
        </li>
      </ul>
    </nav>
  );
}
