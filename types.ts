
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED'
}

export interface PermissionInfo {
  active: boolean;
  expiresAt?: string;
  serialNumber?: string;
  grantedAt?: string;
}

export interface UserPermissions {
  allAccess: boolean;
  categories: string[]; // List of category IDs the user has access to
  categoryPermissions?: Record<string, PermissionInfo>; // Detailed info for each category
  analytics?: PermissionInfo;
  canAccessAnalytics?: boolean;
  moneyManagement?: PermissionInfo;
  canAccessMoneyManagement?: boolean;
}

export interface SubscriptionCode {
  id: string;
  code: string; // SUB-XXXXXX
  type: 'CATEGORY' | 'ANALYTICS' | 'MONEY_MANAGEMENT';
  targetIds?: string[]; // Array of Category IDs if type is CATEGORY
  targetDurations?: Record<string, number>; // New: Per-target duration in days
  durationDays: number; // Default duration if not specified in targetDurations
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'DELETED' | 'SUSPENDED';
  expiresAt?: string; // When the code itself expires
  createdAt: string;
  adminId: string;
  usedBy?: string;
  usedAt?: string;
}

// ... (User interface)

export interface MoneyManagementTrade {
  tradeNo: number;
  betAmount: number;
  outcome?: 'WIN' | 'LOSE';
  returnAmount: number;
  currentCapital: number;
  timestamp: string;
}

export interface MoneyManagementSession {
  id: string;
  userId: string;
  adminId: string;
  name?: string;
  description?: string;
  initialCapital: number;
  totalEvents: number;
  expectedWins: number;
  odds: number;
  currentCapital: number;
  wins: number;
  losses: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  serialNumber?: string;
  trades: MoneyManagementTrade[];
  createdAt: string;
  completedAt?: string;
  finalCapital?: number;
  netProfit?: number;
  roi?: number;
}

export interface TradingPlatform {
  id: string;
  name: string;
  url: string;
  registrationUrl: string;
  description: string;
  logoUrl?: string;
  clickCount: number;
  clicksToday: number;
  lastClickAt?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isPopular: boolean;
  adminId: string;
  createdAt: string;
  order: number;
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  photoURL?: string;
  adminId?: string; // Links student to specific admin instance
  permissions?: UserPermissions;
  phone?: string;
  address?: string;
  username?: string;
  bookmarks?: string[]; // Array of document IDs
  lastActive?: string; // ISO timestamp of last activity
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string; // Lucide icon name
  status: 'ACTIVE' | 'INACTIVE';
  adminId: string;
  parentId?: string;
  serialNumber?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string; // Markdown
  categoryId?: string; // Kept for backward compatibility
  categoryIds: string[]; // New: Supports multiple categories
  thumbnail: string;
  images: string[];
  files: { name: string; url: string; type: string }[];
  status: 'DRAFT' | 'PUBLISHED';
  viewCount: number;
  downloadCount: number;
  adminId: string;
  createdAt: string;
  serialNumber?: string;
}

export interface RegistrationToken {
  id: string;
  key: string;
  status: 'ACTIVE' | 'USED' | 'REVOKED';
  generatedBy: string;
  createdAt: string;
  adminId: string;
  usedBy?: string;
  usedAt?: string;
}

export interface AdminSettings {
  registrationToken: string;
  brandingName: string;
  systemLogs: any[];
}

export interface AnalyticsEntry {
  entryNo: number;
  amount: number;
  outcome?: 'SUCCESS' | 'FAILURE';
  returnAmount: number;
  currentBalance: number;
  timestamp: string;
}

export interface ResourceAnalyticsSession {
  id: string;
  userId: string;
  adminId: string;
  name?: string;
  description?: string;
  initialBalance: number;
  totalEvents: number;
  expectedSuccess: number;
  ratio: number;
  currentBalance: number;
  successes: number;
  failures: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  serialNumber?: string;
  entries: AnalyticsEntry[];
  createdAt: string;
  completedAt?: string;
  finalBalance?: number;
  netGain?: number;
  netProfit?: number;
  roi?: number;
}

export interface ResourceLink {
  id: string;
  name: string;
  url: string;
  registrationUrl: string;
  description: string;
  logoUrl?: string;
  clickCount: number;
  clicksToday: number;
  lastClickAt?: string;
  status: 'ACTIVE' | 'INACTIVE';
  adminId: string;
  createdAt: string;
  order: number;
}

export interface SubscriptionFeature {
  text: string;
  isAvailable: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: SubscriptionFeature[];
  description: string;
  isPopular: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  adminId: string;
  createdAt: string;
  order: number;
}
