import React, { useState, useCallback, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import ReactDOM from 'react-dom/client';

// A component to inject global styles and fonts required by the application.
const GlobalStyles = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
          body {
            font-family: 'Poppins', sans-serif;
            background-color: #f8fafc; /* bg-slate-50 */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
          }
           @keyframes slideInUp {
            from { 
                opacity: 0; 
                transform: translateY(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
            opacity: 0; /* Start hidden */
          }
          .animate-slide-in-up {
            animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            opacity: 0;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #70BF44;
            border-radius: 9999px;
            cursor: pointer;
            border: 4px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          input[type="range"]::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #70BF44;
            border-radius: 9999px;
            cursor: pointer;
            border: 4px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
          }
           input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
        `;
        document.head.appendChild(style);

        const fontLinks: HTMLLinkElement[] = [];
        const createLink = (props: Partial<HTMLLinkElement>) => {
            const link = document.createElement('link');
            Object.assign(link, props);
            document.head.appendChild(link);
            fontLinks.push(link);
        };
        
        createLink({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
        createLink({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' });
        createLink({ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' });

        return () => {
          document.head.removeChild(style);
          fontLinks.forEach(link => document.head.removeChild(link));
        };
    }, []);

    return null;
};


// ASSETS
const PLASTCUSTOM_LOGO_B64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQzIiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMjQzIDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xXzIpIj48cGF0aCBkPSJNMjQgMEMxMC43NDUyIDAgMCAxMC43NDUyIDAgMjRDMC AzNy4yNTQ4IDEwLjc0NTIgNDggMjQgNDhDMzcuMjU0OCA0OCA0OCAzNy4yNTQ4IDQ4IDI0QzQ4IDEwLjc0NTIgMzcuMjU0OCAwIDI0IDBaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMV8yKSIvPjxwYXRoIGQ9Ik0yOS41IDE5LjVWMTMuNUMyOS41IDEwLjQ2MjQgMjcuMDM3NiA4IDI0IDhDMjAuOTYyNCA4IDE4LjUgMTAuNDYyNCAxOC41IDEzLjVWMTkuNUgxM0wxMS41IDM3LjVIMzYuNUwzNSAxOS41SDI5LjVaTTIxIDEzLjVDMjEgMTEuODQzMSAyMi4zNDMxIDEwLjUgMjQgMTAuNUMyNS42NTY5IDEwLjUgMjcgMTEuODQzMSAyNyAxMy41VjE5LjVIMjFWMTMuNVoiIGZpbGw9IndoaXRlIi8+PHRleHQgZmlsbD0iIzAwNTkyRCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3R5bGU9IndoaXRlLXNwYWNlOiBwcmUiIGZvbnQtZmFtaWx5PSJQb3BwaW5zIiBmb250LXNpemU9IjMyIiBmb250LXdlaWdodD0iNjAwIiBsZXR0ZXItc3BhY2luZz0iMGVtIj48dHNwYW4geD0iNjIiIHk9IjM1LjUyIj5QbGFzdGN1c3RvbTwvdHNwYW4+PC90ZXh0PjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMV8yIiB4MT0iMCIgeTE9IjAiIHgyPSI0OCIgeTI9IjQ4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzcwQkY0NCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwNTkyRCIvPjwvbGluZWFyR3JhZGllbnQ+PGNsaXBQYXRoIGlkPSJjbGlwMF8xXzIiPjxyZWN0IHdpZHRoPSIyNDMiIGhlaWdodD0iNDgiIGZpbGw9IndoaXRlIi8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+";


// TYPES
interface BagParameters {
  bagType: string;
  size: string;
  thickness: number;
  printColors: number;
  material: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
}

interface FactoryResult {
  factoryName: string;
  location: string;
  estimatedPriceRange: string;
  estimatedLeadTime: string;
  reviewsSummary: string;
  contact: ContactInfo;
  isFeatured?: boolean;
  keyAdvantage?: string;
  minPrice?: number;
  maxPrice?: number;
  avgLeadTimeDays?: number;
  rating?: number;
  foundMaterial?: string;
  foundPrintColors?: string | number;
  foundThickness?: string | number;
  foundSize?: string;
}

enum AppState {
  SEARCH,
  RESULTS,
}

interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

// ICONS
type IconProps = {
    className?: string;
};

// FIX: Explicitly type the Icons object so TypeScript recognizes them as React components.
const Icons: { [key: string]: React.FC<IconProps> } = {
  Search: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Location: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Phone: ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  ),
  Mail: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  WhatsApp: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
  ),
  Link: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Info: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  ),
  Plus: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  History: ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Tag: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59l7 7a2 2 0 010 2.83l-5 5a2 2 0 01-2.83 0l-7-7A2 2 0 013 8V5a2 2 0 012-2z" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  DollarSign: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-6h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a4 4 0 000-8 4 4 0 000 8z" clipRule="evenodd" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a4 4 0 000-8 4 4 0 000 8z" />
       <path d="M12 4V2M12 22v-2"/>
    </svg>
  ),
  Bag: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Tshirt: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M15.25 4.75a2.5 2.5 0 00-5.5 0" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.75 5.75c0-1.5 1-2.5 2-2.5s2 1 2 2.5v1.5h-4v-1.5zM17.25 5.75c0-1.5-1-2.5-2-2.5s-2 1-2 2.5v1.5h4v-1.5z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.75 7.25h6.5l.5 12.5h-7.5l.5-12.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Palette: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343a2 2 0 01-1.414-.586l-.293-.293a2 2 0 00-2.828 0l-.293.293a2 2 0 01-1.414.586H7zm-2-7h2m6-2h2m-2-3h2" />
    </svg>
  ),
  Layers: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l-8-4.5 8-4.5 8 4.5-8 4.5zm0 0v9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5l8 4.5 8-4.5M4 12l8 4.5 8-4.5" />
    </svg>
  ),
};

// HOOKS
function useLocalStorage<T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    if (typeof window == 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`,
      );
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue];
}

