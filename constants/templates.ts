import { IncidentCategory, IncidentSeverity, IncidentTemplate } from '../types';

export const INCIDENT_TEMPLATES: Record<IncidentCategory, IncidentTemplate> = {
  [IncidentCategory.MEDICAL]: {
    id: 'MED_01',
    category: IncidentCategory.MEDICAL,
    severity: IncidentSeverity.HIGH,
    templateString: "At {{time}}, security personnel responded to a medical alert at {{location}}. Upon arrival, subject identified as {{subject}} was found. Medical services (EMS/IFD) were notified immediately. Venue operations team secured the area. {{action}}.",
  },
  [IncidentCategory.EJECTION]: {
    id: 'EJECT_01',
    category: IncidentCategory.EJECTION,
    severity: IncidentSeverity.MEDIUM,
    templateString: "At {{time}}, an incident occurred at {{location}} involving a subject described as {{subject}}. The subject was observed violating venue code of conduct. After verbal warning, the decision was made to eject the subject. IMPD assisted with the escort. {{action}}.",
  },
  [IncidentCategory.DISTURBANCE]: {
    id: 'DIST_01',
    category: IncidentCategory.DISTURBANCE,
    severity: IncidentSeverity.MEDIUM,
    templateString: "Security control received reports of a disturbance at {{location}} at approximately {{time}}. Responding officers observed {{subject}} engaging in disorderly conduct. Parties were separated and de-escalation protocols were initiated. {{action}}.",
  },
  [IncidentCategory.THEFT]: {
    id: 'THEFT_01',
    category: IncidentCategory.THEFT,
    severity: IncidentSeverity.LOW,
    templateString: "A report of theft was filed at {{time}} near {{location}}. The complainant stated that {{subject}} was seen removing property. Surveillance footage has been flagged for review. {{action}}.",
  },
  [IncidentCategory.ACCESS_CONTROL]: {
    id: 'ACCESS_01',
    category: IncidentCategory.ACCESS_CONTROL,
    severity: IncidentSeverity.LOW,
    templateString: "At {{time}}, an access control breach was attempted at {{location}}. {{subject}} attempted to enter a restricted area without proper credentials. Access was denied and the subject was redirected. {{action}}.",
  },
  [IncidentCategory.GENERAL]: {
    id: 'GEN_01',
    category: IncidentCategory.GENERAL,
    severity: IncidentSeverity.LOW,
    templateString: "At {{time}}, a general incident was recorded at {{location}}. Subject {{subject}} was involved. Security personnel documented the following: {{action}}.",
  },
};