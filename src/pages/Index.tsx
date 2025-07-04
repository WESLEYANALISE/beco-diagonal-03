import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, SortAsc, DollarSign, Sparkles, Home, Gamepad2, Shirt, Smartphone, Wand2, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from '@/components/Header';
import { SearchPreview } from '@/components/SearchPreview';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { ProductSelector } from '@/components/ProductSelector';
import { AIAnalysisModal } from '@/components/AIAnalysisModal';
import { HeroSection } from '@/components/HeroSection';
import { TabNavigation } from '@/components/TabNavigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductGrid } from '@/components/ProductGrid';
import { VideoCarouselHome } from '@/components/VideoCarouselHome';
import { MagicalParticles } from '@/components/MagicalParticles';
import { useProductClicks } from '@/hooks/useProductClicks';
import { useAdvancedBackgroundMusic } from '@/hooks/useAdvancedBackgroundMusic';
import { supabase } from "@/integrations/supabase/client";

// Lazy load heavy components
const ProductPhotosModal = lazy(() => import('@/components/ProductPhotosModal').then(module => ({ default: module.ProductPhotosModal })));

interface Product {
  id: number;
  produto: string;
  valor: string;
  video: string;
  imagem1: string;
  imagem2: string;
  imagem3: string;
  imagem4: string;
  imagem5: string;
  imagem6?: string;
  imagem7?: string;
  link: string;
  categoria: string;
  subcategoria?: string;
  uso?: string;
  descricao?: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize advanced background music system
  const { 
    isPlaying, 
    currentTrack, 
    context, 
    volume, 
    startMusic, 
    changeContext,
    changeVolume 
  } = useAdvancedBackgroundMusic();
  
