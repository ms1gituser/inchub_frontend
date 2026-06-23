'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { get, put, resolveToken } from '@/lib/apiClient';

export type UserRole = 'admin' | 'ceo' | 'accountant' | 'sales' | 'ops' | 'client';

export interface PermissionContextType {
  role: UserRole;
  permissions: string[];
  allAvailablePermissions: string[];
  hasPermission: (permission: string) => boolean;
  togglePermission: (permission: string) => void;
  setAllPermissions: (granted: boolean) => void;
  setRole: (role: UserRole) => void;
  userId: string | null;
  loading: boolean;
  currentBrand: 'group' | 'corporate' | 'financial';
  setCurrentBrand: (brand: 'group' | 'corporate' | 'financial') => void;
}

const ALL_PERMISSIONS = [
  'contacts:read',
  'contacts:create',
  'contacts:edit',
  'contacts:delete',
  'leads:read',
  'leads:create',
  'leads:edit',
  'deals:read',
  'deals:create',
  'deals:delete',
  'pipelines:edit',
  'pipelines:configure',
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ALL_PERMISSIONS,
  ceo: ALL_PERMISSIONS,
  accountant: [
    'contacts:read',
    'leads:read',
    'deals:read',
  ],
  sales: [
    'contacts:read',
    'contacts:create',
    'contacts:edit',
    'leads:read',
    'leads:create',
    'leads:edit',
    'deals:read',
    'deals:create',
  ],
  ops: [
    'contacts:read',
    'contacts:create',
    'contacts:edit',
    'leads:read',
    'deals:read',
  ],
  client: [],
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRoleState] = useState<UserRole>('client');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBrand, setCurrentBrandState] = useState<'group' | 'corporate' | 'financial'>('group');

  useEffect(() => {
    const updateBrand = async () => {
      await Promise.resolve();
      if (role === 'accountant') {
        setCurrentBrandState('financial');
      } else if (role === 'sales' || role === 'ops') {
        setCurrentBrandState('corporate');
      } else {
        setCurrentBrandState('group');
      }
    };
    updateBrand();
  }, [role]);

  const setCurrentBrand = (brand: 'group' | 'corporate' | 'financial') => {
    // Only admins or CEOs are allowed to toggle brands. Standard team members are locked to their brand.
    if (role === 'admin' || role === 'ceo') {
      setCurrentBrandState(brand);
    }
  };

  const fetchProfile = async () => {
    const token = resolveToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      interface MeResponse {
        success: boolean;
        user: {
          id: string;
          email: string;
          role: UserRole;
          permissions: string[];
        };
      }
      const response = await get<MeResponse>('/auth/me');
      if (response.success && response.user) {
        setRoleState(response.user.role);
        setPermissions(response.user.permissions);
        setUserId(response.user.id);
      }
    } catch (e) {
      console.error('Failed to load real database permissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.resolve();
      fetchProfile();
    };
    init();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const togglePermission = async (permission: string) => {
    const updated = permissions.includes(permission)
      ? permissions.filter((p) => p !== permission)
      : [...permissions, permission];

    setPermissions(updated);

    // Only persist to database if the current user is admin — the
    // RBAC sandbox panel is demo-mode for non-admins (local state only).
    if (userId && role === 'admin') {
      try {
        await put(`/auth/users/${userId}/permissions`, { permissions: updated });
      } catch (e) {
        console.error('Failed to sync permission change to database:', e);
      }
    }
  };

  const setAllPermissions = async (granted: boolean) => {
    const nextPerms = granted ? ALL_PERMISSIONS : [];
    setPermissions(nextPerms);

    if (userId && role === 'admin') {
      try {
        await put(`/auth/users/${userId}/permissions`, { permissions: nextPerms });
      } catch (e) {
        console.error('Failed to sync batch permission change to database:', e);
      }
    }
  };

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    const nextPerms = ROLE_PERMISSIONS[newRole];
    setPermissions(nextPerms);

    if (userId && role === 'admin') {
      try {
        await put(`/auth/users/${userId}/permissions`, { permissions: nextPerms });
      } catch (e) {
        console.error('Failed to sync role template change to database:', e);
      }
    }
  };

  return (
    <PermissionContext.Provider
      value={{
        role,
        permissions,
        allAvailablePermissions: ALL_PERMISSIONS,
        hasPermission,
        togglePermission,
        setAllPermissions,
        setRole,
        userId,
        loading,
        currentBrand,
        setCurrentBrand,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}
