export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'manager';
  email: string;
  activeSiteIds: string[];
}

export type PaymentType = 'kharchi' | 'extra' | 'advance' | 'bonus' | 'deduction';

export interface Site {
  id: string;
  siteName: string;
  description: string;
  status: 'active' | 'archived';
  createdDate: string;
  managerId: string;
  address: string;
}

export interface Labour {
  id: string;
  name: string;
  phone: string;
  address: string;
  emergencyContact: string;
  skillType: string;
  industryType: string;
  dailyWage: number;
  joiningDate: string;
  assignedSiteIds: string[];
}

export interface Payment {
  id: string;
  labourId: string;
  siteId: string;
  paymentType: PaymentType;
  amount: number;
  description: string;
  createdAt: any; // Firestore Timestamp
  createdBy: string;
}

export type Language = 'en' | 'hi';
