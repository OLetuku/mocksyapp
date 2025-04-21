export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company: string | null
          role: string | null
          created_at: string
          updated_at: string
          company_description: string | null
          company_industry: string | null
          company_size: string | null
          company_website: string | null
          company_logo_url: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          company_description?: string | null
          company_industry?: string | null
          company_size?: string | null
          company_website?: string | null
          company_logo_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          company_description?: string | null
          company_industry?: string | null
          company_size?: string | null
          company_website?: string | null
          company_logo_url?: string | null
        }
      }
      tests: {
        Row: {
          id: string
          title: string
          discipline: string
          category: string
          created_by: string
          total_time: number | null
          created_at: string
          updated_at: string
          archived: boolean
          preview_token: string | null
          ai_generated: boolean
          deadline: string | null
        }
        Insert: {
          id?: string
          title: string
          discipline: string
          category?: string
          created_by: string
          total_time?: number | null
          created_at?: string
          updated_at?: string
          archived?: boolean
          preview_token?: string | null
          ai_generated?: boolean
          deadline?: string | null
        }
        Update: {
          id?: string
          title?: string
          discipline?: string
          category?: string
          created_by?: string
          total_time?: number | null
          created_at?: string
          updated_at?: string
          archived?: boolean
          preview_token?: string | null
          ai_generated?: boolean
          deadline?: string | null
        }
      }
      test_sections: {
        Row: {
          id: string
          test_id: string
          title: string
          type: string
          time_limit: number
          instructions: string | null
          reference_link: string | null
          download_link: string | null
          output_format: string | null
          order_index: number
          created_at: string
          updated_at: string
          submission_type: string
          resources: Json | null
        }
        Insert: {
          id?: string
          test_id: string
          title: string
          type: string
          time_limit: number
          instructions?: string | null
          reference_link?: string | null
          download_link?: string | null
          output_format?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
          submission_type?: string
          resources?: Json | null
        }
        Update: {
          id?: string
          test_id?: string
          title?: string
          type?: string
          time_limit?: number
          instructions?: string | null
          reference_link?: string | null
          download_link?: string | null
          output_format?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          submission_type?: string
          resources?: Json | null
        }
      }
      test_settings: {
        Row: {
          test_id: string
          watermark: boolean
          prevent_skipping: boolean
          limit_attempts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          test_id: string
          watermark?: boolean
          prevent_skipping?: boolean
          limit_attempts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          test_id?: string
          watermark?: boolean
          prevent_skipping?: boolean
          limit_attempts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_submissions: {
        Row: {
          id: string
          test_id: string
          candidate_id: string
          status: string
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          test_id: string
          candidate_id: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          candidate_id?: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      section_submissions: {
        Row: {
          id: string
          test_submission_id: string
          section_id: string
          status: string
          submission_link: string | null
          comments: string | null
          time_spent: number
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          test_submission_id: string
          section_id: string
          status?: string
          submission_link?: string | null
          comments?: string | null
          time_spent?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          test_submission_id?: string
          section_id?: string
          status?: string
          submission_link?: string | null
          comments?: string | null
          time_spent?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          test_id: string
          candidate_id: string
          email: string
          status: string
          token: string
          expires_at: string
          created_at: string
          updated_at: string
          deadline: string | null
        }
        Insert: {
          id?: string
          test_id: string
          candidate_id: string
          email: string
          status?: string
          token: string
          expires_at: string
          created_at?: string
          updated_at?: string
          deadline?: string | null
        }
        Update: {
          id?: string
          test_id?: string
          candidate_id?: string
          email?: string
          status?: string
          token?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
          deadline?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
