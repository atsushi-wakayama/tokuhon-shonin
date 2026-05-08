export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      areas: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['areas']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['areas']['Insert']>
      }
      monuments: {
        Row: {
          id: string
          name: string
          // location は PostGIS型のため API レスポンスでは {type, coordinates} 形式
          latitude: number   // ビューや RPC から取得した場合
          longitude: number
          prefecture: string
          address: string | null
          area_id: number | null
          description: string | null
          access_info: string | null
          image_urls: string[]
          is_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['monuments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['monuments']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          total_stamps: number
          created_at: string
          updated_at: string
        }
        Insert: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'nickname'>
        Update: Partial<Pick<Database['public']['Tables']['profiles']['Row'], 'nickname' | 'avatar_url'>>
      }
      stamps: {
        Row: {
          id: string
          user_id: string
          monument_id: string
          photo_url: string
          latitude: number | null
          longitude: number | null
          checked_in_at: string
        }
        Insert: Omit<Database['public']['Tables']['stamps']['Row'], 'id' | 'checked_in_at'>
        Update: never
      }
      badges: {
        Row: {
          id: number
          name: string
          description: string
          icon_url: string | null
          condition_type: 'stamp_count' | 'area_complete' | 'prefecture_complete'
          condition_value: Json
          sort_order: number
        }
        Insert: never
        Update: never
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: number
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'earned_at'>
        Update: never
      }
    }
    Views: {
      monument_stamp_counts: {
        Row: {
          monument_id: string
          stamp_count: number
        }
      }
    }
    Functions: {
      is_within_checkin_range: {
        Args: {
          monument_id: string
          user_lat: number
          user_lng: number
          radius_m?: number
        }
        Returns: boolean
      }
    }
  }
}

// =====================================================
// 便利な型エイリアス
// =====================================================
export type Area     = Database['public']['Tables']['areas']['Row']
export type Monument = Database['public']['Tables']['monuments']['Row']
export type Profile  = Database['public']['Tables']['profiles']['Row']
export type Stamp    = Database['public']['Tables']['stamps']['Row']
export type Badge    = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']

// 結合型
export type MonumentWithArea = Monument & { area: Area | null }
export type StampWithMonument = Stamp & { monument: Monument }
export type UserBadgeWithBadge = UserBadge & { badge: Badge }
