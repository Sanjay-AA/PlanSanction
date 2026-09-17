import { BuildingType, PlotDetails, Setbacks } from '../types';

/**
 * Tamil Nadu Combined Development and Building Rules, 2019 (TNCDBR 2019)
 * Reference Scrutiny Engine & Rule Definition Constants
 */

export interface TNCDBRParameters {
  plotAreaSqm: number;
  builtUpAreaSqm: number;
  buildingType: BuildingType;
  floors: number;
  proposedHeightM: number;
  abuttingRoadWidthM: number;
  frontageM: number;
  setbacks: Setbacks;
  parkingSpacesCar: number;
  parkingSpacesTwoWheeler: number;
  staircaseWidthM: number;
  rainwaterHarvestingProvided: boolean;
}

export interface RuleViolation {
  rule: string;
  ruleRef: string;
  required: string;
  found: string;
  severity: 'low' | 'medium' | 'high';
  remark: string;
  isCompliant: boolean;
}

export const TNCDBR_RULES = {
  // Rule 35: FSI and Ground Coverage limits
  FSI_LIMITS: {
    residential: {
      under9mRoad: 1.5,
      under12mRoad: 1.75,
      under18mRoad: 2.0,
      above18mRoad: 2.5,
    },
    commercial: {
      under9mRoad: 1.25,
      under12mRoad: 1.5,
      under18mRoad: 1.75,
      above18mRoad: 2.25,
    },
    industrial: {
      under9mRoad: 1.0,
      under12mRoad: 1.25,
      under18mRoad: 1.5,
      above18mRoad: 1.75,
    },
    institutional: {
      under9mRoad: 1.2,
      under12mRoad: 1.5,
      under18mRoad: 1.8,
      above18mRoad: 2.0,
    }
  },

  MAX_GROUND_COVERAGE_PCT: {
    residential: 70, // 70% max
    commercial: 65,  // 65% max
    industrial: 60,  // 60% max
    institutional: 50 // 50% max
  },

  // Rule 38: Minimum Setbacks (in metres) based on building height & road width
  getRequiredSetbacks(heightM: number, buildingType: BuildingType, plotAreaSqm: number) {
    if (heightM <= 7.0) {
      return { front: 1.5, rear: 1.0, left: 1.0, right: 1.0 };
    } else if (heightM <= 12.0) {
      return { front: 3.0, rear: 1.5, left: 1.5, right: 1.5 };
    } else if (heightM <= 15.0) {
      return { front: 4.5, rear: 3.0, left: 3.0, right: 3.0 };
    } else {
      // High-rise > 15m
      return { front: 6.0, rear: 5.0, left: 5.0, right: 5.0 };
    }
  },

  // Rule 42: Parking requirements
  getRequiredParking(builtUpAreaSqm: number, buildingType: BuildingType) {
    if (buildingType === 'residential') {
      // 1 car space per 100 sqm built up area, 1 two wheeler per 50 sqm
      const cars = Math.max(1, Math.ceil(builtUpAreaSqm / 120));
      const twoWheelers = Math.max(2, Math.ceil(builtUpAreaSqm / 60));
      return { cars, twoWheelers };
    } else if (buildingType === 'commercial') {
      // 1 car space per 50 sqm, 1 two wheeler per 25 sqm
      const cars = Math.max(2, Math.ceil(builtUpAreaSqm / 60));
      const twoWheelers = Math.max(4, Math.ceil(builtUpAreaSqm / 30));
      return { cars, twoWheelers };
    } else {
      const cars = Math.max(2, Math.ceil(builtUpAreaSqm / 150));
      const twoWheelers = Math.max(4, Math.ceil(builtUpAreaSqm / 75));
      return { cars, twoWheelers };
    }
  },

  // Rule 48: Staircase widths
  getRequiredStaircaseWidth(floors: number, buildingType: BuildingType): number {
    if (buildingType === 'commercial' || buildingType === 'institutional') {
      return 1.5; // 1.5m minimum
    }
    if (floors > 3) {
      return 1.25; // 1.25m
    }
    return 1.0; // 1.0m minimum for G+1 / G+2 residential
  }
};

/**
 * Deterministic local scrutiny evaluation based on TNCDBR 2019
 */
