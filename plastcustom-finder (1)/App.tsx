import React, { useState, useCallback, useEffect } from 'react';
import { BagParameters, FactoryResult, GroundingSource, AppState } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultsView from './components/ResultsView';

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

export default App;
