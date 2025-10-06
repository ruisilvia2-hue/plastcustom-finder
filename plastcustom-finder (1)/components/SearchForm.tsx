import React, { useState } from 'react';
import { BagParameters } from '../types';
import { Icons } from './Icons';

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

export default SearchForm;
