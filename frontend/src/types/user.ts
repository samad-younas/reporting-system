export interface UserFormData {
  email: string;
  password?: string;
  user_type: string;
  role_id?: number;
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
}

export interface User {
  id: string | number;
  email: string;
  password?: string;
  user_type: string;
  role_id: number | string;
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
}
