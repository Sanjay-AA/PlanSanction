import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useApplications } from '../../services/store';
import { generateSanctionCertificate } from '../../services/certificateGenerator';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  FileCheck2, 
  Building2, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Printer
} from 'lucide-react';

export const VerifyCertificate: React.FC = () => {
  const { applicationNo: paramAppNo } = useParams<{ applicationNo?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { applications } = useApplications();

  const targetAppNo = paramAppNo || searchParams.get('app') || '';
  const [searchInput, setSearchInput] = useState(targetAppNo);

  const matchedApp = targetAppNo 
    ? applications.find(a => 
        a.applicationNo.toLowerCase() === targetAppNo.toLowerCase() ||
        a.id.toLowerCase() === targetAppNo.toLowerCase() ||
        (a.sanctionOrderNo && a.sanctionOrderNo.toLowerCase() === targetAppNo.toLowerCase())
      ) 
    : undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ app: searchInput.trim() });
    }
  };

  const handleDownloadPDF = async () => {
    if (!matchedApp) return;
    try {
      const result = await generateSanctionCertificate(matchedApp);
      const link = document.createElement('a');
      link.href = result.dataUrl;
      link.download = result.filename;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error downloading certificate.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Verification Header */}
      <div className="bg-[#0b2545] text-white p-6 sm:p-8 rounded-xl border border-slate-700 shadow-md text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-7 h-7 text-amber-400" />
        </div>
        <div className="text-xs uppercase tracking-widest font-semibold text-amber-300">
          Government of Tamil Nadu • Local Planning Authority
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          Public Building Plan Sanction Verification Portal
        </h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Scan QR code on physical sanction order sheets or enter Application / Sanction Order No to verify authenticity.
        </p>

        {/* Verification search input */}
        <form onSubmit={handleSearch} className="pt-4 max-w-md mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Enter Application No (e.g. NMK/TCG/2026/0101)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {matchedApp ? (
        matchedApp.status === 'approved' ? (
          /* APPROVED / AUTHENTIC CERTIFICATE DISPLAY */
          <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-lg p-6 sm:p-8 space-y-6">
            {/* Stamp Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Official DTCP Sanction Permit: Verified & Valid
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {matchedApp.sanctionOrderNo || `TN/NMK/${matchedApp.plotDetails.taluk.substring(0, 3).toUpperCase()}/BLD/2026/${matchedApp.applicationNo.split('/').pop()}`}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Sanction PDF</span>
              </button>
            </div>

            {/* Structured Permit Sanction Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 uppercase">Sanction Permittee</div>
                <div className="space-y-1 text-slate-700">
                  <div><strong>Applicant Name:</strong> {matchedApp.applicantName}</div>
                  <div><strong>Application No:</strong> <span className="font-mono">{matchedApp.applicationNo}</span></div>
                  <div><strong>Sanction Date:</strong> {new Date(matchedApp.decidedAt || matchedApp.submittedAt).toLocaleDateString('en-GB')}</div>
                  <div><strong>Permit Validity:</strong> 3 Years (Until {new Date(new Date(matchedApp.decidedAt || matchedApp.submittedAt).setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-GB')})</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 uppercase">Site & Taluk Jurisdiction</div>
                <div className="space-y-1 text-slate-700">
                  <div><strong>Taluk / Municipality:</strong> {matchedApp.plotDetails.taluk}, Namakkal</div>
                  <div><strong>Revenue Survey No:</strong> S.No. {matchedApp.plotDetails.surveyNo} ({matchedApp.plotDetails.ward})</div>
                  <div><strong>Street Location:</strong> {matchedApp.plotDetails.street || 'Main Road'}</div>
                  <div><strong>Abutting Road Width:</strong> {matchedApp.plotDetails.abuttingRoadWidthM} metres</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 uppercase">Approved Architectural Extent</div>
                <div className="space-y-1 text-slate-700">
                  <div><strong>Building Category:</strong> <span className="capitalize">{matchedApp.buildingType}</span></div>
                  <div><strong>Approved Floors:</strong> G + {Math.max(0, matchedApp.floors - 1)} Floors ({matchedApp.proposedHeightM}m)</div>
                  <div><strong>Plot Area:</strong> {matchedApp.plotAreaSqm} sq.m (~{(matchedApp.plotAreaSqm * 10.7639).toFixed(0)} sq.ft)</div>
                  <div><strong>Approved Built-Up:</strong> {matchedApp.builtUpAreaSqm} sq.m (FSI: {matchedApp.fsi})</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 uppercase">Sanction Clearances & RWH</div>
                <div className="space-y-1 text-slate-700">
                  <div><strong>Front Setback:</strong> {matchedApp.setbacks.front}m | <strong>Rear:</strong> {matchedApp.setbacks.rear}m</div>
                  <div><strong>Side Yards:</strong> Left: {matchedApp.setbacks.left}m, Right: {matchedApp.setbacks.right}m</div>
                  <div><strong>Rainwater Harvesting:</strong> <span className="text-emerald-700 font-bold">Mandatory RWH Approved</span></div>
                  <div><strong>Parking:</strong> {matchedApp.parkingSpacesCar} Car, {matchedApp.parkingSpacesTwoWheeler} Two-Wheeler(s)</div>
                </div>
              </div>
            </div>

            {/* Official Digital Signature Footer */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-950">
              <div>
                <strong className="block font-bold">Digitally Certified & Sanctioned</strong>
                <span className="text-slate-600 text-[11px]">
                  Authorized by {matchedApp.assignedOfficerName || `${matchedApp.plotDetails.taluk} Planning Officer`}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-mono">
                Hash: {matchedApp.id.substring(0, 14).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          /* Application exists but not yet sanctioned */
          <div className="bg-white rounded-xl border border-amber-300 p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Application Under Active Processing</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Application <strong>{matchedApp.applicationNo}</strong> is currently at status: <span className="font-bold text-blue-900 capitalize">{matchedApp.status.replace(/_/g, ' ')}</span>. The final sanction order permit is issued once technical scrutiny is approved.
            </p>
            <Link
              to={`/client/status?app=${encodeURIComponent(matchedApp.applicationNo)}`}
              className="inline-flex items-center space-x-1 text-xs text-blue-700 font-bold hover:underline"
            >
              <span>Track Detailed Status</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )
      ) : targetAppNo ? (
        /* Not found error */
        <div className="bg-white rounded-xl border border-rose-300 p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-950">Invalid Permit Record</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            No active or archived building sanction permit was found for reference "<strong>{targetAppNo}</strong>". Please verify the application or sanction order number.
          </p>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          Enter an application number above or scan the QR code from the bottom of your sanction certificate to verify.
        </div>
      )}
    </div>
  );
};
