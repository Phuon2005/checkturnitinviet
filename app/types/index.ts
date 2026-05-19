import type { Database } from './database.types'

export type OrderRow = Database['public']['Tables']['orders']['Row']
export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ReportRow = Database['public']['Tables']['reports']['Row']

export type Order = OrderRow & {
  documents: DocumentRow
  profiles: ProfileRow
  reports: ReportRow | null
}

export type Profile = ProfileRow

export type SystemSettingsRow = Database['public']['Tables']['system_settings']['Row']
export type SystemSettings = SystemSettingsRow

export interface ReportFileData {
  fileName: string
  fileSize?: number
  pages?: number
  wordCount?: number
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}
