import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApplications, useCurrentUser } from '../../services/store';
import { Users, Search, Building2, FileText, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

export const OfficerApplicants: React.FC = () => {
  const { applications } = useApplications();
  const { currentUser } = useCurrentUser();

  const officerRegion = currentUser.region || 'Tiruchengode';
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'all' | 'month' | 'buildingType'>('all');

  // Filter regional applications
  const regionApps = applications.filter(a => a.plotDetails.region === officerRegion);

  // Group applications by applicant
  const applicantMap: Record<string, {
    name: string;
    phone: string;
    email: string;
    address: string;
    applications: typeof regionApps;
  }> = {};

  regionApps.forEach(app => {
    const key = app.applicantName;
    if (!applicantMap[key]) {
      applicantMap[key] = {
        name: app.applicantName,
        phone: app.applicantPhone,
        email: app.applicantEmail,
        address: app.applicantAddress || `${app.plotDetails.street}, ${app.plotDetails.taluk}`,
        applications: []
      };
    }
    applicantMap[key].applications.push(app);
  });

  const applicantsList = Object.values(applicantMap).filter(applicant =>
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-bold text-slate-900">
              Applicants & Registered Developers Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered property owners and architects submitting building permit plans in {officerRegion} Region.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 font-bold self-start sm:self-auto">
          {applicantsList.length} Registered Applicants
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search applicant name, contact number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Applicants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applicantsList.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            No applicants found matching "{searchQuery}".
          </div>
        ) : (
          applicantsList.map((applicant, idx) => (
            <div
              key={applicant.name + idx}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm">
                    {applicant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{applicant.name}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{applicant.phone}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold border border-blue-200">
                  {applicant.applications.length} Plan(s)
                </span>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{applicant.address}</span>
                </div>
              </div>

              {/* Submissions list */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Submitted Permit Proposals:
                </div>
                {applicant.applications.map(app => (
                  <div
                    key={app.id}
                    className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-900">{app.applicationNo}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        S.No {app.plotDetails.surveyNo} ({app.plotAreaSqm} m²)
                      </span>
                    </div>

                    <Link
                      to={`/officer/review/${encodeURIComponent(app.id)}`}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
