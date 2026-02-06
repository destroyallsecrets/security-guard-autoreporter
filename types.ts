export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IncidentCategory {
  MEDICAL = 'MEDICAL',
  DISTURBANCE = 'DISTURBANCE',
  THEFT = 'THEFT',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  EJECTION = 'EJECTION',
  GENERAL = 'GENERAL'
}

export interface ExtractedData {
  time: string;
  location: string;
  subject: string;
  action: string;
  involvedParties: string[];
  category: IncidentCategory;
  severity: IncidentSeverity;
  rawText: string;
}

export interface IncidentTemplate {
  id: string;
  category: IncidentCategory;
  templateString: string;
  severity: IncidentSeverity;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerId: string;
  summary: string;
  category: IncidentCategory;
  generatedReport: string;
}