// COMPONENTS
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#70BF44]"></div>
    </div>
  );
};

const Header: React.FC<{ onLogoClick: () => void; onNewSearchClick: () => void; }> = ({ onLogoClick, onNewSearchClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <img 
            src={PLASTCUSTOM_LOGO_B64} 
            alt="Plastcustom Logo" 
            className="h-10 w-auto cursor-pointer" 
            onClick={onLogoClick} 
        />
        <button 
            onClick={onNewSearchClick}
            className="bg-[#70BF44] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#5a9a36] transition-colors duration-300 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Icons.Search className="w-4 h-4" />
          <span>Nova Busca</span>
        </button>
      </div>
    </header>
  );
};

const ResultsView: React.FC<{
  results: FactoryResult[];
  sources: GroundingSource[] | null;
  onNewSearch: () => void;
  searchParams: BagParameters | null;
  isLoading: boolean;
}> = ({ results, sources, onNewSearch, searchParams, isLoading }) => {
    const [sortOrder, setSortOrder] = useState<'price' | 'leadTime'>('price');

    const featuredResult = useMemo(() => results.find(r => r.isFeatured), [results]);
    const regularResults = useMemo(() => results.filter(r => !r.isFeatured), [results]);

    const sortedResults = useMemo(() => {
        return [...regularResults].sort((a, b) => {
            if (sortOrder === 'price') {
                const priceA = a.minPrice ?? Infinity;
                const priceB = b.minPrice ?? Infinity;
                if (priceA !== priceB) return priceA - priceB;
            }
            if (sortOrder === 'leadTime') {
                const timeA = a.avgLeadTimeDays ?? Infinity;
                const timeB = b.avgLeadTimeDays ?? Infinity;
                if (timeA !== timeB) return timeA - timeB;
            }
            return a.factoryName.localeCompare(b.factoryName);
        });
    }, [regularResults, sortOrder]);

    const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating = 0 }) => {
        const fullStars = Math.floor(rating);
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Icons.Star key={`star-${i}`} className={`w-5 h-5 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };
    
    const PriceComparisonChart: React.FC<{ data: FactoryResult[] }> = ({ data }) => {
        const [activeBar, setActiveBar] = useState<{ result: FactoryResult; index: number } | null>(null);
        const tooltipRef = React.useRef<HTMLDivElement>(null);
        
        const chartData = useMemo(() => data.filter(d => d.minPrice != null && d.minPrice > 0).sort((a,b) => (a.minPrice || 0) - (b.minPrice || 0) ), [data]);

        useEffect(() => {
            if (activeBar && tooltipRef.current) {
                const chartEl = document.getElementById('price-chart-svg');
                const barEl = document.getElementById(`bar-${activeBar.index}`);
                if (chartEl && barEl) {
                    const chartRect = chartEl.getBoundingClientRect();
                    const barRect = barEl.getBoundingClientRect();
                    
                    const tooltipLeft = barRect.left - chartRect.left + barRect.width / 2;
                    const tooltipTop = barRect.top - chartRect.top;

                    tooltipRef.current.style.left = `${tooltipLeft}px`;
                    tooltipRef.current.style.top = `${tooltipTop}px`;
                }
            }
        }, [activeBar]);

        if (chartData.length < 2) {
            return null;
        }

        const chartHeight = 250;
        const chartWidth = 800;
        const yAxisWidth = 40;
        const xAxisHeight = 30;
        const barAreaWidth = chartWidth - yAxisWidth;

        const barPadding = 15;
        const barWidth = (barAreaWidth / chartData.length) - barPadding;
        
        const maxPrice = Math.ceil(Math.max(...chartData.map(d => d.minPrice || 0)) / 100) * 100; // Round up to nearest 100
        const priceScale = chartHeight / maxPrice;

        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-fade-in mb-6">
                <h3 className="text-xl font-bold text-[#00592D] mb-4">Comparativo de Preços (Menor Valor por Milheiro)</h3>
                 <div className="relative w-full" style={{ height: `${chartHeight + xAxisHeight}px` }}>
                    <svg id="price-chart-svg" width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + xAxisHeight}`} preserveAspectRatio="none">
                        {/* Y-Axis with 3 labels: 0, mid, max */}
                        <g className="y-axis">
                             <line x1={yAxisWidth - 5} y1={0} x2={yAxisWidth - 5} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
                             <text x={yAxisWidth - 10} y={chartHeight} fill="#6b7280" fontSize="12" textAnchor="end" dominantBaseline="hanging">R$ 0</text>
                             <text x={yAxisWidth - 10} y={chartHeight / 2} fill="#6b7280" fontSize="12" textAnchor="end" dominantBaseline="middle">{`R$ ${(maxPrice / 2).toFixed(0)}`}</text>
                             <text x={yAxisWidth - 10} y="12" fill="#6b7280" fontSize="12" textAnchor="end">{`R$ ${maxPrice.toFixed(0)}`}</text>
                        </g>

                        {/* Bars and X-Axis labels */}
                        <g className="bars-and-xaxis" transform={`translate(${yAxisWidth}, 0)`}>
                            {chartData.map((result, index) => {
                                const barHeight = (result.minPrice ?? 0) * priceScale;
                                const x = index * (barWidth + barPadding) + (barPadding / 2);
                                const y = chartHeight - barHeight;

                                const textLabel = result.factoryName.length > (barWidth / 8) 
                                    ? `${result.factoryName.substring(0, Math.floor(barWidth/8) - 1)}…` 
                                    : result.factoryName;

                                return (
                                    <g 
                                        key={result.factoryName + index} 
                                        onMouseEnter={() => setActiveBar({ result, index })} 
                                        onMouseLeave={() => setActiveBar(null)}
                                        className="cursor-pointer group"
                                    >
                                        <rect
                                            id={`bar-${index}`}
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight > 0 ? barHeight : 0}
                                            fill="#70BF44"
                                            className="transition-all duration-200 group-hover:fill-[#5a9a36]"
                                            rx="3"
                                            ry="3"
                                        />
                                        <text 
                                            x={x + barWidth / 2} 
                                            y={chartHeight + 5} 
                                            fill="#374151" 
                                            textAnchor="middle" 
                                            fontSize="11"
                                            dominantBaseline="hanging"
                                        >
                                            {textLabel}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                    {activeBar && (
                        <div
                            ref={tooltipRef}
                            className="absolute bg-gray-800 text-white p-2 rounded-md shadow-lg text-center transition-opacity duration-200 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] z-10"
                        >
                            <p className="font-bold text-sm whitespace-nowrap">{activeBar.result.factoryName}</p>
                            <p className="text-xs whitespace-nowrap">{`R$ ${activeBar.result.minPrice?.toFixed(2).replace('.', ',')}`}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SearchSummary: React.FC<{ params: BagParameters }> = ({ params }) => (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sua Busca:</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <span><strong>Tipo:</strong> {params.bagType}</span>
              <span><strong>Tamanho:</strong> {params.size} cm</span>
              <span><strong>Espessura:</strong> {params.thickness} micras</span>
              <span><strong>Cores:</strong> {params.printColors}</span>
              <span><strong>Material:</strong> {params.material}</span>
          </div>
      </div>
    );
  
    const ResultCard: React.FC<{ result: FactoryResult, index: number }> = ({ result, index }) => {
        const animationDelay = { animationDelay: `${index * 100}ms` };
        const hasSpecs = result.foundMaterial || result.foundSize || result.foundThickness || result.foundPrintColors;

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col animate-slide-in-up" style={animationDelay}>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-[#00592D] mb-1 pr-2">{result.factoryName}</h3>
                        {result.rating && <StarRatingDisplay rating={result.rating} />}
                    </div>
                    <p className="flex items-center text-gray-600 mb-4 text-sm">
                        <Icons.Location className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        {result.location}
                    </p>

                    {hasSpecs && (
                        <div className="my-3 py-3 border-t border-b border-gray-100">
                             <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Detalhes do Produto</p>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {result.foundMaterial && (
                                    <div className="flex items-center text-gray-700" title="Material">
                                        <Icons.Tag className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{result.foundMaterial}</span>
                                    </div>
                                )}
                                {result.foundSize && (
                                    <div className="flex items-center text-gray-700" title="Tamanho">
                                        <Icons.Bag className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{result.foundSize}</span>
                                    </div>
                                )}
                                {result.foundThickness && (
                                    <div className="flex items-center text-gray-700" title="Espessura">
                                        <Icons.Layers className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{result.foundThickness}{typeof result.foundThickness === 'number' ? ' micras' : ''}</span>
                                    </div>
                                )}
                                {result.foundPrintColors && (
                                    <div className="flex items-center text-gray-700" title="Cores de Impressão">
                                        <Icons.Palette className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{result.foundPrintColors}{typeof result.foundPrintColors === 'number' ? (result.foundPrintColors === 1 ? ' cor' : ' cores') : ''}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {result.keyAdvantage && (
                        <div className="mb-4 mt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                                <Icons.CheckCircle className="w-4 h-4 mr-1.5" />
                                {result.keyAdvantage}
                            </span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                            <Icons.DollarSign className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-800">Preço Estimado</p>
                                <p className="text-gray-600">{result.estimatedPriceRange || 'Sob consulta'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                            <Icons.Clock className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-800">Prazo de Entrega</p>
                                <p className="text-gray-600">{result.estimatedLeadTime || 'Sob consulta'}</p>
                            </div>
                        </div>
                    </div>

                    {result.reviewsSummary && (
                        <div className="mb-4 flex-grow">
                            <p className="font-semibold text-gray-700 mb-1 text-sm">Reputação</p>
                            <p className="text-gray-600 text-sm italic border-l-4 border-gray-200 pl-3 py-1">{result.reviewsSummary}</p>
                        </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4 mt-auto">
                        <p className="font-semibold text-gray-700 mb-2 text-sm">Contato</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
                            {result.contact?.phone && <a href={`tel:${result.contact.phone}`} className="flex items-center gap-1.5 text-gray-700 hover:text-[#00592D] transition-colors"><Icons.Phone className="w-4 h-4"/> Telefone</a>}
                            {result.contact?.email && <a href={`mailto:${result.contact.email}`} className="flex items-center gap-1.5 text-gray-700 hover:text-[#00592D] transition-colors"><Icons.Mail className="w-4 h-4"/> E-mail</a>}
                            {result.contact?.whatsapp && <a href={`https://wa.me/${result.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-700 hover:text-[#00592D] transition-colors"><Icons.WhatsApp className="w-4 h-4"/> WhatsApp</a>}
                            {result.contact?.website && <a href={result.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-700 hover:text-[#00592D] transition-colors"><Icons.Link className="w-4 h-4"/> Website</a>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
  
    const FeaturedResultCard: React.FC<{ result: FactoryResult }> = ({ result }) => {
        if (!result.contact.website) return null;

        return (
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#70BF44] p-6 md:p-8 overflow-hidden animate-fade-in mb-4">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 p-2">
                       <img src={PLASTCUSTOM_LOGO_B64} alt="Plastcustom Logo" className="h-14 w-auto" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-[#00592D]">{result.factoryName}</h3>
                            <span className="bg-green-100 text-[#00592D] text-xs font-semibold px-2.5 py-1 rounded-full">Recomendado</span>
                        </div>
                        <p className="text-base text-gray-600 max-w-xl">
                            {result.reviewsSummary}
                        </p>
                    </div>
                    <div className="flex-shrink-0 mt-4 md:mt-0">
                        <a 
                            href={result.contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-[#70BF44] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#5a9a36] transition-colors duration-300 shadow-md text-lg transform hover:scale-105"
                        >
                            Visitar Site
                            <Icons.Link className="w-5 h-5 ml-2" />
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    const GroundingSourcesDisplay: React.FC<{ sources: GroundingSource[] | null }> = ({ sources }) => {
      if (!sources || sources.length === 0) {
        return null;
      }
      
      const uniqueSources = Array.from(new Map((sources as any[]).filter(item => item?.web?.uri).map(item => [item.web.uri, item])).values());

      return (
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
          <h3 className="text-xl font-bold text-[#00592D] mb-4 flex items-center gap-2">
            <Icons.Search className="w-5 h-5" />
            Fontes da Pesquisa AI
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Estes resultados foram gerados com o auxílio de IA, utilizando informações das seguintes fontes da web:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {uniqueSources.map((source: any, index) => (
              <li key={index}>
                <a 
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors group"
                  title={source.web.uri}
                >
                  <Icons.Link className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  <span className="truncate">{source.web.title || new URL(source.web.uri).hostname}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    const LoadingResultsIndicator: React.FC = () => (
      <div className="flex justify-center items-center py-8 gap-3 animate-fade-in">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#70BF44]"></div>
          <p className="text-gray-600 font-semibold">Buscando mais fornecedores...</p>
      </div>
    );

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-[#00592D]">Resultados da Busca</h2>
        </div>
        <div className="space-y-6">
            {searchParams && <SearchSummary params={searchParams} />}
            {featuredResult && <FeaturedResultCard result={featuredResult} />}
            
            <PriceComparisonChart data={regularResults} />

            {regularResults.length > 0 && (
              <div className="flex justify-end items-center gap-4 animate-fade-in">
                <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
                <div className="flex items-center p-1 bg-gray-100 rounded-full">
                    <button 
                      onClick={() => setSortOrder('price')} 
                      disabled={regularResults.length < 2}
                      className={`px-4 py-1.5 text-sm rounded-full transition-colors font-semibold ${sortOrder === 'price' ? 'bg-white text-[#00592D] shadow' : 'bg-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                      Menor Preço
                    </button>
                    <button 
                      onClick={() => setSortOrder('leadTime')} 
                      disabled={regularResults.length < 2}
                      className={`px-4 py-1.5 text-sm rounded-full transition-colors font-semibold ${sortOrder === 'leadTime' ? 'bg-white text-[#00592D] shadow' : 'bg-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                      Menor Prazo
                    </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {sortedResults.map((result, index) => (
                    <ResultCard key={result.factoryName + index} result={result} index={index} />
                ))}
            </div>

            {isLoading && <LoadingResultsIndicator />}

            {!isLoading && sortedResults.length === 0 && (
                 <div className="text-center p-8 mt-4 animate-fade-in">
                    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border">
                        <Icons.Info className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum fornecedor encontrado</h2>
                        <p className="text-gray-600 mb-6">
                            A busca não retornou outros resultados para os critérios informados. A Plastcustom é a sua melhor opção!
                        </p>
                        <button onClick={onNewSearch} className="bg-[#70BF44] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#5a9a36] transition-colors">
                            Fazer Nova Busca
                        </button>
                    </div>
                </div>
            )}
            {!isLoading && <GroundingSourcesDisplay sources={sources} />}
        </div>
    </div>
  );
};

const SearchForm: React.FC<{
  onSearch: (params: BagParameters) => void;
  searchHistory: BagParameters[];
}> = ({ onSearch, searchHistory }) => {
  const bagTypes = ["Alça Vazada", "Alça Camiseta"];
  const sizes = ["20x30", "30x40", "40x50", "50x60", "60x80", "80x100"];
  const materials = ["Virgem AD", "Virgem BD", "Reciclado Branco/transparente ou cores definidas"];
    
  const [params, setParams] = useState<BagParameters>({
    bagType: bagTypes[0],
    size: sizes[1],
    thickness: 40,
    printColors: 2,
    material: materials[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'thickness' || name === 'printColors' ? parseInt(value, 10) : value,
    }));
  };
  
   const handleBagTypeChange = (newValue: string) => {
    setParams(prev => ({ ...prev, bagType: newValue }));
  };
  
  const handleSizeChange = (newValue: string) => {
    setParams(prev => ({ ...prev, size: newValue }));
  };

  const handleMaterialChange = (newValue: string) => {
    setParams(prev => ({ ...prev, material: newValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(params);
  };
  
  const usePreset = (preset: BagParameters) => {
    setParams(preset);
  }

  const ButtonGroupSelector: React.FC<{
    label: string;
    options: string[];
    value: string;
    onChange: (newValue: string) => void;
    gridClass?: string;
  }> = ({ label, options, value, onChange, gridClass = "grid-cols-3" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className={`grid ${gridClass} gap-2`}>
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`p-3 border rounded-lg text-center text-sm font-medium transition-all duration-200 h-full flex items-center justify-center ${
                        value === option
                        ? 'bg-[#00592D] text-white border-[#00592D] shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#00592D] hover:text-[#00592D] hover:shadow-sm'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
  );

  const FormInput: React.FC<{label: string, children: React.ReactNode}> = ({ label, children }) => (
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          {children}
      </div>
  );

  const RangeSlider: React.FC<{
      label: string;
      value: number;
      min: number;
      max: number;
      step: number;
      unit: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      name: string;
      id: string;
  }> = ({ label, value, min, max, step, unit, onChange, name, id }) => (
       <FormInput label={label}>
          <div className="flex items-center gap-4">
              <input
                  type="range"
                  id={id}
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={onChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#70BF44]"
              />
              <span className="font-semibold text-[#00592D] w-24 text-right">{value} {unit}</span>
          </div>
      </FormInput>
  );

  const BagTypeSelector: React.FC<{
      value: string;
      onChange: (newValue: string) => void;
  }> = ({ value, onChange }) => (
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Sacola</label>
          <div className="grid grid-cols-2 gap-4">
              {bagTypes.map(type => (
                  <button
                      key={type}
                      type="button"
                      onClick={() => onChange(type)}
                      className={`p-4 border rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center h-full ${
                          value === type 
                          ? 'bg-[#00592D] text-white border-[#00592D] shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
                      }`}
                  >
                      <Icons.Bag className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-semibold">{type}</span>
                  </button>
              ))}
          </div>
      </div>
  );
  
  const SearchPreset: React.FC<{
    item: BagParameters;
    onUse: () => void;
    icon: React.ReactNode;
    title: string;
  }> = ({ item, onUse, icon, title }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 text-sm text-gray-700 flex-grow cursor-pointer" onClick={onUse}>
        {icon}
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-gray-500">{item.bagType}, {item.size}, {item.thickness} micras, {item.printColors} {item.printColors > 1 ? 'cores' : 'cor'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onUse} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-[#00592D] rounded-full transition-colors" title="Usar esta busca">
            <Icons.Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <BagTypeSelector value={params.bagType} onChange={handleBagTypeChange} />
            <ButtonGroupSelector 
                label="Tamanho (cm)"
                options={sizes}
                value={params.size}
                onChange={handleSizeChange}
                gridClass="grid-cols-3 sm:grid-cols-6"
            />
            <ButtonGroupSelector
                label="Material"
                options={materials}
                value={params.material}
                onChange={handleMaterialChange}
                gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            />
            <RangeSlider
                label="Espessura"
                id="thickness"
                name="thickness"
                value={params.thickness}
                min={10} max={150} step={5}
                unit="micras"
                onChange={handleChange}
            />
            <RangeSlider
                label="Cores de Impressão"
                id="printColors"
                name="printColors"
                value={params.printColors}
                min={0} max={6} step={1}
                unit={params.printColors === 1 ? "cor" : "cores"}
                onChange={handleChange}
            />
            <div className="pt-4">
              <button type="submit" className="w-full bg-[#70BF44] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#5a9a36] transition-all duration-300 flex items-center justify-center text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <Icons.Search className="w-5 h-5 mr-2" />
                Encontrar Fábricas
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#00592D] mb-3 flex items-center gap-2"><Icons.History className="w-5 h-5 text-gray-500" />Buscas Recentes</h3>
          {searchHistory.length > 0 ? (
            <div className="space-y-2">
              {searchHistory.map((hist, index) => (
                <SearchPreset
                  key={`hist-${index}`}
                  item={hist}
                  onUse={() => usePreset(hist)}
                  icon={<Icons.History className="w-5 h-5 text-gray-400" />}
                  title={`Busca ${searchHistory.length - index}`}
                />
              ))}
            </div>
          ) : (
             <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <Icons.History className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <h4 className="font-semibold text-gray-700">Sem Buscas Recentes</h4>
                <p className="text-sm text-gray-500">Sua primeira busca aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MAIN APP COMPONENT
const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SEARCH);
  const [results, setResults] = useState<FactoryResult[]>([]);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useLocalStorage<BagParameters[]>('searchHistory', []);
  const [currentSearch, setCurrentSearch] = useState<BagParameters | null>(null);

  const handleSearch = useCallback(async (params: BagParameters) => {
    setIsLoading(true);
    setError(null);
    setSources(null);
    setCurrentSearch(params);
    setAppState(AppState.RESULTS);
    
    if (searchHistory.length === 0 || JSON.stringify(params) !== JSON.stringify(searchHistory[0])) {
      setSearchHistory(prev => [params, ...prev.slice(0, 9)]);
    }

    const plastcustomFeatured: FactoryResult = {
        factoryName: 'Plastcustom',
        location: 'Todo o Brasil',
        estimatedPriceRange: 'Consulte para preços competitivos',
        estimatedLeadTime: 'Prazos flexíveis',
        reviewsSummary: 'Soluções personalizadas com entrega em todo o Brasil.',
        contact: { website: 'https://plastcustom.com.br/' },
        isFeatured: true,
    };
    
    setResults([plastcustomFeatured]);

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok || !response.body) {
            throw new Error(`A busca falhou: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Mantém a linha parcial no buffer

            for (const line of lines) {
                if (line.trim().startsWith('__METADATA__:')) {
                    const metadataStr = line.trim().substring(13);
                    try {
                        const metadata = JSON.parse(metadataStr);
                        setSources(metadata?.groundingChunks ?? null);
                    } catch (e) {
                        console.warn("Não foi possível analisar o JSON dos metadados:", metadataStr);
                    }
                } else if (line.trim()) {
                    try {
                        const newResult = JSON.parse(line.trim());
                        if (newResult.factoryName) {
                            setResults(prev => [...prev, newResult]);
                        }
                    } catch (e) {
						console.warn("Could not parse JSON from stream line:", line);
					}
                }
            }
        }
		
		 // Handle any remaining data in the buffer
        if (buffer.trim()) {
            try {
                const newResult = JSON.parse(buffer.trim());
                 if (newResult.factoryName) {
                    setResults(prev => [...prev, newResult]);
                 }
            } catch (e) {
                // It might not be a complete JSON object, so we can ignore the error
            }
        }

    } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [searchHistory, setSearchHistory]);

  const handleNewSearch = () => {
    setResults([]);
    setSources(null);
    setCurrentSearch(null);
    setAppState(AppState.SEARCH);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.RESULTS:
        return (
          <ResultsView
            results={results}
            sources={sources}
            onNewSearch={handleNewSearch}
            searchParams={currentSearch}
            isLoading={isLoading}
          />
        );
      case AppState.SEARCH:
      default:
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-[#00592D] mb-4">Encontre Fornecedores de Sacolas</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Descreva sua necessidade e nossa IA buscará os melhores preços e prazos no mercado.
            </p>
            <SearchForm onSearch={handleSearch} searchHistory={searchHistory} />
          </div>
        );
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-slate-50">
        <Header onLogoClick={handleNewSearch} onNewSearchClick={handleNewSearch} />
        <main className="container mx-auto p-4 md:p-8">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Erro na Busca</p>
                    <p>{error}</p>
                </div>
            )}
            {renderContent()}
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200 mt-12">
            <p>&copy; {new Date().getFullYear()} Plastcustom. Potencializado por IA.</p>
        </footer>
      </div>
    </>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
