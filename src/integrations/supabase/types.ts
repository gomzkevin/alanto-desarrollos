export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      configuracion_financiera: {
        Row: {
          adr_base: number | null
          comision_operador: number | null
          desarrollo_id: string | null
          es_mantenimiento_porcentaje: boolean | null
          gastos_fijos: number | null
          gastos_variables: number | null
          id: number
          impuestos: number | null
          mantenimiento_valor: number | null
          moneda: string | null
          ocupacion_anual: number | null
          plusvalia_anual: number | null
          tasa_interes: number | null
          tipo_cambio: number | null
        }
        Insert: {
          adr_base?: number | null
          comision_operador?: number | null
          desarrollo_id?: string | null
          es_mantenimiento_porcentaje?: boolean | null
          gastos_fijos?: number | null
          gastos_variables?: number | null
          id?: number
          impuestos?: number | null
          mantenimiento_valor?: number | null
          moneda?: string | null
          ocupacion_anual?: number | null
          plusvalia_anual?: number | null
          tasa_interes?: number | null
          tipo_cambio?: number | null
        }
        Update: {
          adr_base?: number | null
          comision_operador?: number | null
          desarrollo_id?: string | null
          es_mantenimiento_porcentaje?: boolean | null
          gastos_fijos?: number | null
          gastos_variables?: number | null
          id?: number
          impuestos?: number | null
          mantenimiento_valor?: number | null
          moneda?: string | null
          ocupacion_anual?: number | null
          plusvalia_anual?: number | null
          tasa_interes?: number | null
          tipo_cambio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracion_financiera_desarrollo_id_fkey"
            columns: ["desarrollo_id"]
            isOneToOne: false
            referencedRelation: "desarrollos"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          created_at: string
          desarrollo_id: string
          fecha_finiquito: string | null
          fecha_inicio_pagos: string | null
          id: string
          lead_id: string
          monto_anticipo: number
          monto_finiquito: number | null
          notas: string | null
          numero_pagos: number
          prototipo_id: string
          usar_finiquito: boolean | null
        }
        Insert: {
          created_at?: string
          desarrollo_id: string
          fecha_finiquito?: string | null
          fecha_inicio_pagos?: string | null
          id?: string
          lead_id: string
          monto_anticipo: number
          monto_finiquito?: number | null
          notas?: string | null
          numero_pagos: number
          prototipo_id: string
          usar_finiquito?: boolean | null
        }
        Update: {
          created_at?: string
          desarrollo_id?: string
          fecha_finiquito?: string | null
          fecha_inicio_pagos?: string | null
          id?: string
          lead_id?: string
          monto_anticipo?: number
          monto_finiquito?: number | null
          notas?: string | null
          numero_pagos?: number
          prototipo_id?: string
          usar_finiquito?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_desarrollo_id_fkey"
            columns: ["desarrollo_id"]
            isOneToOne: false
            referencedRelation: "desarrollos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_prototipo_id_fkey"
            columns: ["prototipo_id"]
            isOneToOne: false
            referencedRelation: "prototipos"
            referencedColumns: ["id"]
          },
        ]
      }
      desarrollo_imagenes: {
        Row: {
          created_at: string | null
          desarrollo_id: string
          es_principal: boolean | null
          id: string
          orden: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          desarrollo_id: string
          es_principal?: boolean | null
          id?: string
          orden?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          desarrollo_id?: string
          es_principal?: boolean | null
          id?: string
          orden?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "desarrollo_imagenes_desarrollo_id_fkey"
            columns: ["desarrollo_id"]
            isOneToOne: false
            referencedRelation: "desarrollos"
            referencedColumns: ["id"]
          },
        ]
      }
      desarrollos: {
        Row: {
          adr_base: number | null
          amenidades: Json | null
          avance_porcentaje: number | null
          comision_operador: number | null
          descripcion: string | null
          es_gastos_fijos_porcentaje: boolean | null
          es_gastos_variables_porcentaje: boolean | null
          es_impuestos_porcentaje: boolean | null
          es_mantenimiento_porcentaje: boolean | null
          fecha_entrega: string | null
          fecha_inicio: string | null
          gastos_fijos: number | null
          gastos_variables: number | null
          id: string
          imagen_url: string | null
          impuestos: number | null
          mantenimiento_valor: number | null
          moneda: string | null
          nombre: string
          ocupacion_anual: number | null
          total_unidades: number
          ubicacion: string
          unidades_disponibles: number
        }
        Insert: {
          adr_base?: number | null
          amenidades?: Json | null
          avance_porcentaje?: number | null
          comision_operador?: number | null
          descripcion?: string | null
          es_gastos_fijos_porcentaje?: boolean | null
          es_gastos_variables_porcentaje?: boolean | null
          es_impuestos_porcentaje?: boolean | null
          es_mantenimiento_porcentaje?: boolean | null
          fecha_entrega?: string | null
          fecha_inicio?: string | null
          gastos_fijos?: number | null
          gastos_variables?: number | null
          id?: string
          imagen_url?: string | null
          impuestos?: number | null
          mantenimiento_valor?: number | null
          moneda?: string | null
          nombre: string
          ocupacion_anual?: number | null
          total_unidades: number
          ubicacion: string
          unidades_disponibles: number
        }
        Update: {
          adr_base?: number | null
          amenidades?: Json | null
          avance_porcentaje?: number | null
          comision_operador?: number | null
          descripcion?: string | null
          es_gastos_fijos_porcentaje?: boolean | null
          es_gastos_variables_porcentaje?: boolean | null
          es_impuestos_porcentaje?: boolean | null
          es_mantenimiento_porcentaje?: boolean | null
          fecha_entrega?: string | null
          fecha_inicio?: string | null
          gastos_fijos?: number | null
          gastos_variables?: number | null
          id?: string
          imagen_url?: string | null
          impuestos?: number | null
          mantenimiento_valor?: number | null
          moneda?: string | null
          nombre?: string
          ocupacion_anual?: number | null
          total_unidades?: number
          ubicacion?: string
          unidades_disponibles?: number
        }
        Relationships: []
      }
      empresa_info: {
        Row: {
          direccion: string | null
          email: string | null
          id: number
          logo_url: string | null
          nombre: string | null
          rfc: string | null
          sitio_web: string | null
          telefono: string | null
        }
        Insert: {
          direccion?: string | null
          email?: string | null
          id?: number
          logo_url?: string | null
          nombre?: string | null
          rfc?: string | null
          sitio_web?: string | null
          telefono?: string | null
        }
        Update: {
          direccion?: string | null
          email?: string | null
          id?: number
          logo_url?: string | null
          nombre?: string | null
          rfc?: string | null
          sitio_web?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          agente: string | null
          email: string | null
          estado: string | null
          fecha_creacion: string | null
          id: string
          interes_en: string | null
          nombre: string
          notas: string | null
          origen: string | null
          subestado: string | null
          telefono: string | null
          ultimo_contacto: string | null
        }
        Insert: {
          agente?: string | null
          email?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          id?: string
          interes_en?: string | null
          nombre: string
          notas?: string | null
          origen?: string | null
          subestado?: string | null
          telefono?: string | null
          ultimo_contacto?: string | null
        }
        Update: {
          agente?: string | null
          email?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          id?: string
          interes_en?: string | null
          nombre?: string
          notas?: string | null
          origen?: string | null
          subestado?: string | null
          telefono?: string | null
          ultimo_contacto?: string | null
        }
        Relationships: []
      }
      propiedades: {
        Row: {
          baños: number | null
          desarrollo_id: string | null
          descripcion: string | null
          estado: string | null
          habitaciones: number | null
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          superficie: number | null
          tipo: string
        }
        Insert: {
          baños?: number | null
          desarrollo_id?: string | null
          descripcion?: string | null
          estado?: string | null
          habitaciones?: number | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio: number
          superficie?: number | null
          tipo: string
        }
        Update: {
          baños?: number | null
          desarrollo_id?: string | null
          descripcion?: string | null
          estado?: string | null
          habitaciones?: number | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          superficie?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedades_desarrollo_id_fkey"
            columns: ["desarrollo_id"]
            isOneToOne: false
            referencedRelation: "desarrollos"
            referencedColumns: ["id"]
          },
        ]
      }
      prototipos: {
        Row: {
          baños: number | null
          caracteristicas: Json | null
          desarrollo_id: string
          descripcion: string | null
          estacionamientos: number | null
          habitaciones: number | null
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          superficie: number | null
          tipo: string
          total_unidades: number
          unidades_con_anticipo: number | null
          unidades_disponibles: number
          unidades_vendidas: number | null
        }
        Insert: {
          baños?: number | null
          caracteristicas?: Json | null
          desarrollo_id: string
          descripcion?: string | null
          estacionamientos?: number | null
          habitaciones?: number | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio: number
          superficie?: number | null
          tipo: string
          total_unidades: number
          unidades_con_anticipo?: number | null
          unidades_disponibles: number
          unidades_vendidas?: number | null
        }
        Update: {
          baños?: number | null
          caracteristicas?: Json | null
          desarrollo_id?: string
          descripcion?: string | null
          estacionamientos?: number | null
          habitaciones?: number | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          superficie?: number | null
          tipo?: string
          total_unidades?: number
          unidades_con_anticipo?: number | null
          unidades_disponibles?: number
          unidades_vendidas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prototipos_desarrollo_id_fkey"
            columns: ["desarrollo_id"]
            isOneToOne: false
            referencedRelation: "desarrollos"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          comprador_id: string | null
          comprador_nombre: string | null
          created_at: string
          estado: string
          fecha_venta: string | null
          id: string
          nivel: string | null
          numero: string
          precio_venta: number | null
          prototipo_id: string
          vendedor_id: string | null
          vendedor_nombre: string | null
        }
        Insert: {
          comprador_id?: string | null
          comprador_nombre?: string | null
          created_at?: string
          estado?: string
          fecha_venta?: string | null
          id?: string
          nivel?: string | null
          numero: string
          precio_venta?: number | null
          prototipo_id: string
          vendedor_id?: string | null
          vendedor_nombre?: string | null
        }
        Update: {
          comprador_id?: string | null
          comprador_nombre?: string | null
          created_at?: string
          estado?: string
          fecha_venta?: string | null
          id?: string
          nivel?: string | null
          numero?: string
          precio_venta?: number | null
          prototipo_id?: string
          vendedor_id?: string | null
          vendedor_nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_prototipo_id_fkey"
            columns: ["prototipo_id"]
            isOneToOne: false
            referencedRelation: "prototipos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean | null
          auth_id: string | null
          email: string
          fecha_creacion: string | null
          id: string
          nombre: string
          rol: string | null
        }
        Insert: {
          activo?: boolean | null
          auth_id?: string | null
          email: string
          fecha_creacion?: string | null
          id?: string
          nombre: string
          rol?: string | null
        }
        Update: {
          activo?: boolean | null
          auth_id?: string | null
          email?: string
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          rol?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
