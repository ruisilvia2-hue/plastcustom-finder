import React, { useState, useMemo, useEffect } from 'react';
import { FactoryResult, GroundingSource, BagParameters } from '../types';
import { Icons } from './Icons';
import { PLASTCUSTOM_LOGO_B64 } from '../assets';

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

export default ResultsView;
