
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getStoredDeviceId } from '@/utils/deviceFingerprint';

export const useProductClicks = () => {
  const trackProductClick = useCallback(async (productId: number, clickType: string = 'video_view') => {
    try {
      const deviceId = getStoredDeviceId();
      
      await supabase
        .from('product_clicks')
        .insert({
          product_id: productId,
          device_id: deviceId,
          click_type: clickType
        });
      
      console.log(`Tracked ${clickType} for product ${productId}`);
    } catch (error) {
      console.error('Error tracking product click:', error);
    }
  }, []);

  const getMostClickedProducts = useCallback(async (limit: number = 12) => {
    try {
      const { data, error } = await supabase.rpc('get_most_clicked_products_with_videos', {
        limit_count: limit
      });
      
      if (error) {
        console.error('Error fetching most clicked products:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getMostClickedProducts:', error);
      return [];
    }
  }, []);

  return {
    trackProductClick,
    getMostClickedProducts
  };
};
