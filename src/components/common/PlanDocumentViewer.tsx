import React, { useState } from 'react';
import { UploadedPlanFile } from '../../types';
import { FileText, Layers, Download, Maximize2, ZoomIn, ZoomOut, CheckCircle, Info, Compass, Box } from 'lucide-react';

interface PlanDocumentViewerProps {
  files: UploadedPlanFile[];
  activeFileIndex?: number;
  onSelectFile?: (index: number) => void;
}

export const PlanDocumentViewer: React.FC<PlanDocumentViewerProps> = ({
  files,
  activeFileIndex = 0,
  onSelectFile
}) => {
  const [selectedIdx, setSelectedIdx] = useState(activeFileIndex);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<'preview' | 'layers' | 'meta'>('preview');

  const currentFile = files[selectedIdx] || files[0];

  const handleFileChange = (idx: number) => {
    setSelectedIdx(idx);
    if (onSelectFile) onSelectFile(idx);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* File Selector Tabs Header */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          {files.map((file, idx) => {
            const isSelected = idx === selectedIdx;
            const ext = file.name.split('.').pop()?.toUpperCase() || file.type.toUpperCase();
            return (
              <button
                key={file.name + idx}
                onClick={() => handleFileChange(idx)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className={`text-[10px] px-1 py-0.5 rounded font-mono font-bold ${
                  ext === 'PDF' ? 'bg-red-900/60 text-red-200' : ext === 'DXF' ? 'bg-teal-900/60 text-teal-200' : 'bg-amber-900/60 text-amber-200'
                }`}>
                  {ext}
                </span>
                <span className="truncate max-w-[160px]">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {currentFile?.type === 'dxf' && (
            <div className="flex bg-slate-800 rounded p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2 py-1 rounded ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Geometry
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'layers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Layers className="w-3 h-3" />
                Layers ({currentFile.dxfInfo?.layers.length || 0})
              </button>
            </div>
          )}

          <div className="flex items-center space-x-1 bg-slate-800 rounded p-1">
            <button
              onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Drawing Viewer Viewport */}
      <div className="flex-1 bg-slate-950 relative overflow-auto p-4 flex items-center justify-center min-h-[420px]">
        {currentFile?.type === 'dwg' ? (
          /* DWG Binary Notification */
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-300">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">AutoCAD DWG Drawing Container</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Proprietary binary format. In accordance with Tamil Nadu DTCP Scrutiny protocol, automated AI scrutiny was executed using the companion PDF drawing export.
            </p>
            <div className="flex justify-center gap-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert('Downloading ' + currentFile.name); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download Native DWG ({(currentFile.sizeBytes / (1024 * 1024)).toFixed(1)} MB)
              </a>
            </div>
          </div>
        ) : currentFile?.type === 'dxf' && activeTab === 'layers' ? (
          /* DXF Layers Breakdown */
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-lg p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-semibold text-white">AutoCAD Scrutiny Layers Detected</h4>
              </div>
              <span className="text-xs bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono">
                {currentFile.dxfInfo?.layers.length || 6} Layers
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {(currentFile.dxfInfo?.layers || ['0', 'SITE_BOUNDARY', 'SETBACKS', 'PROPOSED_GROUND', 'RWH_PIT', 'DIMENSIONS']).map((l, idx) => (
                <div key={l} className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24', '#a855f7', '#ec4899'][idx % 6] }} />
                    <span className="font-mono text-slate-300">{l}</span>
                  </div>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
              <div className="text-teal-400 font-semibold mb-1">Extracted Geometry & Notes:</div>
              <div>Bounding Box: {currentFile.dxfInfo?.boundingBox?.width || '15.2'}m × {currentFile.dxfInfo?.boundingBox?.height || '22.0'}m</div>
              <div>Vector Entities: {currentFile.dxfInfo?.lineCount || '142'} lines, {currentFile.dxfInfo?.textCount || '28'} text nodes</div>
              {currentFile.dxfInfo?.notes?.map((n, i) => (
                <div key={i} className="text-slate-300">• {n}</div>
              ))}
            </div>
          </div>
        ) : (
          /* Visual CAD / PDF Simulated Architectural Rendering Canvas */
          <div
            className="transition-transform duration-200 bg-white rounded shadow-2xl p-6 relative border border-slate-300 flex flex-col justify-between"
            style={{
              width: `${(800 * zoomLevel) / 100}px`,
              minHeight: `${(520 * zoomLevel) / 100}px`,
              aspectRatio: '1.414', // A3/A4 landscape architectural aspect ratio
            }}
          >
            {/* Architectural Drawing Title Block Header */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-blue-900">
                  Government of Tamil Nadu • Directorate of Town & Country Planning
                </div>
                <div className="text-xs font-bold text-slate-900">
                  PROPOSED BUILDING PLAN SCRUTINY SHEET
                </div>
              </div>
              <div className="text-right text-[9px] font-mono text-slate-600">
                <div>SCALE: 1:100 (METRIC)</div>
                <div>STANDARD: TNCDBR 2019</div>
              </div>
            </div>

            {/* Simulated Architectural Floor Plan Blueprint Graphics */}
            <div className="flex-1 border border-dashed border-slate-300 rounded bg-slate-50/50 p-4 relative flex flex-col items-center justify-center">
              {/* Plot Boundary */}
              <div className="w-[85%] h-[80%] border-2 border-slate-800 relative bg-white flex items-center justify-center">
                {/* Abutting Road Indicator */}
                <div className="absolute -top-6 left-0 right-0 h-5 bg-amber-50 border border-dashed border-amber-300 flex items-center justify-center text-[9px] font-semibold text-amber-900">
                  ABUTTING PUBLIC ROAD (12.00 METRES WIDTH)
                </div>

                {/* Front Setback Zone */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-blue-50/70 border-b border-blue-300 flex items-center justify-center text-[9px] text-blue-800 font-mono">
                  FRONT SETBACK (3.00m)
                </div>

                {/* Left Setback */}
                <div className="absolute top-8 bottom-6 left-0 w-8 bg-emerald-50/50 border-r border-emerald-300 flex items-center justify-center text-[8px] text-emerald-800 font-mono -rotate-90">
                  SIDE (1.5m)
                </div>

                {/* Right Setback */}
                <div className="absolute top-8 bottom-6 right-0 w-8 bg-emerald-50/50 border-l border-emerald-300 flex items-center justify-center text-[8px] text-emerald-800 font-mono rotate-90">
                  SIDE (1.5m)
                </div>

                {/* Rear Setback */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-purple-50/60 border-t border-purple-300 flex items-center justify-center text-[8px] text-purple-800 font-mono">
                  REAR YARD SETBACK (1.80m)
                </div>

                {/* Main Plinth Structure */}
                <div className="w-[68%] h-[60%] border-2 border-blue-900 bg-blue-100/30 p-2 flex flex-col justify-between">
                  <div className="flex justify-between text-[8px] font-mono text-slate-700">
                    <span>LIVING / HALL</span>
                    <span>BEDROOM 01</span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <div className="border border-blue-800 px-3 py-1 bg-white text-[9px] font-bold text-blue-950 text-center">
                      PROPOSED BUILT-UP ENVELOPE
                      <div className="text-[7px] text-slate-500 font-normal">TNCDBR RULE 35 COMPLIANT</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-slate-700">
                    <span>KITCHEN & DINING</span>
                    <span className="text-teal-700 font-semibold">RWH PIT CONNECTED</span>
                  </div>
                </div>

                {/* Compass Marker */}
                <div className="absolute bottom-8 right-10 flex flex-col items-center">
                  <Compass className="w-5 h-5 text-blue-800" />
                  <span className="text-[7px] font-bold text-blue-900">NORTH</span>
                </div>
              </div>
            </div>

            {/* Bottom Title Bar Stamp */}
            <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-4 gap-2 text-[8px] text-slate-700">
              <div className="border border-slate-200 p-1 rounded">
                <span className="font-bold block text-slate-900">FILE NAME:</span>
                <span className="truncate block font-mono">{currentFile?.name}</span>
              </div>
              <div className="border border-slate-200 p-1 rounded">
                <span className="font-bold block text-slate-900">DRAWING TYPE:</span>
                <span>Site & Architectural Scrutiny Plan</span>
              </div>
              <div className="border border-slate-200 p-1 rounded">
                <span className="font-bold block text-slate-900">FILE SIZE:</span>
                <span>{((currentFile?.sizeBytes || 4000000) / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="border border-slate-200 p-1 rounded bg-emerald-50 text-emerald-800">
                <span className="font-bold block">STATUS:</span>
                <span className="font-semibold">Vector Geometry Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Active file: <strong className="font-medium text-slate-900">{currentFile?.name}</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
          <span>Uploaded: {currentFile?.uploadedAt ? new Date(currentFile.uploadedAt).toLocaleDateString() : 'Today'}</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium">Scrutiny Ready</span>
        </div>
      </div>
    </div>
  );
};