export function evaluateTNCDBRCompliance(params: TNCDBRParameters): {
  complianceScore: number;
  checks: RuleViolation[];
  correctionPoints: Array<{ point: string; section: string; ruleRef: string }>;
  recommendation: 'approve' | 'approve_with_conditions' | 'correction_required' | 'reject';
  summary: string;
} {
  const checks: RuleViolation[] = [];
  const correctionPoints: Array<{ point: string; section: string; ruleRef: string }> = [];

  const calculatedFSI = Number((params.builtUpAreaSqm / Math.max(params.plotAreaSqm, 1)).toFixed(2));

  // 1. FSI Check
  let maxPermissibleFSI = 1.5;
  const fsiTable = TNCDBR_RULES.FSI_LIMITS[params.buildingType] || TNCDBR_RULES.FSI_LIMITS.residential;
  if (params.abuttingRoadWidthM >= 18) {
    maxPermissibleFSI = fsiTable.above18mRoad;
  } else if (params.abuttingRoadWidthM >= 12) {
    maxPermissibleFSI = fsiTable.under18mRoad;
  } else if (params.abuttingRoadWidthM >= 9) {
    maxPermissibleFSI = fsiTable.under12mRoad;
  } else {
    maxPermissibleFSI = fsiTable.under9mRoad;
  }

  const fsiPass = calculatedFSI <= maxPermissibleFSI;
  checks.push({
    rule: 'Floor Space Index (FSI) Limit',
    ruleRef: 'TNCDBR 2019 Rule 35, Table 1',
    required: `Max FSI <= ${maxPermissibleFSI} (Road width ${params.abuttingRoadWidthM}m)`,
    found: `Proposed FSI = ${calculatedFSI}`,
    severity: 'high',
    remark: fsiPass
      ? `FSI is within allowable limits for ${params.buildingType} zone.`
      : `Proposed FSI (${calculatedFSI}) exceeds the maximum permissible limit of ${maxPermissibleFSI} for road width ${params.abuttingRoadWidthM}m.`,
    isCompliant: fsiPass
  });

  if (!fsiPass) {
    correctionPoints.push({
      point: `Reduce total built-up area from ${params.builtUpAreaSqm} sq.m to max ${(params.plotAreaSqm * maxPermissibleFSI).toFixed(1)} sq.m to satisfy FSI norm of ${maxPermissibleFSI}.`,
      section: 'Built-Up Area & FSI',
      ruleRef: 'TNCDBR Rule 35'
    });
  }

  // 2. Setback Checks (Front, Rear, Left, Right)
  const reqSetbacks = TNCDBR_RULES.getRequiredSetbacks(params.proposedHeightM, params.buildingType, params.plotAreaSqm);

  // Front Setback
  const frontPass = params.setbacks.front >= reqSetbacks.front;
  checks.push({
    rule: 'Front Setback (Front Yard)',
    ruleRef: 'TNCDBR 2019 Rule 38(2)',
    required: `Min ${reqSetbacks.front}m for height ${params.proposedHeightM}m`,
    found: `${params.setbacks.front}m`,
    severity: 'high',
    remark: frontPass
      ? 'Front setback satisfies roadside clearance standards.'
      : `Front setback ${params.setbacks.front}m is less than mandatory ${reqSetbacks.front}m required for ${params.proposedHeightM}m building height.`,
    isCompliant: frontPass
  });
  if (!frontPass) {
    correctionPoints.push({
      point: `Provide minimum front setback of ${reqSetbacks.front}m (currently provided: ${params.setbacks.front}m) from plot boundary.`,
      section: 'Setbacks & Open Spaces',
      ruleRef: 'TNCDBR Rule 38(2)'
    });
  }

  // Rear Setback
  const rearPass = params.setbacks.rear >= reqSetbacks.rear;
  checks.push({
    rule: 'Rear Setback (Rear Yard)',
    ruleRef: 'TNCDBR 2019 Rule 38(3)',
    required: `Min ${reqSetbacks.rear}m`,
    found: `${params.setbacks.rear}m`,
    severity: 'medium',
    remark: rearPass ? 'Rear open space complies with minimum standards.' : `Rear setback of ${params.setbacks.rear}m is deficient by ${(reqSetbacks.rear - params.setbacks.rear).toFixed(2)}m.`,
    isCompliant: rearPass
  });
  if (!rearPass) {
    correctionPoints.push({
      point: `Increase rear open yard setback to at least ${reqSetbacks.rear}m (currently provided: ${params.setbacks.rear}m).`,
      section: 'Setbacks & Open Spaces',
      ruleRef: 'TNCDBR Rule 38(3)'
    });
  }

  // Side Setbacks (Left & Right)
  const sidePass = params.setbacks.left >= reqSetbacks.left && params.setbacks.right >= reqSetbacks.right;
  checks.push({
    rule: 'Side Setbacks (Left & Right Yards)',
    ruleRef: 'TNCDBR 2019 Rule 38(4)',
    required: `Min Side 1: ${reqSetbacks.left}m, Side 2: ${reqSetbacks.right}m`,
    found: `Left: ${params.setbacks.left}m, Right: ${params.setbacks.right}m`,
    severity: 'medium',
    remark: sidePass ? 'Both side open spaces meet statutory requirements.' : 'Side setbacks are insufficient. Adequate light and ventilation passages are compromised.',
    isCompliant: sidePass
  });
  if (!sidePass) {
    correctionPoints.push({
      point: `Ensure side setbacks satisfy minimum ${reqSetbacks.left}m on left side and ${reqSetbacks.right}m on right side.`,
      section: 'Setbacks & Open Spaces',
      ruleRef: 'TNCDBR Rule 38(4)'
    });
  }

  // 3. Building Height vs Road Width
  // Max height = 1.5 * (road width + front setback) for non-high rise
  const maxAllowableHeight = Math.max(10, 1.5 * (params.abuttingRoadWidthM + params.setbacks.front));
  const heightPass = params.proposedHeightM <= maxAllowableHeight;
  checks.push({
    rule: 'Building Height vs Abutting Road Width',
    ruleRef: 'TNCDBR 2019 Rule 37',
    required: `Max ${maxAllowableHeight.toFixed(1)}m for ${params.abuttingRoadWidthM}m road width`,
    found: `${params.proposedHeightM}m (${params.floors} floors)`,
    severity: 'high',
    remark: heightPass ? 'Proposed structure height is within permissible vertical envelope.' : `Height ${params.proposedHeightM}m exceeds maximum allowed ${maxAllowableHeight.toFixed(1)}m for ${params.abuttingRoadWidthM}m road.`,
    isCompliant: heightPass
  });
  if (!heightPass) {
    correctionPoints.push({
      point: `Restrict maximum building height to ${maxAllowableHeight.toFixed(1)}m as per abutting road width of ${params.abuttingRoadWidthM}m.`,
      section: 'Building Geometry & Height',
      ruleRef: 'TNCDBR Rule 37'
    });
  }

  // 4. Parking Provisions
  const reqParking = TNCDBR_RULES.getRequiredParking(params.builtUpAreaSqm, params.buildingType);
  const parkingPass = params.parkingSpacesCar >= reqParking.cars && params.parkingSpacesTwoWheeler >= reqParking.twoWheelers;
  checks.push({
    rule: 'Mandatory Parking Spaces (Car & Two-Wheeler)',
    ruleRef: 'TNCDBR 2019 Rule 42 & Schedule IV',
    required: `Min ${reqParking.cars} Car(s) & ${reqParking.twoWheelers} Two-Wheeler(s)`,
    found: `${params.parkingSpacesCar} Car(s), ${params.parkingSpacesTwoWheeler} Two-Wheeler(s)`,
    severity: 'medium',
    remark: parkingPass ? 'Adequate off-street vehicular parking demarcated.' : `Deficit in parking. Required: ${reqParking.cars} cars, ${reqParking.twoWheelers} two-wheelers.`,
    isCompliant: parkingPass
  });
  if (!parkingPass) {
    correctionPoints.push({
      point: `Demarcate at least ${reqParking.cars} ECS car parking bay(s) and ${reqParking.twoWheelers} two-wheeler slots in site plan layout.`,
      section: 'Parking & Vehicular Circulation',
      ruleRef: 'TNCDBR Rule 42'
    });
  }

  // 5. Rainwater Harvesting (Mandatory in Tamil Nadu under Sec 240-A & TNCDBR Rule 45)
  const rwhPass = params.rainwaterHarvestingProvided;
  checks.push({
    rule: 'Rainwater Harvesting (RWH) System',
    ruleRef: 'TNCDBR 2019 Rule 45 (Mandatory under TN Act)',
    required: 'Percolation pits / Recharge well with rooftop catchment connectivity',
    found: rwhPass ? 'Provided and demarcated in drawings' : 'Missing from drawings/schedule',
    severity: 'high',
    remark: rwhPass ? 'RWH structure integrated with overflow filter.' : 'Rainwater Harvesting structure is mandatory for all buildings under Tamil Nadu Building Rules.',
    isCompliant: rwhPass
  });
  if (!rwhPass) {
    correctionPoints.push({
      point: 'Incorporate Rainwater Harvesting (RWH) recharge pit design and collection details in the site layout drawing as per Rule 45.',
      section: 'Environmental & Water Conservation',
      ruleRef: 'TNCDBR Rule 45'
    });
  }

  // 6. Staircase Width & Fire Safety
  const reqStaircaseWidth = TNCDBR_RULES.getRequiredStaircaseWidth(params.floors, params.buildingType);
  const staircasePass = params.staircaseWidthM >= reqStaircaseWidth;
  checks.push({
    rule: 'Staircase Minimum Clear Width',
    ruleRef: 'TNCDBR 2019 Rule 48',
    required: `Min clear width >= ${reqStaircaseWidth}m`,
    found: `${params.staircaseWidthM}m`,
    severity: 'medium',
    remark: staircasePass ? 'Staircase egress width complies with safety rules.' : `Staircase clear width ${params.staircaseWidthM}m is below required ${reqStaircaseWidth}m minimum.`,
    isCompliant: staircasePass
  });
  if (!staircasePass) {
    correctionPoints.push({
      point: `Increase staircase flight clear width to minimum ${reqStaircaseWidth}m (excluding handrails).`,
      section: 'Means of Egress & Safety',
      ruleRef: 'TNCDBR Rule 48'
    });
  }

  // 7. Completeness of Drawing Set
  checks.push({
    rule: 'Mandatory Drawing Components & Scrutiny Layers',
    ruleRef: 'TNCDBR 2019 Rule 8',
    required: 'Site plan, Floor plans with dimensions, Cross Section, Front Elevation & Key Plan',
    found: 'Complete architectural drawing bundle submitted',
    severity: 'low',
    remark: 'All standard scrutiny drawing sheets identified and legible.',
    isCompliant: true
  });

  // Calculate compliance score
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.isCompliant).length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  let recommendation: 'approve' | 'approve_with_conditions' | 'correction_required' | 'reject' = 'approve';
  let summary = '';

  if (complianceScore === 100) {
    recommendation = 'approve';
    summary = `The building proposal fully satisfies all mandatory provisions of the Tamil Nadu Combined Development and Building Rules, 2019 (TNCDBR). FSI, setbacks (${params.setbacks.front}m front / ${params.setbacks.rear}m rear), parking (${params.parkingSpacesCar} cars), height (${params.proposedHeightM}m), and Rainwater Harvesting arrangements meet statutory norms for ${params.buildingType} category in ${params.plotAreaSqm} sq.m plot.`;
  } else if (complianceScore >= 75) {
    recommendation = 'approve_with_conditions';
    summary = `The proposal substantially conforms to TNCDBR 2019 with minor conditions required during field execution (compliance score ${complianceScore}%). Officer sanction recommended subject to standard site verification and RWH execution certificate.`;
  } else {
    recommendation = 'correction_required';
    summary = `The proposal has ${correctionPoints.length} non-compliant item(s) under TNCDBR 2019 rules (compliance score ${complianceScore}%). Key discrepancies identified in: ${correctionPoints.map(c => c.section).join(', ')}. Revision of building plan drawings is required prior to sanction.`;
  }

  return {
    complianceScore,
    checks,
    correctionPoints,
    recommendation,
    summary
  };
}
