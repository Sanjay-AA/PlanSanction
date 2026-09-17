import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApplications, useCurrentUser } from '../../services/store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceGauge } from '../../components/common/ComplianceGauge';
import { PlanDocumentViewer } from '../../components/common/PlanDocumentViewer';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft,
  FileCheck2,
  Info,
  Loader2,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlanReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, approveApplication, raiseCorrections, rejectApplication } = useApplications();
  const { currentUser } = useCurrentUser();

  const app = applications.find(a => a.id === id || a.applicationNo === id);

  const [activeTab, setActiveTab] = useState<'ai_report' | 'actions' | 'drawing_meta'>('ai_report');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable Correction Points
  const initialCorrections = app?.aiReport?.correctionPoints?.map((cp, idx) => ({
    id: `cp-${idx + 1}`,
    point: cp.point,
    section: cp.section,
    ruleRef: cp.ruleRef || 'TNCDBR 2019'
  })) || [
    { id: 'cp-1', point: 'Increase front setback to mandatory 3.0m under Rule 38', section: 'Setbacks & Open Spaces', ruleRef: 'TNCDBR Rule 38(2)' }
  ];

  const [editableCorrections, setEditableCorrections] = useState(initialCorrections);
  const [newCorrectionPoint, setNewCorrectionPoint] = useState('');
  const [newCorrectionSection, setNewCorrectionSection] = useState('Setbacks & Open Spaces');

  // Decision Modals / States
  const [rejectionReason, setRejectionReason] = useState('Non-conformance with mandatory road width and FSI parameters under TNCDBR 2019 Rule 35.');
  const [conditions, setConditions] = useState<string[]>([
    'Mandatory Rainwater Harvesting percolation pits must be constructed prior to plinth stage.',
    'Setback spaces must be maintained without any permanent structural encroachment.',
    'Clear access for fire safety tender vehicle must be preserved on abutting road frontage.'
  ]);
  const [newCondition, setNewCondition] = useState('');

  if (!app) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested permit record does not exist or has been archived.</p>
        <Link to="/officer/applications" className="mt-4 inline-flex items-center space-x-1 text-xs text-blue-700 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications Queue</span>
        </Link>
      </div>
    );
  }

  // Add a correction point
  const handleAddCorrection = () => {
    if (!newCorrectionPoint.trim()) return;
    setEditableCorrections(prev => [
      ...prev,
      {
        id: `cp-custom-${Date.now()}`,
        point: newCorrectionPoint.trim(),
        section: newCorrectionSection,
        ruleRef: 'TNCDBR 2019'
      }
    ]);
    setNewCorrectionPoint('');
  };

  const handleRemoveCorrection = (cid: string) => {
    setEditableCorrections(prev => prev.filter(c => c.id !== cid));
  };

  // Actions
  const handleApprove = async (withConditions: boolean = false) => {
    setIsProcessing(true);
    try {
      const finalConditions = withConditions ? conditions : [];
      await approveApplication(app.id, currentUser.name, finalConditions);

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      setSuccessMessage('Building Plan Sanction Order successfully approved and digitally sealed!');
    } catch (err) {
      console.error(err);
      alert('Error approving application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRaiseCorrections = async () => {
    if (editableCorrections.length === 0) {
      alert('Please specify at least one correction item before issuing notice.');
      return;
    }
    setIsProcessing(true);
    try {
      await raiseCorrections(app.id, editableCorrections, currentUser.name);
      setSuccessMessage('Correction notice issued and dispatched to applicant.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a statutory reason for rejection.');
      return;
    }
    if (!confirm('Are you sure you want to reject this building permit application?')) return;

    setIsProcessing(true);
    try {
      await rejectApplication(app.id, rejectionReason, currentUser.name);
      setSuccessMessage('Application formally rejected under TNCDBR rules.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/officer/applications"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Back to queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-base">{app.applicationNo}</span>
              <StatusBadge status={app.status} size="sm" />
              <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {app.buildingType}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Applicant: <strong className="text-slate-800">{app.applicantName}</strong> • S.No. {app.plotDetails.surveyNo}, {app.plotDetails.taluk} Taluk
            </div>
          </div>
        </div>

        {/* Quick Certificate Link if already approved */}
        {app.status === 'approved' && (
          <Link
            to={`/verify/${encodeURIComponent(app.applicationNo)}`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>View Sanction Permit (QR)</span>
          </Link>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Split Layout: Left = Drawing Viewer | Right = AI Scrutiny & Officer Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: CAD & PDF Plan Document Viewer (7 cols) */}
        <div className="lg:col-span-7 h-[700px] flex flex-col">
          <PlanDocumentViewer files={app.files} />
        </div>

        {/* RIGHT PANE: AI Scrutiny Report & Decision Desk (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          {/* Top Scrutiny Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                TNCDBR Scrutiny & Decision Desk
              </h3>
            </div>

            {app.aiReport && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-600 rounded">
                Score: {app.aiReport.complianceScore}%
              </span>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setActiveTab('ai_report')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'ai_report'
                  ? 'border-blue-700 text-blue-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              AI Scrutiny ({app.aiReport?.checks?.length || 0} Rules)
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'actions'
                  ? 'border-blue-700 text-blue-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Officer Action Desk
            </button>
            <button
              onClick={() => setActiveTab('drawing_meta')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'drawing_meta'
                  ? 'border-blue-700 text-blue-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Site Specs
            </button>
          </div>

          {/* Advisory Notice */}
          <div className="p-2.5 bg-amber-50/80 border-b border-amber-200 flex items-start space-x-2 text-[11px] text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Advisory Notice:</strong> AI scrutiny is a technical decision support tool. Final statutory permit sanction rests with the Planning Officer.
            </span>
          </div>

          {/* TAB 1: AI Scrutiny Breakdown */}
          {activeTab === 'ai_report' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {app.aiReport ? (
                <>
                  {/* Gauge & Recommendation Card */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        AI Recommendation
                      </span>
                      <div className="text-xs font-bold text-slate-900 capitalize mt-0.5">
                        {app.aiReport.recommendation.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Scrutinized under TNCDBR 2019
                      </div>
                    </div>
                    <ComplianceGauge score={app.aiReport.complianceScore} size="sm" />
                  </div>

                  {/* Summary */}
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                    <strong className="text-slate-900 block mb-0.5">Scrutiny Summary:</strong>
                    {app.aiReport.summary}
                  </div>

                  {/* List of Rule Checks */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Statutory Rule Scrutiny Matrix
                    </h4>

                    {app.aiReport.checks?.map((check, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs transition-colors ${
                          check.status === 'pass'
                            ? 'bg-white border-slate-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                            {check.status === 'pass' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <span className="text-[11px]">{check.rule}</span>
                          </div>

                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                            check.status === 'pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {check.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-600 space-y-0.5 font-mono pl-5">
                          <div>Req: {check.required}</div>
                          <div>Found: {check.found}</div>
                          <div className="font-sans italic text-slate-500 mt-0.5">{check.remark}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">AI Scrutiny in progress...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Officer Actions & Correction Editor */}
          {activeTab === 'actions' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Correction Points Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Correction Points ({editableCorrections.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Editable by Officer</span>
                </div>

                <div className="space-y-2">
                  {editableCorrections.map((corr) => (
                    <div
                      key={corr.id}
                      className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-amber-900 block text-[11px]">{corr.section}</span>
                        <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">{corr.point}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCorrection(corr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete correction point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new correction point */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700">Add Custom Scrutiny Correction:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Correction detail..."
                      value={newCorrectionPoint}
                      onChange={(e) => setNewCorrectionPoint(e.target.value)}
                      className="col-span-2 text-xs p-1.5 rounded border border-slate-300 focus:outline-none"
                    />
                    <select
                      value={newCorrectionSection}
                      onChange={(e) => setNewCorrectionSection(e.target.value)}
                      className="col-span-2 text-xs p-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Setbacks & Open Spaces">Setbacks & Open Spaces</option>
                      <option value="Built-Up Area & FSI">Built-Up Area & FSI</option>
                      <option value="Building Geometry & Height">Building Geometry & Height</option>
                      <option value="Parking & Vehicular Circulation">Parking & Vehicular Circulation</option>
                      <option value="Environmental & Rainwater Harvesting">Environmental & Rainwater Harvesting</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCorrection}
                    className="w-full py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Correction Item</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-900 uppercase">Statutory Sanction Actions</div>

                {/* 1. Approve Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApprove(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating QR Permit Order...' : 'Approve & Issue Sanction Order'}</span>
                </button>

                {/* 2. Approve with conditions */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApprove(true)}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve with Standard Conditions</span>
                </button>

                {/* 3. Raise Corrections */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRaiseCorrections}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Issue Correction Notice ({editableCorrections.length})</span>
                </button>

                {/* 4. Reject */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Site & Building Specs */}
          {activeTab === 'drawing_meta' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-blue-900 uppercase text-[11px]">Site Coordinates</div>
                <div><strong>Taluk / Region:</strong> {app.plotDetails.taluk}</div>
                <div><strong>Survey Number:</strong> {app.plotDetails.surveyNo} ({app.plotDetails.ward})</div>
                <div><strong>Site Address:</strong> {app.plotDetails.street}, {app.plotDetails.village}</div>
                <div><strong>Abutting Road:</strong> {app.plotDetails.abuttingRoadWidthM} metres</div>
                <div><strong>Plot Frontage:</strong> {app.plotDetails.frontageM} metres</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-blue-900 uppercase text-[11px]">Building Dimensions</div>
                <div><strong>Plot Extent:</strong> {app.plotAreaSqm} sq.m</div>
                <div><strong>Built-Up Area:</strong> {app.builtUpAreaSqm} sq.m</div>
                <div><strong>FSI Calculated:</strong> {app.fsi || (app.builtUpAreaSqm / app.plotAreaSqm).toFixed(2)}</div>
                <div><strong>Floors & Height:</strong> G+{app.floors - 1} ({app.proposedHeightM}m)</div>
                <div><strong>Front Setback:</strong> {app.setbacks.front}m | <strong>Rear:</strong> {app.setbacks.rear}m</div>
                <div><strong>Left Setback:</strong> {app.setbacks.left}m | <strong>Right:</strong> {app.setbacks.right}m</div>
                <div><strong>Parking:</strong> {app.parkingSpacesCar} Car(s), {app.parkingSpacesTwoWheeler} 2-Wheeler(s)</div>
                <div><strong>Rainwater Harvesting:</strong> {app.rainwaterHarvestingProvided ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
