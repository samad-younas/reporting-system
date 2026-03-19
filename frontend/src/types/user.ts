export interface SecurityAccessMappings {
  region_ids: number[];
  product_group_ids: number[];
  customer_group_ids: number[];
}

export interface UserFormData {
  email: string;
  password?: string;
  user_type: string;
  role_id?: number;
  role_ids?: number[];
  profile: {
    full_name: string;
    region: string;
    country: string;
    state: string;
    city: string;
    can_export: boolean;
    can_copy: boolean;
    is_cost_visible: boolean;
    is_inactive: boolean;
  };
  access_mappings?: SecurityAccessMappings;
}

export interface User {
  id: string | number;
  email: string;
  password?: string;
  user_type: string;
  role_id: number | string;
  role_ids?: number[];
  profile: {
    full_name: string;
    region: string;
    country: string;
    state: string;
    city: string;
    can_export: boolean;
    can_copy: boolean;
    is_cost_visible: boolean;
    is_inactive: boolean;
  } | null;
  access_mappings?: SecurityAccessMappings;
}
