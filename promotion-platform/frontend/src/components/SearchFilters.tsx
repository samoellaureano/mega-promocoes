'use client';

import { ChevronDown, X } from 'lucide-react';

interface Category {
  category: string;
  _count: { id: number };
}

interface Store {
  store: string;
  _count: { id: number };
}

interface SearchFiltersProps {
  categories: Category[];
  stores: Store[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  minDiscount: string;
  setMinDiscount: (discount: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function SearchFilters({
  categories,
  stores,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  minDiscount,
  setMinDiscount,
  sortBy,
  setSortBy
}: SearchFiltersProps) {
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedStore('');
    setMinDiscount('');
    setSortBy('relevanceScore');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedStore || minDiscount;

  return (
    <div className="bg-white border-b border-gray-200 py-4 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Categoria */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat._count.id})
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Loja */}
          <div className="relative">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="">Todas as lojas</option>
              {stores.map((store) => (
                <option key={store.store} value={store.store}>
                  {store.store} ({store._count.id})
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Desconto mínimo */}
          <div className="relative">
            <select
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">Qualquer desconto</option>
              <option value="20">Acima de 20%</option>
              <option value="30">Acima de 30%</option>
              <option value="50">Acima de 50%</option>
              <option value="70">Acima de 70%</option>
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Ordenação */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="relevanceScore">Mais relevantes</option>
              <option value="discountPercent">Maior desconto</option>
              <option value="createdAt">Mais recentes</option>
              <option value="promoPrice">Menor preço</option>
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">Filtros ativos:</span>
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-2 hover:text-primary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {selectedStore && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-800">
                {selectedStore}
                <button
                  onClick={() => setSelectedStore('')}
                  className="ml-2 hover:text-success-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {minDiscount && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning-100 text-warning-800">
                +{minDiscount}% desconto
                <button
                  onClick={() => setMinDiscount('')}
                  className="ml-2 hover:text-warning-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}