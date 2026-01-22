import { createClient } from '@supabase/supabase-js';

// KONFIGURASI SUPABASE
// Ganti nilai di bawah ini dengan URL dan Anon Key dari Project Settings > API di Supabase Anda
const SUPABASE_URL = 'https://gljcfyyiqbriuappruox.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsamNmeXlpcWJyaXVhcHBydW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjI5MTgsImV4cCI6MjA4NDIzODkxOH0.GSZUaVlce4iFJJb9ShGnLfDxFz3bWFC0aSJzeTSth0s'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- AUTHENTICATION ---

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// --- STORAGE ---

export const uploadAsset = async (file: File): Promise<string> => {
  try {
    const user = await getUser();
    if (!user) throw new Error("Authentication required for upload");

    // 1. Generate unique filename
    const fileExt = file.name.split('.').pop();
    // Use user ID in path for organization (optional but good practice)
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // 2. Upload to 'kie-assets' bucket
    const { error: uploadError } = await supabase.storage
      .from('kie-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 3. Get Public URL
    const { data } = supabase.storage
      .from('kie-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error: any) {
    throw new Error(`Storage Upload Failed: ${error.message}`);
  }
};