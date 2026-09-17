import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { BuildingApplication } from '../types';

export async function generateSanctionCertificate(
  app: BuildingApplication,
  officerName: string = 'K. Ramesh, B.E. (Civil)',
  officerDesignation: string = 'Executive Engineer / Planning Officer'
): Promise<{ blob: Blob; dataUrl: string; filename: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Decorative Borders (Government of Tamil Nadu Official Border)
  doc.setDrawColor(11, 37, 69); // Deep Navy
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(194, 155, 56); // Gold inner border
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 2. Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(11, 37, 69);
  doc.text('GOVERNMENT OF TAMIL NADU', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(120, 30, 30); // Tamil Nadu Maroon
  doc.text('DIRECTORATE OF TOWN AND COUNTRY PLANNING / LOCAL PLANNING AUTHORITY', pageWidth / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`${app.plotDetails.taluk.toUpperCase()} MUNICIPALITY / TALUK JURISDICTION, ${app.plotDetails.district.toUpperCase()} DISTRICT`, pageWidth / 2, 27.5, { align: 'center' });

  doc.setDrawColor(194, 155, 56);
  doc.setLineWidth(0.6);
  doc.line(15, 30.5, pageWidth - 15, 30.5);

  // 3. Sanction Certificate Title Banner
  doc.setFillColor(11, 37, 69);
  doc.rect(25, 33, pageWidth - 50, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BUILDING PLAN SANCTION ORDER / PERMIT', pageWidth / 2, 38.5, { align: 'center' });

  // 4. Sanction Order Meta Block
  const sanctionNo = app.sanctionOrderNo || `TN/NMK/${app.plotDetails.taluk.substring(0, 3).toUpperCase()}/BLD/${new Date().getFullYear()}/${app.applicationNo.split('/').pop() || '0001'}`;
  const approvalDate = app.decidedAt ? new Date(app.decidedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`Sanction Order No: `, 16, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(sanctionNo, 46, 46);

  doc.setFont('helvetica', 'bold');
  doc.text(`Sanction Date: `, pageWidth - 65, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(approvalDate, pageWidth - 42, 46);

  doc.setFont('helvetica', 'bold');
  doc.text(`Application No: `, 16, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(app.applicationNo, 46, 51);

  doc.setFont('helvetica', 'bold');
  doc.text(`Category: `, pageWidth - 65, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(app.buildingType.toUpperCase(), pageWidth - 42, 51);

  // 5. Preamble text
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  const preamble = `In exercise of the powers conferred under the Tamil Nadu Combined Development and Building Rules 2019 and relevant Municipal Acts, planning permission and building permit is hereby GRANTED to the applicant named below for proposed construction in accordance with the sanctioned drawings subject to statutory conditions.`;
  doc.text(preamble, 16, 57, { maxWidth: pageWidth - 32, align: 'justify' });

  // 6. Applicant & Plot Details Table
  autoTable(doc, {
    startY: 65,
    margin: { left: 16, right: 16 },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8, textColor: [30, 41, 59] },
    headStyles: { fillColor: [19, 58, 107], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42, fillColor: [248, 250, 252] },
      1: { cellWidth: 48 },
      2: { fontStyle: 'bold', cellWidth: 42, fillColor: [248, 250, 252] },
      3: { cellWidth: 46 },
    },
    body: [
      [
        'Applicant Name',
        app.applicantName,
        'Survey / Ward No.',
        `S.No. ${app.plotDetails.surveyNo}, Ward ${app.plotDetails.ward}`
      ],
      [
        'Taluk / Municipality',
        `${app.plotDetails.taluk}, Namakkal`,
        'Site Address',
        `${app.plotDetails.street || 'Main Road'}, ${app.plotDetails.village}`
      ],
      [
        'Plot Extent (Total Area)',
        `${app.plotAreaSqm} sq.m (${(app.plotAreaSqm * 10.7639).toFixed(0)} sq.ft)`,
        'Approved Built-Up Area',
        `${app.builtUpAreaSqm} sq.m`
      ],
      [
        'Number of Floors',
        `G + ${Math.max(0, app.floors - 1)} Floors (${app.floors} Levels)`,
        'Max Height Sanctioned',
        `${app.proposedHeightM} metres`
      ],
      [
        'Floor Space Index (FSI)',
        `${app.fsi || (app.builtUpAreaSqm / app.plotAreaSqm).toFixed(2)} (Permitted)`,
        'Abutting Road Width',
        `${app.plotDetails.abuttingRoadWidthM} metres`
      ],
      [
        'Mandatory Setbacks',
        `Front: ${app.setbacks.front}m | Rear: ${app.setbacks.rear}m`,
        'Side Setbacks',
        `Left: ${app.setbacks.left}m | Right: ${app.setbacks.right}m`
      ],
      [
        'Rainwater Harvesting',
        'Mandatory RWH Percolation Pit Approved',
        'Parking Earmarked',
        `${app.parkingSpacesCar} Car, ${app.parkingSpacesTwoWheeler} 2-Wheeler bay(s)`
      ]
    ]
  });

  // 7. Mandatory Sanction Conditions
  let finalY = (doc as any).lastAutoTable.finalY + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 37, 69);
  doc.text('MANDATORY STATUTORY CONDITIONS:', 16, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(70, 70, 70);

  const conditions = [
    '1. Construction must strictly adhere to sanctioned drawings and TNCDBR 2019 specifications without deviation.',
    '2. Rainwater Harvesting (RWH) structures must be constructed before the plinth completion stage as per Rule 45.',
    '3. Setbacks must be kept clear of any permanent or temporary obstructions, overhangs, or cantilever projections.',
    '4. Notice of commencement shall be submitted to the Planning Authority before starting excavation work on site.',
    '5. This permit is valid for 3 (three) years from the date of sanction and renewable as per statutory provisions.'
  ];

  let condY = finalY + 4;
  conditions.forEach((cond) => {
    doc.text(cond, 16, condY);
    condY += 3.4;
  });

  // 8. Generate and Draw QR Code for Verification
  const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(app.applicationNo)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 140,
    color: {
      dark: '#0b2545',
      light: '#ffffff'
    }
  });

  doc.addImage(qrDataUrl, 'PNG', 16, condY + 2, 24, 24);

  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN TO VERIFY SANCTION', 16, condY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('Tamper-proof digital validation key', 16, condY + 31);
  doc.text(app.id.substring(0, 16).toUpperCase(), 16, condY + 33.5);

  // 9. Digital Signature & Officer Seal on Bottom Right
  doc.setDrawColor(194, 155, 56);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - 85, condY + 2, 69, 28, 2, 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(11, 37, 69);
  doc.text('DIGITALLY SANCTIONED & SIGNED', pageWidth - 50.5, condY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Officer: ${officerName}`, pageWidth - 50.5, condY + 12, { align: 'center' });
  doc.text(officerDesignation, pageWidth - 50.5, condY + 16, { align: 'center' });
  doc.text(`${app.plotDetails.taluk} Municipality / Planning Authority`, pageWidth - 50.5, condY + 20, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Authenticated via PlanSanction TN on ${new Date().toISOString()}`, pageWidth - 50.5, condY + 25, { align: 'center' });

  // 10. Watermark Seal in the background center
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(240, 243, 248);
  doc.text('SANCTIONED', pageWidth / 2, 175, { align: 'center', angle: 30 });

  const pdfBlob = doc.output('blob');
  const pdfDataUrl = doc.output('dataurlstring');
  const filename = `Sanction_Permit_${app.applicationNo.replace(/\//g, '_')}.pdf`;

  return {
    blob: pdfBlob,
    dataUrl: pdfDataUrl,
    filename,
  };
}
