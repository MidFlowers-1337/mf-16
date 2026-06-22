export type ExhibitStatus = 'in_house' | 'on_loan' | 'maintenance';
export type LoanStatus = 'pending' | 'active' | 'returned' | 'overdue';
export type TransportMethod = 'standard' | 'temperature_controlled' | 'special';
export type RiskType = 'time_conflict' | 'temp_control' | 'insurance' | 'overdue';
export type RiskSeverity = 'high' | 'medium' | 'low';

export interface Exhibit {
  id: number;
  name: string;
  category: string;
  insuranceValue: number;
  requiresTemperatureControl: boolean;
  status: ExhibitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: number;
  name: string;
  contactPerson: string;
  contactPhone: string;
  insuranceCoverage: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRecord {
  id: number;
  institutionId: number;
  institutionName?: string;
  exhibitIds: number[];
  exhibits?: Exhibit[];
  loanDate: string;
  returnDate: string;
  actualReturnDate?: string;
  transportMethod: TransportMethod;
  contactPerson: string;
  contactPhone: string;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskItem {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  exhibitId?: number;
  exhibitName?: string;
  loanId?: number;
  resolved: boolean;
  createdAt: string;
}

export interface TransportScheduleItem {
  date: string;
  type: 'outbound' | 'return';
  loanId: number;
  institutionName: string;
  exhibits: Exhibit[];
  transportMethod: TransportMethod;
}

export interface CreateLoanRequest {
  institutionId: number;
  exhibitIds: number[];
  loanDate: string;
  returnDate: string;
  transportMethod: TransportMethod;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
}