  const categoryFromUrl = searchParams.get('categoria');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentFeaturedCategory, setCurrentFeaturedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'todas');
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'preco'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showingAI, setShowingAI] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [priceFilter, setPriceFilter] = useState<{
    min: number;
    max: number;
  }>({
    min: 0,
    max: 1000
  });

  // Optimize shuffle function with memoization
  const shuffleArray = useCallback(<T,>(array: T[], shouldShuffle: boolean = true): T[] => {
    if (!Array.isArray(array) || !shouldShuffle) return array;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Parse price from string to number - memoized
  const parsePrice = useCallback((priceString: string): number => {
    if (!priceString || typeof priceString !== 'string') return 0;
    const cleanPrice = priceString.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  }, []);

  // Optimize data fetching with better caching
  const fetchProducts = useCallback(async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('HARRY POTTER')
        .select('id, produto, valor, video, imagem1, imagem2, imagem3, imagem4, imagem5, imagem6, imagem7, link, categoria, subcategoria, descricao, uso')
        .order('id');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No data received from Supabase');
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }

      // Filter out null/undefined products and ensure required fields exist
      const validProducts = data.filter(product => 
        product && 
        product.produto && 
        product.valor && 
        product.categoria &&
        typeof product.produto === 'string' &&
        typeof product.valor === 'string' &&
        typeof product.categoria === 'string'
      );

      const processedProducts = shuffleArray(validProducts, true);
      setProducts(processedProducts);
      setFilteredProducts(processedProducts);

      const initialFeatured = shuffleArray(processedProducts, true).slice(0, 6);
      setFeaturedProducts(initialFeatured);
      
      // Get all unique categories from HARRY POTTER table
      const uniqueCategories = [...new Set(validProducts
        .map(product => product.categoria)
        .filter(cat => cat && typeof cat === 'string' && cat.trim() !== '')
      )];
      
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0) {
        setCurrentFeaturedCategory(uniqueCategories[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar artefatos mágicos:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shuffleArray]);

  // Memoize expensive operations
  const applyPriceFilter = useCallback(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }
    
    const filtered = products.filter(product => {
      if (!product || !product.valor) return false;
      const price = parsePrice(product.valor);
      return price >= priceFilter.min && price <= priceFilter.max;
    });
    setFilteredProducts(filtered);
  }, [products, priceFilter, parsePrice]);

  const filterProducts = useCallback(() => {
    if (!Array.isArray(filteredProducts)) {
      setDisplayedProducts([]);
      return;
    }

    let filtered = [...filteredProducts];
    
    if (selectedCategory && selectedCategory !== 'todas') {
      filtered = filtered.filter(product => 
        product && product.categoria === selectedCategory
      );
    }
    
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product && 
        product.produto && 
        typeof product.produto === 'string' &&
        product.produto.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      if (sortBy === 'nome') {
        const nameA = a.produto || '';
        const nameB = b.produto || '';
        const comparison = nameA.localeCompare(nameB);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const priceA = parsePrice(a.valor || '');
        const priceB = parsePrice(b.valor || '');
        const comparison = priceA - priceB;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });
    
    setDisplayedProducts(filtered);
  }, [filteredProducts, selectedCategory, searchTerm, sortBy, sortOrder, parsePrice]);

  // Optimize effects with proper dependencies
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  useEffect(() => {
    applyPriceFilter();
  }, [applyPriceFilter]);

  // Auto-rotate featured products by category every 20 seconds - optimized
  useEffect(() => {
    if (categories.length > 0 && products.length > 0 && !categoryFromUrl) {
      const interval = setInterval(() => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        setCurrentFeaturedCategory(randomCategory);
        const categoryProducts = products.filter(p => p.categoria === randomCategory);
        const shuffledProducts = shuffleArray(categoryProducts, true);
        setFeaturedProducts(shuffledProducts.slice(0, 6));
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [categories, products, categoryFromUrl, shuffleArray]);

  // Debounced search function for better performance
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term || '');
  }, []);

  const handlePriceFilter = useCallback((min: number, max: number) => {
    setPriceFilter({
      min: min || 0,
      max: max || 1000
    });
  }, []);

  const {
    trackProductClick
  } = useProductClicks();

  const handleProductClick = useCallback(async (productId: number) => {
    if (!productId) return;
    
    try {
      // Track click asynchronously without blocking UI
      trackProductClick(productId, 'product_view').catch(console.error);
      
      const productElement = document.getElementById(`product-${productId}`);
      if (productElement) {
        productElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error handling product click:', error);
    }
  }, [trackProductClick]);

  const handleTabChange = useCallback((tab: 'featured' | 'ai') => {
    setShowingAI(tab === 'ai');
  }, []);

  const handleProductToggle = useCallback((product: Product) => {
    if (!product) return;
    
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, product];
      }
    });
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedProducts.length > 0) {
      setShowAnalysisModal(true);
    }
  }, [selectedProducts.length]);

  const analyzeProducts = async (products: Product[]): Promise<string> => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-products', {
        body: {
          products,
          userPreferences: questionnaireAnswers
        }
      });
      if (error) {
        console.error('Error calling analyze-products function:', error);
        throw new Error(error.message || 'Erro ao analisar produtos');
      }
      return data?.analysis || 'Análise não disponível';
    } catch (error) {
      console.error('Error in analyzeProducts:', error);
      throw error;
    }
  };

  const getCategoryIcon = useCallback((category: string) => {
    if (!category) return ShoppingCart;
    
    const iconMap: Record<string, React.ComponentType<any>> = {
      'Itens Colecionáveis': Crown,
      'Bonecas e Brinquedos de Pelúcia': Sparkles,
      'Luminária': Wand2,
      'Colares': Crown,
      'Moletons e Suéteres': Shirt,
      'Capinhas': Smartphone,
      'Canecas': ShoppingCart
    };
    return iconMap[category] || ShoppingCart;
  }, []);

  const getCategoryProducts = useCallback((category: string, limit: number = 8) => {
    if (!category || !Array.isArray(filteredProducts)) return [];
    
    const categoryProducts = filteredProducts.filter(p => 
      p && p.categoria === category
    );
    return shuffleArray(categoryProducts, false).slice(0, limit);
  }, [filteredProducts, shuffleArray]);

  // Memoize products with videos for better performance
  const productsWithVideos = useMemo(() => {
    if (!Array.isArray(filteredProducts)) return [];
    
    const withVideos = filteredProducts.filter(product => 
      product && 
      product.video && 
      typeof product.video === 'string' &&
      product.video.trim() !== ''
    );
    return shuffleArray(withVideos, false).slice(0, 8);
  }, [filteredProducts, shuffleArray]);

  const handleExplorarColecaoClick = useCallback(async (category: string) => {
    // Change music context to "explorar-categoria"
    changeContext('explorar-categoria');
    
    // Check if category has subcategories
    try {
      const { data } = await supabase
        .from('HARRY POTTER')
        .select('subcategoria')
        .eq('categoria', category)
        .not('subcategoria', 'is', null)
        .not('subcategoria', 'eq', '');

      if (data && data.length > 0) {
        // Has subcategories, show them
        navigate(`/categoria/${encodeURIComponent(category)}`);
      } else {
        // No subcategories, go to category list
        navigate(`/categoria-lista?categoria=${encodeURIComponent(category)}&tipo=categoria`);
      }
    } catch (error) {
      console.error('Error checking subcategories:', error);
      navigate(`/categoria-lista?categoria=${encodeURIComponent(category)}&tipo=categoria`);
    }
  }, [navigate, changeContext]);

  // Memoize heavy components to prevent unnecessary re-renders
  const memoizedCategoryCarousel = useMemo(() => (
    Array.isArray(filteredProducts) && filteredProducts.length > 0 && (
      <CategoryCarousel products={filteredProducts} onProductClick={handleProductClick} />
    )
  ), [filteredProducts, handleProductClick]);

  const memoizedVideoCarousel = useMemo(() => (
    !showingAI && productsWithVideos.length > 0 && <VideoCarouselHome products={productsWithVideos} />
  ), [showingAI, productsWithVideos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magical-midnight via-magical-deepPurple to-magical-mysticalPurple pb-20 relative">
        <MagicalParticles />
        <Header onSearch={handleSearch} onPriceFilter={handlePriceFilter} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-magical-gold/20 rounded-2xl animate-shimmer backdrop-blur-sm border border-magical-gold/30"></div>
            <ProductGrid loading={true} products={[]} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-magical-midnight via-magical-deepPurple to-magical-mysticalPurple pb-20 relative overflow-hidden">
      {/* Magical background particles */}
      <MagicalParticles />

      {/* Enhanced magical background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-3 h-3 bg-magical-gold rounded-full animate-magical-glow opacity-60"></div>
        <div className="absolute top-32 right-20 w-4 h-4 bg-magical-bronze rounded-full animate-sparkle opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-64 left-1/4 w-2 h-2 bg-magical-silver rounded-full animate-levitate opacity-70" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-96 right-1/3 w-5 h-5 bg-magical-gold rounded-full animate-magical-glow opacity-30" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-64 left-20 w-3 h-3 bg-magical-bronze rounded-full animate-sparkle opacity-50" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-32 right-10 w-2 h-2 bg-magical-silver rounded-full animate-levitate opacity-80" style={{animationDelay: '5s'}}></div>
      </div>
      
      <Header onSearch={handleSearch} onPriceFilter={handlePriceFilter} />
      
      {/* Search Preview */}
      {searchTerm && Array.isArray(filteredProducts) && (
        <SearchPreview 
          searchTerm={searchTerm} 
          products={filteredProducts
            .filter(p => p && p.produto && p.produto.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5)
          } 
          onProductClick={handleProductClick} 
        />
      )}

      {/* Novidades Carousel - Memoized */}
      {memoizedCategoryCarousel}
      
      {/* Category Quick Access Buttons - SHOWING ALL CATEGORIES from HARRY POTTER table */}
      <section className="px-4 py-2 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleExplorarColecaoClick('todas')} 
              className="whitespace-nowrap transition-all duration-300 hover:scale-105 bg-magical-gold/30 text-magical-starlight border-magical-gold/50 hover:bg-magical-gold/40 flex items-center gap-2 font-enchanted shadow-lg hover:shadow-magical-gold/20"
            >
              <Wand2 className="w-4 h-4" />
              Todos os Artefatos Mágicos
            </Button>
            {/* Show ALL categories from the HARRY POTTER table */}
            {Array.isArray(categories) && categories.map(category => {
              if (!category) return null;
              const IconComponent = getCategoryIcon(category);
              return (
                <Button 
                  key={category} 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleExplorarColecaoClick(category)} 
                  className="whitespace-nowrap transition-all duration-300 hover:scale-105 bg-magical-gold/20 text-magical-starlight border-magical-gold/40 hover:bg-magical-gold/30 flex items-center gap-2 font-enchanted shadow-md hover:shadow-magical-gold/20"
                >
                  <IconComponent className="w-4 h-4" />
                  {category}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <HeroSection productsCount={filteredProducts.length} />

      {/* Video Carousel - Strategic placement after hero - Memoized */}
      {memoizedVideoCarousel}

      {/* Category Product Carousels - show ALL categories when not in AI mode - Optimized */}
      {!showingAI && Array.isArray(categories) && categories.map((category, index) => {
        if (!category) return null;
        
        const categoryProducts = getCategoryProducts(category);
        const IconComponent = getCategoryIcon(category);
        
        if (categoryProducts.length === 0) return null;
        return (
          <section 
            key={category} 
            style={{animationDelay: `${index * 0.1}s`}} 
            className="md:px-6 py-4 animate-fade-in px-[6px]"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-magical-gold/40 to-magical-bronze/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-magical-gold/30 shadow-lg animate-magical-glow">
                    <IconComponent className="w-4 h-4 text-magical-gold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-magical-starlight font-magical">{category}</h3>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleExplorarColecaoClick(category)} 
                  className="bg-magical-gold/30 text-magical-starlight border-magical-gold/40 hover:bg-magical-gold/40 text-xs px-3 py-1 h-auto font-enchanted shadow-md hover:shadow-magical-gold/20 transition-all duration-300 hover:scale-105"
                >
                  Explorar Coleção
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-3">
                  {categoryProducts.map(product => (
                    <CarouselItem key={product.id} className="pl-2 md:pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                      <ProductCard product={product} compact={true} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4 bg-magical-starlight/90 hover:bg-magical-starlight border-magical-gold/30 w-6 h-6 shadow-lg" />
                <CarouselNext className="right-2 md:right-4 bg-magical-starlight/90 hover:bg-magical-starlight border-magical-gold/30 w-6 h-6 shadow-lg" />
              </Carousel>
            </div>
          </section>
        );
      })}

      {/* Enhanced Featured Products Carousel with Toggle */}
      <section className="px-4 md:px-6 py-8 md:py-12 bg-gradient-to-r from-magical-mysticalPurple/30 via-magical-deepPurple/30 to-magical-mysticalPurple/30 backdrop-blur-sm animate-fade-in border-y border-magical-gold/40 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-magical-deepPurple/30 via-magical-mysticalPurple/30 to-magical-darkBlue/30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <TabNavigation showingAI={showingAI} onTabChange={handleTabChange} />
            
            {showingAI ? (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl md:text-3xl font-bold text-magical-starlight mb-3 animate-slide-in-left font-magical">
                  🔮 Oráculo das Relíquias
                </h2>
                <div className="text-base text-magical-starlight/90 animate-slide-in-right space-y-2 font-enchanted">
                  <p><strong>Selecione até 5 artefatos mágicos</strong> e nosso <strong>Oráculo</strong> revelará qual possui o poder mais adequado para você</p>
                  <p className="text-sm">✨ <em>Consulta baseada na magia ancestral de Hogwarts</em></p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-magical-starlight mb-3 animate-slide-in-left font-magical">
                  ⚡ Relíquias Lendárias de Hogwarts
                </h2>
                <p className="text-base text-magical-starlight/80 animate-slide-in-right font-enchanted">
                  {currentFeaturedCategory ? `Os tesouros mais procurados em ${currentFeaturedCategory}` : 'Os artefatos favoritos dos bruxos mais poderosos'}
                </p>
              </div>
            )}
          </div>

          {showingAI ? (
            <>
              <div className="max-w-md mx-auto mb-6 animate-scale-in">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-magical-starlight/90 border-magical-gold/40 text-magical-midnight font-enchanted shadow-lg">
                    <SelectValue placeholder="Selecione uma Casa de Hogwarts" />
                  </SelectTrigger>
                  <SelectContent className="bg-magical-starlight border-magical-gold/30 z-50">
                    <SelectItem value="todas">Todas as Casas</SelectItem>
                    {Array.isArray(categories) && categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <ProductSelector 
                products={Array.isArray(displayedProducts) ? displayedProducts.slice(0, 20) : []} 
                selectedProducts={selectedProducts} 
                onProductToggle={handleProductToggle} 
                onAnalyze={handleAnalyze} 
                onQuestionnaireChange={setQuestionnaireAnswers} 
              />
            </>
          ) : (
            <>
              <Carousel className="w-full animate-scale-in mb-6">
                <CarouselContent className="-ml-2 md:-ml-3">
                  {Array.isArray(featuredProducts) && featuredProducts.map((product, index) => (
                    <CarouselItem key={product.id} className="pl-2 md:pl-3 basis-3/4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <ProductCard product={product} showBadge={true} badgeText="RELÍQUIA" compact={false} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4 bg-magical-starlight/90 hover:bg-magical-starlight border-magical-gold/30 shadow-xl" />
                <CarouselNext className="right-2 md:right-4 bg-magical-starlight/90 hover:bg-magical-starlight border-magical-gold/30 shadow-xl" />
              </Carousel>
              
              <div className="text-center animate-fade-in">
                <Button 
                  onClick={() => handleExplorarColecaoClick('mais-vendidos')} 
                  className="bg-gradient-to-r from-magical-gold to-magical-bronze text-magical-midnight hover:from-magical-darkGold hover:to-magical-bronze font-semibold transition-all duration-300 hover:scale-105 font-enchanted shadow-2xl hover:shadow-magical-gold/30"
                >
                  Explorar Mais Relíquias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Category Filter and Products Grid - only show when not in AI mode */}
      {!showingAI && (
        <section className="px-4 md:px-6 py-8 md:py-12 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-magical-starlight mb-3 animate-slide-in-left font-magical">
                  🏰 Explorar Relíquias Mágicas
                </h2>
                <p className="text-base text-magical-starlight/80 mb-4 animate-slide-in-right font-enchanted">
                  {searchTerm ? `Artefatos encontrados para "${searchTerm}"` : 'Navegue por nossa coleção completa de relíquias ancestrais'}
                </p>
              </div>
              
              <div className="flex gap-2 animate-slide-in-right">
                <Select value={sortBy} onValueChange={(value: 'nome' | 'preco') => setSortBy(value)}>
                  <SelectTrigger className="bg-magical-starlight text-magical-midnight border-0 w-32 font-enchanted shadow-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-magical-starlight border-magical-gold/30 z-50">
                    <SelectItem value="nome">
                      <div className="flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Nome
                      </div>
                    </SelectItem>
                    <SelectItem value="preco">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                  className="bg-magical-starlight text-magical-midnight border-0 hover:bg-magical-silver/20 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            <div className="max-w-md mx-auto mb-6 animate-scale-in">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-magical-starlight/90 border-magical-gold/40 text-magical-midnight font-enchanted shadow-lg">
                  <SelectValue placeholder="Selecione uma Casa de Hogwarts" />
                </SelectTrigger>
                <SelectContent className="bg-magical-starlight border-magical-gold/30 z-50">
                  <SelectItem value="todas">Todas as Casas</SelectItem>
                  {Array.isArray(categories) && categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ProductGrid products={Array.isArray(displayedProducts) ? displayedProducts.slice(0, 20) : []} compact={true} />

            {(!Array.isArray(displayedProducts) || displayedProducts.length === 0) && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-32 h-32 bg-gradient-to-br from-magical-gold/20 to-magical-bronze/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-levitate border border-magical-gold/30 shadow-2xl">
                  <Wand2 className="w-16 h-16 text-magical-gold/50" />
                </div>
                <h2 className="text-2xl font-bold text-magical-starlight mb-4 font-magical">
                  Nenhuma relíquia encontrada
                </h2>
                <p className="text-magical-starlight/80 mb-6 font-enchanted">
                  {searchTerm ? `Não encontramos relíquias para "${searchTerm}"` : 'Não há relíquias nesta Casa de Hogwarts'}
                </p>
                {searchTerm && (
                  <Button 
                    onClick={() => setSearchTerm('')} 
                    className="bg-gradient-to-r from-magical-gold to-magical-bronze text-magical-midnight hover:from-magical-darkGold hover:to-magical-bronze font-semibold transition-all duration-300 hover:scale-105 font-enchanted shadow-xl"
                  >
                    Ver Todas as Relíquias
                  </Button>
                )}
              </div>
            )}

            {Array.isArray(displayedProducts) && displayedProducts.length > 20 && (
              <div className="text-center mt-8 animate-fade-in">
                <Button 
                  onClick={() => navigate(`/categoria-lista?categoria=${selectedCategory}&tipo=categoria`)} 
                  className="bg-gradient-to-r from-magical-gold to-magical-bronze text-magical-midnight hover:from-magical-darkGold hover:to-magical-bronze font-semibold transition-all duration-300 hover:scale-105 font-enchanted shadow-xl hover:shadow-magical-gold/30"
                >
                  Ver Todas as {displayedProducts.length} Relíquias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section - only show when not in AI mode */}
      {!showingAI && (
        <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-r from-magical-deepPurple via-magical-mysticalPurple to-magical-darkBlue relative overflow-hidden animate-fade-in border-t border-magical-gold/30 shadow-2xl">
          <div className="absolute inset-0 bg-magical-midnight/20"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-magical-gold/40 to-magical-bronze/40 rounded-3xl flex items-center justify-center mx-auto animate-levitate border border-magical-gold/30 backdrop-blur-sm shadow-2xl">
                <Wand2 className="w-8 h-8 md:w-10 md:h-10 text-magical-gold animate-magical-glow" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-magical-starlight animate-slide-in-left font-magical">
                ⚡ Não Perca Nenhuma Magia!
              </h2>
              <p className="text-magical-starlight/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-slide-in-right font-enchanted">
                Descubra as relíquias mais poderosas de Hogwarts com preços encantados
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-magical-gold to-magical-bronze text-magical-midnight hover:from-magical-darkGold hover:to-magical-bronze py-4 px-8 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-enchanted" 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              >
                Explorar Relíquias Mágicas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* AI Analysis Modal - Lazy loaded */}
      <Suspense fallback={<div>Carregando...</div>}>
        <AIAnalysisModal 
          isOpen={showAnalysisModal} 
          onClose={() => setShowAnalysisModal(false)} 
          selectedProducts={selectedProducts} 
          onAnalyze={analyzeProducts} 
        />
      </Suspense>
    </div>
  );
};

export default Index;
