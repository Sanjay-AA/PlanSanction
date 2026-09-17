import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApplications, useCurrentUser } from '../../services/store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplianceGauge } from '../../components/common/ComplianceGauge';
import { PlanDocumentViewer } from '../../components/common/PlanDocumentViewer';
import { UploadedPlanFile } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download, 
  UploadCloud, 
  Sparkles, 
  UserCheck, 
  Search, 
  ChevronRight, 
  FileCheck2,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const StatusTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { applications, reUploadRevisedDrawings } = useApplications();
  const { currentUser } = useCurrentUser();

  const queryAppNo = searchParams.get('app');
  const [searchInput, setSearchInput] = useState(queryAppNo || '');
  const [revisedFiles, setRevisedFiles] = useState<UploadedPlanFile[]>([]);
  const [revisionNote, setRevisionNote] = useState('');
  const [isReuploading, setIsReuploading] = useState(false);
  const [reuploadSuccess, setReuploadSuccess] = useState(false);

  // Selected application
  const myApps = applications.filter(a => a.applicantId === currentUser.uid || a.applicantName.toLowerCase().includes('murugesan'));
  const selectedApp = (queryAppNo ? applications.find(a => a.applicationNo === queryAppNo || a.id === queryAppNo) : myApps[0]) || applications[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ app: searchInput.trim() });
    }
  };

  const handleRevisedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list: UploadedPlanFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop()?.toLowerCase() as any;
      list.push({
        name: f.name,
        type: ext === 'pdf' ? 'pdf' : ext === 'dxf' ? 'dxf' : 'dwg',
        storagePath: `plans/revised/${f.name}`,
        sizeBytes: f.size,
        uploadedAt: new Date().toISOString(),
        url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'
      });
    }
    setRevisedFiles(list);
  };

  const handleSubmittingRevisedDrawings = async () => {
    if (revisedFiles.length === 0) {
      alert('Please select the revised drawing file (PDF/DXF) before submitting.');
      return;
    }

    setIsReuploading(true);
    try {
      reUploadRevisedDrawings(selectedApp.id, revisedFiles, revisionNote);
      setReuploadSuccess(true);
      setRevisedFiles([]);
      setRevisionNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReuploading(false);
    }
  };

  const getStepStatus = (stepKey: string) => {
    if (!selectedApp) return 'pending';
    const s = selectedApp.status;

    if (stepKey === 'submitted') return 'completed';
    if (stepKey === 'ai_review') {
      if (s === 'submitted') return 'pending';
      if (s === 'under_ai_review') return 'current';
      return 'completed';
    }
    if (stepKey === 'officer_review') {
      if (s === 'submitted' || s === 'under_ai_review') return 'pending';
      if (s === 'officer_review') return 'current';
      return 'completed';
    }
    if (stepKey === 'decision') {
      if (s === 'approved') return 'approved';
      if (s === 'correction_required') return 'correction_required';
      if (s === 'rejected') return 'rejected';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Search and Application Switcher Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Application No (e.g. NMK/TCG/2026/0101)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shrink-0"
          >
            Track
          </button>
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Your Permits:</span>
          {myApps.slice(0, 3).map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSearchParams({ app: app.applicationNo });
                setSearchInput(app.applicationNo);
              }}
              className={`text-xs px-2.5 py-1 rounded font-mono transition-colors whitespace-nowrap ${
                selectedApp?.id === app.id
                  ? 'bg-blue-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {app.applicationNo.split('/').slice(1).join('/')}
            </button>
          ))}
        </div>
      </div>

      {selectedApp ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vertical Stepper & Timeline */}
          <div className="space-y-6">
            {/* Status Card Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Sanction Tracking Desk
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {selectedApp.applicationNo}
                  </h3>
                </div>
                <StatusBadge status={selectedApp.status} size="md" />
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-800">{selectedApp.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span>S.No {selectedApp.plotDetails.surveyNo}, {selectedApp.plotDetails.taluk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Building Type:</span>
                  <span className="capitalize font-medium">{selectedApp.buildingType} (G+{selectedApp.floors - 1})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Built-Up Area:</span>
                  <span className="font-mono">{selectedApp.builtUpAreaSqm} sq.m</span>
                </div>
              </div>

              {selectedApp.status === 'approved' && (
                <Link
                  to={`/verify/${encodeURIComponent(selectedApp.applicationNo)}`}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Download Sanction Order Permit</span>
                </Link>
              )}
            </div>

            {/* Vertical Progress Stepper */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Permit Approval Progress Stepper
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Step 1: Application Submitted */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Application Submitted</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(selectedApp.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Fee paid and drawings registered in Namakkal municipal registry.
                    </p>
                  </div>
                </div>

                {/* Step 2: AI Scrutiny Evaluation */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    getStepStatus('ai_review') === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : getStepStatus('ai_review') === 'current'
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {getStepStatus('ai_review') === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>TNCDBR AI Scrutiny Engine</span>
                      {selectedApp.aiReport && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.2 rounded">
                          Score: {selectedApp.aiReport.complianceScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Automated rule checks against Tamil Nadu Combined Building Rules 2019.
                    </p>
                  </div>
                </div>

                {/* Step 3: Town Planning Officer Verification */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    getStepStatus('officer_review') === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : getStepStatus('officer_review') === 'current'
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {getStepStatus('officer_review') === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Officer Technical Inspection</div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {selectedApp.assignedOfficerName || `${selectedApp.plotDetails.taluk} Planning Officer`} technical scrutiny.
                    </p>
                  </div>
                </div>

                {/* Step 4: Final Decision */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    selectedApp.status === 'approved'
                      ? 'bg-emerald-500 text-white'
                      : selectedApp.status === 'correction_required'
                      ? 'bg-amber-500 text-white'
                      : selectedApp.status === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {selectedApp.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {selectedApp.status === 'correction_required' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {selectedApp.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                    {selectedApp.status !== 'approved' && selectedApp.status !== 'correction_required' && selectedApp.status !== 'rejected' && (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {selectedApp.status === 'approved'
                        ? 'Sanction Order Issued'
                        : selectedApp.status === 'correction_required'
                        ? 'Corrections Required'
                        : selectedApp.status === 'rejected'
                        ? 'Application Rejected'
                        : 'Final Sanction Determination'}
                    </div>
                    {selectedApp.decidedAt && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(selectedApp.decidedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Audit Trail Timeline */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Official Action Log
              </h4>
              <div className="space-y-3">
                {selectedApp.timeline.map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                      <span>{entry.actorName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(entry.at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Report & Correction Remediation / Drawing Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {/* CORRECTION REMEDIATION PANEL (If correction_required) */}
            {selectedApp.status === 'correction_required' && (
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Officer Correction Notice ({selectedApp.corrections.length} Items Required)
                      </h4>
                      <p className="text-xs text-amber-800">
                        Please review the non-compliant items below, modify your architectural drawings, and re-upload the revised plan.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-2.5 py-1 rounded-full">
                    Action Required
                  </span>
                </div>

                {/* List of corrections */}
                <div className="space-y-2.5">
                  {selectedApp.corrections.map((corr, idx) => (
                    <div
                      key={corr.id || idx}
                      className="p-3.5 bg-white rounded-lg border border-amber-200 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          {corr.section}
                        </span>
                        {corr.ruleRef && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                            {corr.ruleRef}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 pl-6 leading-relaxed">
                        {corr.point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Re-upload Area */}
                <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Re-upload Revised Drawings (PDF / DXF)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select Revised CAD/PDF File
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.dxf,.dwg"
                        multiple
                        onChange={handleRevisedUpload}
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Architect Revision Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Setbacks adjusted to 3.0m and RWH details added"
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {revisedFiles.length > 0 && (
                    <div className="text-xs text-emerald-700 font-medium">
                      ✓ {revisedFiles.length} revised file(s) ready for scrutiny
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isReuploading || revisedFiles.length === 0}
                      onClick={handleSubmittingRevisedDrawings}
                      className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isReuploading ? 'Processing AI Re-Scrutiny...' : 'Submit Revised Drawings for AI Re-Scrutiny'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI SCRUTINY REPORT CARD */}
            {selectedApp.aiReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        TNCDBR 2019 Scrutiny Evaluation Report
                      </h3>
                      <p className="text-xs text-slate-500">
                        Scrutinized via {selectedApp.aiReport.model || 'Gemini 2.0 Flash'} on {new Date(selectedApp.aiReport.analyzedAt || selectedApp.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <ComplianceGauge
                    score={selectedApp.aiReport.complianceScore}
                    recommendation={selectedApp.aiReport.recommendation}
                    size="md"
                  />
                </div>

                {/* Executive Summary */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Executive Scrutiny Summary:</strong>
                  {selectedApp.aiReport.summary}
                </div>

                {/* Scrutiny Checks Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Statutory Rule Scrutiny Breakdown ({selectedApp.aiReport.checks?.length || 0} Provisions)
                  </h4>

                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
                    {selectedApp.aiReport.checks?.map((check, idx) => (
                      <div key={idx} className="p-3.5 hover:bg-slate-50 text-xs transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-2">
                            {check.status === 'pass' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : check.status === 'fail' ? (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900">{check.rule}</span>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                              {check.ruleRef}
                            </span>
                          </div>

                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize self-start sm:self-auto ${
                            check.status === 'pass'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : check.status === 'fail'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {check.status === 'pass' ? 'Passed' : check.status === 'fail' ? 'Non-Compliant' : 'Manual Check'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pl-6 mb-1 font-mono">
                          <div><strong className="font-sans text-slate-500">Statutory Norm:</strong> {check.required}</div>
                          <div><strong className="font-sans text-slate-500">Proposed in Plan:</strong> {check.found}</div>
                        </div>

                        <div className="text-[11px] text-slate-500 pl-6 italic">
                          {check.remark}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Drawing Previewer Pane */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Submitted Drawing Sheets & CAD Vector Inspector
              </h4>
              <PlanDocumentViewer files={selectedApp.files} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Application Selected</h3>
          <p className="text-xs text-slate-500 mt-1">Please enter an application number above to track permit progress.</p>
        </div>
      )}
    </div>
  );
};
