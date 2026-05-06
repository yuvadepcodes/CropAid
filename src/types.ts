
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface AnalysisResult {
  cropType: string;
  diseaseName: string;
  confidence: number;
  healthStatus: HealthStatus;
  description: string;
  remedies: string[];
}

export interface DiseaseInfo {
  id: string;
  name: string;
  commonIn: string[];
  symptoms: string[];
  prevention: string;
}
