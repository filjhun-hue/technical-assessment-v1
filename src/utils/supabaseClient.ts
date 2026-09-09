import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateAssessmentReport } from '../types/assessment';

const SUPABASE_CONFIG_KEY = 'tech_assessment_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseCredentials(): SupabaseConfig {
  // Check localStorage first
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to Vite environment variables
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  };
}

export function setSupabaseCredentials(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  _supabaseInstance = null; // reset client instance
}

let _supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseInstance) return _supabaseInstance;

  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    return null;
  }

  try {
    _supabaseInstance = createClient(creds.url, creds.anonKey);
    return _supabaseInstance;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, anonKey);
    const { data, error } = await testClient.from('candidate_assessments').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, but connection succeeded
      if (error.code === '42P01') {
        return { success: false, message: 'Connected to Supabase, but "candidate_assessments" table is missing. Run the schema SQL script.' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Connection failed.' };
  }
}

// Save an assessment report to Supabase
export async function saveAssessmentToSupabase(report: CandidateAssessmentReport): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: report.candidate.id,
      full_name: report.candidate.fullName,
      email: report.candidate.email,
      phone: report.candidate.phone,
      target_position: report.candidate.targetPosition,
      overall_score: report.overallScore,
      overall_status: report.overallStatus,
      typing_data: report.typing,
      navigation_data: report.navigation,
      data_entry_data: report.dataEntry,
      multitasking_data: report.multitasking,
      troubleshooting_data: report.troubleshooting,
      unfocus_count: report.candidate.unfocusCount || 0,
      created_at: report.generatedAt || new Date().toISOString()
    };

    const { error } = await client
      .from('candidate_assessments')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase save failed:', e);
    return false;
  }
}

// Fetch all assessment reports from Supabase
export async function fetchAssessmentsFromSupabase(): Promise<CandidateAssessmentReport[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('candidate_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase query error:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      candidate: {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        targetPosition: row.target_position,
        startedAt: row.created_at,
        completedAt: row.created_at,
        unfocusCount: row.unfocus_count || 0
      },
      typing: row.typing_data,
      navigation: row.navigation_data,
      dataEntry: row.data_entry_data,
      multitasking: row.multitasking_data,
      troubleshooting: row.troubleshooting_data,
      overallScore: row.overall_score,
      overallStatus: row.overall_status,
      generatedAt: row.created_at
    }));
  } catch (e) {
    console.warn('Supabase fetch failed:', e);
    return [];
  }
}
