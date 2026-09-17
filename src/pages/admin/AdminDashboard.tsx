import React, { useState } from 'react';
import { useApplications, useCurrentUser } from '../../services/store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Region, UserProfile } from '../../types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Shield, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  FileText, 
  Plus, 
  UserCheck, 
  UserX, 
  MapPin,
  FileCheck2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { applications, stats } = useApplications();
  const { currentUser, officers, addOfficer, updateOfficerRegion, toggleOfficerStatus } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<'analytics' | 'regions' | 'officers'>('analytics');
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);

  // New Officer Form
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerEmail, setNewOfficerEmail] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');
  const [newOfficerRegion, setNewOfficerRegion] = useState<Region>('Tiruchengode');
  const [newOfficerDesignation, setNewOfficerDesignation] = useState('Assistant Director of Town Planning');

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Application No',
      'Applicant Name',
      'Phone',
      'Region',
      'Survey No',
      'Building Type',
      'Plot Area (sqm)',
      'Built-Up Area (sqm)',
      'Floors',
      'AI Score',
      'Status',
      'Sanction Order No',
      'Submitted Date',
      'Decided Date'
    ];

    const rows = applications.map(app => [
      `"${app.applicationNo}"`,
      `"${app.applicantName}"`,
      `"${app.applicantPhone}"`,
      `"${app.plotDetails.region}"`,
      `"${app.plotDetails.surveyNo}"`,
      `"${app.buildingType}"`,
      app.plotAreaSqm,
      app.builtUpAreaSqm,
      app.floors,
      app.aiReport?.complianceScore || 'N/A',
      `"${app.status}"`,
      `"${app.sanctionOrderNo || ''}"`,
      `"${new Date(app.submittedAt).toLocaleDateString('en-GB')}"`,
      `"${app.decidedAt ? new Date(app.decidedAt).toLocaleDateString('en-GB') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlanSanction_Namakkal_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName || !newOfficerEmail) return;

    addOfficer({
      name: newOfficerName,
      email: newOfficerEmail,
      phone: newOfficerPhone || '+91 98421 00000',
      role: 'officer',
      region: newOfficerRegion,
      district: 'Namakkal',
      designation: newOfficerDesignation
    });

    setNewOfficerName('');
    setNewOfficerEmail('');
    setNewOfficerPhone('');
    setShowAddOfficerModal(false);
  };

  // Find slowest region for table highlight
  const slowestRegion = [...stats.regionalBreakdown].sort((a, b) => b.avgDays - a.avgDays)[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#081c33] text-white p-6 rounded-xl border border-blue-900 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-900 text-amber-300 text-xs font-semibold mb-2 border border-blue-700">
              <Shield className="w-3.5 h-3.5" />
              <span>District Planning Authority Headquarters • Namakkal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Executive Dashboard: {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              District-wide monitoring of municipal building plan sanction workflows, TNCDBR 2019 regulatory adherence, turnaround benchmarks, and town planning officer jurisdictions.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total Applications</span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{stats.totalApplications}</div>
          <div className="text-[11px] text-slate-500 mt-1">Namakkal District</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Approval Rate</span>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{stats.approvalRatePercent}%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">{stats.approvedCount} sanctions granted</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Pending Scrutiny</span>
            <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2 font-mono">{stats.pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">In officer queue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Avg Turnaround</span>
            <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-2 font-mono">{stats.averageTurnaroundDays} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Benchmark: &lt; 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Corrections Raised</span>
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">{stats.correctionRequiredCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Drawings under revision</div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Regional Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                <span>Sanction Applications by Taluk / Region</span>
              </h3>
              <p className="text-xs text-slate-500">Distribution across the 4 municipal divisions</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.regionalBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" fill="#0b2545" name="Total Submissions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" name="Sanctioned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#3b82f6" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Status Split Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-900" />
                <span>Application Status Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500">Current state of all district submissions</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {stats.statusSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Monthly Trend Line Chart (8 Months) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-900" />
                <span>8-Month Sanction Trend & Inflow</span>
              </h3>
              <p className="text-xs text-slate-500">Submissions vs Sanction Orders from Feb - Sep 2026</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2.5} name="Submitted" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2.5} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={1.5} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Violated Rules Horizontal Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Most Violated TNCDBR 2019 Rules</span>
              </h3>
              <p className="text-xs text-slate-500">Identified automatically by AI Scrutiny engine</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats.violationStats}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="rule" type="category" width={180} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#d97706" name="Violations Count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Performance Benchmark Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Regional Performance Comparison</h3>
            <p className="text-xs text-slate-500">Turnaround time & workload balance across Taluks</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded font-medium">
            Slowest region flagged in amber
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Taluk / Region</th>
                <th className="py-3 px-4">Designated Planning Officer</th>
                <th className="py-3 px-4 text-center">Total Plans</th>
                <th className="py-3 px-4 text-center">Approved</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4 text-center">Avg Turnaround</th>
                <th className="py-3 px-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats.regionalBreakdown.map((r) => {
                const isSlowest = r.region === slowestRegion?.region;
                return (
                  <tr
                    key={r.region}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSlowest ? 'bg-amber-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-900" />
                      <span>{r.region}</span>
                      {isSlowest && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                          Turnaround Alert
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {r.officerName}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {r.total}
                    </td>

                    <td className="py-3.5 px-4 text-center text-emerald-700 font-mono font-bold">
                      {r.approved}
                    </td>

                    <td className="py-3.5 px-4 text-center text-blue-700 font-mono font-bold">
                      {r.pending}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        r.avgDays <= 2.5
                          ? 'bg-emerald-50 text-emerald-800'
                          : r.avgDays <= 3.5
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {r.avgDays} Days
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Compliant</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Management Section */}
      <div id="officers" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-900" />
              <h3 className="text-base font-bold text-slate-900">
                Municipal Town Planning Officers Jurisdiction
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign regional jurisdiction and toggle officer active status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddOfficerModal(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Planning Officer</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Email & Contact</th>
                <th className="py-3 px-4">Assigned Region</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Jurisdiction Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {officers.map((officer) => {
                const isDeactivated = officer.designation?.includes('(Deactivated)');
                return (
                  <tr key={officer.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {officer.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      <div>{officer.email}</div>
                      <div className="text-slate-400">{officer.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={officer.region}
                        onChange={(e) => updateOfficerRegion(officer.uid, e.target.value as Region)}
                        className="text-xs p-1 rounded border border-slate-300 bg-white font-medium"
                      >
                        <option value="Tiruchengode">Tiruchengode</option>
                        <option value="Rasipuram">Rasipuram</option>
                        <option value="Kumarapalayam">Kumarapalayam</option>
                        <option value="Paramathi-Velur">Paramathi-Velur</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {officer.designation || 'Town Planning Officer'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isDeactivated
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isDeactivated ? 'Deactivated' : 'Active Duty'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleOfficerStatus(officer.uid)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          isDeactivated
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isDeactivated ? 'Reactivate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900">Add Planning Officer</h4>
              <button
                onClick={() => setShowAddOfficerModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOfficerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Full Name & Degree *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. S. Manikandan, B.E."
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="officer.name@plansanction.tn.gov.in"
                  value={newOfficerEmail}
                  onChange={(e) => setNewOfficerEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98421 XXXXX"
                  value={newOfficerPhone}
                  onChange={(e) => setNewOfficerPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Taluk / Municipality Jurisdiction *
                </label>
                <select
                  value={newOfficerRegion}
                  onChange={(e) => setNewOfficerRegion(e.target.value as Region)}
                  className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="Tiruchengode">Tiruchengode</option>
                  <option value="Rasipuram">Rasipuram</option>
                  <option value="Kumarapalayam">Kumarapalayam</option>
                  <option value="Paramathi-Velur">Paramathi-Velur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={newOfficerDesignation}
                  onChange={(e) => setNewOfficerDesignation(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 text-white rounded text-xs font-bold shadow-sm"
                >
                  Commission Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
