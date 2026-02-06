import { IncidentCategory, IncidentSeverity, ExtractedData } from '../types';

/**
 * Indianapolis Venue Specific Regex Dictionary
 */
const PATTERNS = {
  // Indianapolis Specific Locations
  locations: [
    /(?:Lucas Oil|LOS|Stadium)/i,
    /(?:Gainbridge|Fieldhouse)/i,
    /(?:Convention Center|ICC)/i,
    /(?:Victory Field|The Vic)/i,
    /(?:Capitol|Meridian|Georgia|Illinois|Washington)\s+(?:St|Ave|Street|Avenue)/i,
    /(?:Monument Circle)/i,
    /Gate\s+(\d+|[A-Z])/i,
    /Section\s+(\d{3}|[A-Z]+)/i,
    /Concourse/i,
    /Entry\s+(\d+)/i,
    /Ticket\s+Office/i,
    /Loading\s+Dock/i,
    /Quarterback\s+Suite/i,
    /Pagoda/i,
    /Gasoline\s+Alley/i
  ],
  // Subject descriptors
  subjects: [
    /(?:WM|WF|BM|BF|HM|HF|AM|AF)\s?\/?\s?(?:\d{2})?/i, // Police codes: White Male, Black Female, etc.
    /(?:male|female|guest|patron|fan|attendee)/i,
    /(?:wearing|dressed in)\s+([a-z\s]+)/i,
    /subject/i
  ],
  // Incident indicators
  categories: {
    [IncidentCategory.MEDICAL]: [/medical/i, /medic/i, /ems/i, /fainted/i, /seizure/i, /collapsed/i, /blood/i, /injury/i, /hurt/i, /ifd/i],
    [IncidentCategory.EJECTION]: [/eject/i, /kick(?:ed)?\s*out/i, /escort(?:ed)?/i, /remove(?:d)?/i, /banned/i],
    [IncidentCategory.DISTURBANCE]: [/fight/i, /argument/i, /yell/i, /drunk/i, /intoxicated/i, /push/i, /shove/i, /aggressive/i, /disorderly/i],
    [IncidentCategory.THEFT]: [/stole/i, /theft/i, /missing/i, /taken/i, /purse/i, /wallet/i, /phone/i],
    [IncidentCategory.ACCESS_CONTROL]: [/breach/i, /badge/i, /credential/i, /restricted/i, /door/i, /gate\s+crasher/i],
  },
  // Time formats
  time: /(\d{1,2}:\d{2}(?:\s?[AP]M)?)|(\d{4}\s?hrs)/i
};

/**
 * Normalizes time to a standard format
 */
const extractTime = (text: string): string => {
  const match = text.match(PATTERNS.time);
  if (match) return match[0];
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Extracts the most likely location based on specificity hierarchy
 */
const extractLocation = (text: string): string => {
  for (const pattern of PATTERNS.locations) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return "Unknown Location";
};

/**
 * Extracts subject description
 */
const extractSubject = (text: string): string => {
  for (const pattern of PATTERNS.subjects) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return "an unidentified subject";
};

/**
 * Determines category based on keyword density
 */
const detectCategory = (text: string): { category: IncidentCategory; severity: IncidentSeverity } => {
  let bestCategory = IncidentCategory.GENERAL;
  let maxHits = 0;

  for (const [cat, regexes] of Object.entries(PATTERNS.categories)) {
    let hits = 0;
    regexes.forEach(rx => {
      if (rx.test(text)) hits++;
    });
    
    if (hits > maxHits) {
      maxHits = hits;
      bestCategory = cat as IncidentCategory;
    }
  }

  // Determine severity logic
  let severity = IncidentSeverity.LOW;
  if (bestCategory === IncidentCategory.MEDICAL) severity = IncidentSeverity.HIGH;
  if (bestCategory === IncidentCategory.DISTURBANCE && /weapon|gun|knife/i.test(text)) severity = IncidentSeverity.CRITICAL;
  if (bestCategory === IncidentCategory.EJECTION) severity = IncidentSeverity.MEDIUM;

  return { category: bestCategory, severity };
};

/**
 * Main Logic Engine Function
 */
export const parseFieldNotes = (text: string): ExtractedData => {
  const time = extractTime(text);
  const location = extractLocation(text);
  const subject = extractSubject(text);
  const { category, severity } = detectCategory(text);

  // Clean up action text (remove extracted entities generally to find the verbage)
  // This is a naive implementation; usually we just return the full text as 'action' details for the officer to refine
  // But strictly for the prompt's request, let's try to map it.
  const action = text; 

  return {
    time,
    location,
    subject,
    action, // In a real app, we might perform more complex NLP here, but for now we pass the raw notes as the specific action context
    involvedParties: [],
    category,
    severity,
    rawText: text
  };
};