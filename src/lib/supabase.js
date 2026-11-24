import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Singleton Supabase Client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Storage Helper: Resolve product image URL
 * If path is an absolute URL (http/https), return as-is.
 * If Supabase is connected and the image is in storage, returns the public Supabase Storage CDN URL.
 * Otherwise returns the local static asset path.
 *
 * @param {string} imagePath - Relative path, filename, or full URL
 * @param {string} bucket - Supabase storage bucket name (default: 'product-images')
 * @returns {string} Fully resolved image URL
 */
export const resolveProductImageUrl = (imagePath, bucket = 'product-images') => {
  if (!imagePath) return '/brand/purgatory-logo-raw.png';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If Supabase is configured and image is a storage object name
  if (isSupabaseConfigured && supabase && !imagePath.startsWith('/')) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(imagePath);
    return data?.publicUrl || imagePath;
  }

  return imagePath;
};

/**
 * Storage Helper: Upload product image to Supabase Storage bucket
 *
 * @param {File} file - Browser File or Blob
 * @param {string} path - Target path in bucket (e.g. 'walk-with-god-front.jpg')
 * @param {string} bucket - Supabase storage bucket name
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export const uploadProductImage = async (file, path, bucket = 'product-images') => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const cleanPath = path.replace(/^\/+/, '');
  const { data, error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
    cacheControl: '3600',
    upsert: true
  });

  if (error) throw error;

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return {
    path: data.path,
    publicUrl: publicData.publicUrl
  };
};
