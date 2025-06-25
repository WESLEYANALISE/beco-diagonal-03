
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from '@/components/Header';
import { LazyImage } from '@/components/LazyImage';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from "@/integrations/supabase/client";
import { useSequentialMagicalSounds } from '@/hooks/useSequentialMagicalSounds';

interface SubcategoryInfo {
  subcategoria: string;
  count: number;
  sampleImage: string;
  sampleProduct: string;
}

const SubcategoriaDetalhes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoria = searchParams.get('categoria') || '';
  
  const [subcategories, setSubcategories] = useState<SubcategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { playNextSequentialSound } = useSequentialMagicalSounds();
  
  const {
    showSuccess,
    showError
  } = useToastNotifications();

  useEffect(() => {
    fetchSubcategories();
  }, [categoria]);

  const fetchSubcategories = async () => {
    try {
      console.log('🔍 Buscando subcategorias para categoria:', categoria);
      
      const { data, error } = await supabase
        .from('HARRY POTTER')
        .select('subcategoria, imagem1, produto')
        .eq('categoria', categoria);

      if (error) {
        console.error('❌ Erro na consulta:', error);
        throw error;
      }

      console.log('📊 Dados brutos do banco:', data);
      console.log('📊 Total de registros:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('❌ Nenhum produto encontrado para a categoria:', categoria);
        navigate(`/categoria-lista?categoria=${encodeURIComponent(categoria)}&tipo=categoria`);
        return;
      }

      // Agrupar por subcategoria e contar produtos
      const subcategoryMap = new Map<string, { count: number; image: string; product: string }>();
      
      data.forEach((item, index) => {
        console.log(`📝 Processando item ${index + 1}:`, {
          produto: item.produto,
          subcategoria: item.subcategoria,
          imagem: item.imagem1 ? 'presente' : 'ausente'
        });
        
        const subcat = item.subcategoria?.trim();
        
        // Aceitar qualquer subcategoria que não seja null, undefined ou string vazia
        if (subcat && subcat !== '' && subcat !== 'null' && subcat !== 'undefined' && subcat.toLowerCase() !== 'null') {
          if (subcategoryMap.has(subcat)) {
            const existing = subcategoryMap.get(subcat)!;
            existing.count += 1;
            console.log(`➕ Incrementando contador para "${subcat}": ${existing.count}`);
          } else {
            subcategoryMap.set(subcat, {
              count: 1,
              image: item.imagem1 || '',
              product: item.produto || ''
            });
            console.log(`🆕 Nova subcategoria encontrada: "${subcat}"`);
          }
        } else {
          console.log(`⚠️ Subcategoria inválida ignorada:`, subcat);
        }
      });

      console.log('📈 Mapa final de subcategorias:', Array.from(subcategoryMap.entries()));
      console.log('📊 Total de subcategorias únicas:', subcategoryMap.size);

      // Se não há subcategorias válidas, redirecionar para produtos
      if (subcategoryMap.size === 0) {
        console.log('❌ Nenhuma subcategoria válida encontrada, redirecionando para produtos');
        navigate(`/categoria-lista?categoria=${encodeURIComponent(categoria)}&tipo=categoria`);
        return;
      }

      const subcategoryList = Array.from(subcategoryMap.entries()).map(([subcategoria, data]) => ({
        subcategoria,
        count: data.count,
        sampleImage: data.image,
        sampleProduct: data.product
      }));

      console.log('✅ Lista final de subcategorias:', subcategoryList);
      setSubcategories(subcategoryList);
      showSuccess(`${subcategoryList.length} subcategorias mágicas encontradas!`);
    } catch (error) {
      console.error('❌ Erro ao buscar subcategorias:', error);
      showError("Erro ao carregar subcategorias mágicas");
      // Redirecionar para produtos se há erro
      navigate(`/categoria-lista?categoria=${encodeURIComponent(categoria)}&tipo=categoria`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoria: string) => {
    console.log('🔍 Navegando para subcategoria:', subcategoria);
    playNextSequentialSound();
    navigate(`/categoria-lista?categoria=${encodeURIComponent(categoria)}&subcategoria=${encodeURIComponent(subcategoria)}&tipo=subcategoria`);
  };

  const getMagicalCategoryName = (category: string) => {
    const nameMap: Record<string, string> = {
      'Itens Colecionáveis': 'Artefatos Colecionáveis Mágicos',
      'Bonecas e Brinquedos de Pelúcia': 'Criaturas Mágicas Encantadas',
      'Luminária': 'Iluminação Mística de Hogwarts',
      'Colares': 'Joias e Amuletos Encantados',
      'Moletons e Suéteres': 'Vestes das Casas de Hogwarts',
      'Capinhas': 'Proteções Místicas Portáteis',
      'Canecas': 'Cálices e Poções Mágicas',
      'Livros': 'Grimórios e Tomos Mágicos'
    };
    return nameMap[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magical-midnight via-magical-deepPurple to-magical-mysticalPurple">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-magical-gold/20 rounded-2xl backdrop-blur-sm border border-magical-gold/30 animate-magical-glow"></div>
            <div className="flex gap-4 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-80 h-48 bg-magical-gold/20 rounded-2xl backdrop-blur-sm border border-magical-gold/30 animate-magical-glow flex-shrink-0"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-magical-midnight via-magical-deepPurple to-magical-mysticalPurple pb-20">
      <Header />
      
      {/* Header da página */}
      <div className="bg-gradient-to-r from-magical-deepPurple/90 via-magical-mysticalPurple/90 to-magical-deepPurple/90 backdrop-blur-md border-b border-magical-gold/30 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/categorias')} 
              className="text-magical-gold hover:text-magical-darkGold hover:bg-magical-gold/20 p-1 sm:p-2 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-magical-starlight truncate font-magical">
                {getMagicalCategoryName(categoria)}
              </h1>
              <p className="text-xs sm:text-sm text-magical-starlight/80 truncate font-enchanted">
                {subcategories.length > 0 ? 'Escolha sua especialização mágica' : 'Carregando especialização...'}
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-magical-gold animate-sparkle" />
          </div>
        </div>
      </div>

      {/* Subcategorias em linha horizontal */}
      <section className="px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {subcategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-magical-gold/30 to-magical-bronze/30 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-levitate shadow-2xl backdrop-blur-sm border border-magical-gold/40">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-magical-gold" />
                <Sparkles className="w-4 h-4 text-magical-gold absolute top-2 right-2 animate-sparkle" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-magical-starlight mb-4 font-magical">
                Redirecionando para Artefatos Mágicos...
              </h2>
              <p className="text-magical-starlight/80 font-enchanted">
                Esta categoria não possui subcategorias. Você será redirecionado para ver todos os artefatos.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-magical-starlight mb-3 font-magical">
                  ✨ Escolha sua Especialização Mágica
                </h2>
                <p className="text-magical-starlight/80 font-enchanted">
                  Encontramos {subcategories.length} especialização{subcategories.length !== 1 ? 'ões' : ''} mágica{subcategories.length !== 1 ? 's' : ''} em {categoria}
                </p>
              </div>
              
              {/* Scroll horizontal das subcategorias */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {subcategories.map((subcategory, index) => (
                    <Card 
                      key={subcategory.subcategoria} 
                      className="w-80 flex-shrink-0 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-magical-deepPurple/80 to-magical-mysticalPurple/60 border border-magical-gold/30 shadow-lg group cursor-pointer backdrop-blur-sm hover:shadow-magical-gold/20 hover:animate-magical-glow"
                      onClick={() => handleSubcategoryClick(subcategory.subcategoria)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <LazyImage 
                          src={subcategory.sampleImage} 
                          alt={subcategory.subcategoria} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-magical-midnight/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-magical-starlight">
                          <h3 className="text-lg font-bold mb-1 line-clamp-2 font-magical">
                            {subcategory.subcategoria}
                          </h3>
                          <p className="text-sm text-magical-starlight/80 font-enchanted">
                            {subcategory.count} artefato{subcategory.count !== 1 ? 's' : ''} mágico{subcategory.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-magical-gold animate-sparkle" />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <Star className="w-3 h-3 text-magical-gold fill-current" />
                          <span className="text-xs text-magical-starlight font-bold">4.8</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-magical-mysticalPurple to-magical-deepPurple hover:from-magical-deepPurple hover:to-magical-mysticalPurple text-magical-starlight font-semibold transition-all duration-300 hover:scale-105 border-0 shadow-lg hover:shadow-xl font-enchanted animate-magical-glow"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryClick(subcategory.subcategoria);
                          }}
                        >
                          Explorar Coleção
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SubcategoriaDetalhes;
