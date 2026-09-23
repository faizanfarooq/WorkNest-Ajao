import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Download, 
  Eye, 
  PenTool, 
  Upload, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DocumentPortalItem } from '../types';

interface DocumentPortalProps {
  documents: DocumentPortalItem[];
  onSignDocument: (docId: string) => void;
  onUploadDocument: (newDoc: Omit<DocumentPortalItem, 'id' | 'uploadedDate' | 'hashDigest'>) => void;
}

export const DocumentPortal: React.FC<DocumentPortalProps> = ({
  documents,
  onSignDocument,
  onUploadDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentPortalItem | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [signConsent, setSignConsent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DocumentPortalItem['type']>('milestone_spec');
  const [newStartupName, setNewStartupName] = useState('HyperFlow Infrastructure');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExecuteSignature = () => {
    if (!selectedDoc || !signConsent) return;
    onSignDocument(selectedDoc.id);
    setShowSignModal(false);
    setSignConsent(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onUploadDocument({
      title: newTitle.trim(),
      type: newType,
      startupName: newStartupName,
      fileSize: '680 KB',
      status: 'signed_by_both',
      confidentiality: 'Mutual Agreement'
    });
    setNewTitle('');
    setShowUploadModal(false);
  };

  const handleExportVerifiedPdf = (doc: DocumentPortalItem) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Outer security borders
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.8);
      pdf.rect(10, 10, 190, 277);

      pdf.setDrawColor(79, 70, 229); // indigo-600
      pdf.setLineWidth(0.4);
      pdf.rect(12, 12, 186, 273);

      // Header Banner
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(12, 12, 186, 28, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('WORKFEST AJAO', 20, 23);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(165, 180, 252); // indigo-200
      pdf.text('VIRTUAL INTERNSHIP & MILESTONE VERIFICATION PROTOCOL', 20, 31);

      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(`ISSUED: ${doc.uploadedDate.toUpperCase()}`, 148, 23);
      pdf.setTextColor(52, 211, 153); // emerald-400
      pdf.text('STATUS: VERIFIED & SIGNED', 140, 31);

      // Main Title
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text('OFFICIAL MILESTONE SIGN-OFF CREDENTIAL', 20, 52);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Authorized for external portfolio presentation, employer background checks & alumni verification', 20, 58);

      // Metadata Box
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(20, 64, 170, 68, 3, 3, 'FD');

      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);

      pdf.setFont('helvetica', 'bold');
      pdf.text('CANDIDATE:', 26, 74);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Alex Chen (B.S. Computer Science & IT Graduate)', 68, 74);

      pdf.setFont('helvetica', 'bold');
      pdf.text('CANDIDATE ID:', 26, 82);
      pdf.setFont('helvetica', 'normal');
      pdf.text('WFA-GRAD-2026-9821', 68, 82);

      pdf.setFont('helvetica', 'bold');
      pdf.text('SPONSORING STARTUP:', 26, 90);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doc.startupName, 68, 90);

      pdf.setFont('helvetica', 'bold');
      pdf.text('CREDENTIAL / SPEC:', 26, 98);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doc.title, 68, 98);

      pdf.setFont('helvetica', 'bold');
      pdf.text('DOCUMENT TYPE:', 26, 106);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doc.type.replace(/_/g, ' ').toUpperCase(), 68, 106);

      pdf.setFont('helvetica', 'bold');
      pdf.text('CONFIDENTIALITY:', 26, 114);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doc.confidentiality, 68, 114);

      pdf.setFont('helvetica', 'bold');
      pdf.text('SHA-256 DIGEST:', 26, 122);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text(doc.hashDigest, 68, 122);

      // Milestone Sign-off Statements
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Milestone Execution & Engineering Sign-Off Summary', 20, 146);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(51, 65, 85);

      const statements = [
        '1. Objective Completion: The candidate has fulfilled all deliverables, architectural reviews, and milestone criteria defined in the project specification with verified code commits.',
        '2. AI-Verified Code Integrity: All submitted PRs, unit/integration test suites, and commit histories underwent automated AI audit with 0 critical regressions and 96% architecture conformance.',
        '3. Real-World Engineering Deliverable: The software components have been integrated into staging/production workflows under direct startup founder supervision.',
        '4. Portfolio Authorization: The candidate is formally granted the irrevocable right to reference this verified milestone credential in external resumes, LinkedIn, and hiring evaluations.'
      ];

      let yPos = 155;
      statements.forEach((stmt) => {
        const lines = pdf.splitTextToSize(stmt, 170);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 5.2 + 2;
      });

      // Dual Signatures Section
      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, yPos + 4, 190, yPos + 4);
      yPos += 14;

      // Candidate signature box
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(20, yPos, 80, 36, 2, 2, 'FD');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('CANDIDATE SIGNATURE (ELECTRONIC)', 25, yPos + 7);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text('/s/ Alex Chen', 25, yPos + 18);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Signed via WorkFest Auth Token: 0x9f4a...e12d', 25, yPos + 26);
      pdf.text(`Verified at: ${doc.uploadedDate}`, 25, yPos + 31);

      // Startup signature box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(110, yPos, 80, 36, 2, 2, 'FD');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('STARTUP AUTHORITY & ESCROW RELEASE', 115, yPos + 7);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(5, 150, 105);
      pdf.text(`/s/ ${doc.startupName}`, 115, yPos + 18);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Escrow Disbursed • Milestones Approved', 115, yPos + 26);
      pdf.text(`Digital Seal: SHA256-${doc.hashDigest.slice(0, 12)}...`, 115, yPos + 31);

      // Footer
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `Official Verification URL: https://workfest-ajao.dev/verify/${doc.hashDigest}  •  WorkFest Ajao Non-GPA Portfolio Framework`,
        20,
        280
      );

      const cleanTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`WorkFest_Ajao_${cleanTitle}_Verified_Credential.pdf`);

      setExportNotice(`Exported verified PDF for "${doc.title}". Ready for external hiring verification.`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Unable to export verified PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Vault & Digital Escrow Agreement Room</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            Documents, NDAs & Verified Experience Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            All virtual internship agreements, mutual NDAs, and milestone completion certificates are cryptographically 
            logged with SHA-256 digests for your verifiable engineering portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {documents.length > 0 && (
            <button
              id="top-export-verified-pdf-btn"
              onClick={() => {
                const credentialDoc = documents.find(d => d.type === 'experience_verification' || d.status === 'signed_by_both' || d.status === 'verified_issued') || documents[0];
                handleExportVerifiedPdf(credentialDoc);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-xs"
              title="Download official milestone sign-off credential as verified PDF"
            >
              <Award className="w-3.5 h-3.5 text-indigo-200" />
              <span>Export as Verified PDF</span>
            </button>
          )}
          <button
            id="upload-doc-modal-btn"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Project Document</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Notice */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
          <button 
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Repository Documents ({documents.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Zero-Knowledge Tamper-Resistant Storage
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => {
            const isAwaitingSign = doc.status === 'awaiting_candidate_sign';
            return (
              <div
                key={doc.id}
                id={`doc-row-${doc.id}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        doc.status === 'signed_by_both'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc.status === 'verified_issued'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>Startup: <strong className="text-slate-700">{doc.startupName}</strong></span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded {doc.uploadedDate}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400">{doc.hashDigest}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                  {isAwaitingSign ? (
                    <button
                      id={`sign-doc-btn-${doc.id}`}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowSignModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Review & E-Sign</span>
                    </button>
                  ) : (
                    <>
                      <button
                        id={`preview-doc-btn-${doc.id}`}
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Secure Preview</span>
                      </button>

                      <button
                        id={`export-verified-pdf-btn-${doc.id}`}
                        onClick={() => handleExportVerifiedPdf(doc)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                        title="Export official milestone sign-off credential as verified PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export as Verified PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && !showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Secure Document Preview
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedDoc.hashDigest}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Secure PDF Render view */}
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-4 text-xs font-serif text-slate-800 leading-relaxed max-h-96 overflow-y-auto">
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider font-sans">
                  {selectedDoc.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  WorkFest Ajao Milestone Virtual Internship Program • {selectedDoc.startupName}
                </p>
              </div>

              <p>
                <strong>1. Scope of Virtual Milestones:</strong> The candidate agrees to execute real-world engineering objectives governed strictly by project outcomes, code reviews, and milestone deliverables rather than seat time or academic transcripts.
              </p>

              <p>
                <strong>2. Intellectual Property & Code Rights:</strong> All software developed during approved milestones is assigned to {selectedDoc.startupName} upon release of the corresponding escrow stipend payment. The candidate retains the full right to reference the project and verified code artifacts in their personal portfolio.
              </p>

              <p>
                <strong>3. Confidentiality & Non-Disclosure:</strong> Both parties acknowledge that proprietary technical specifications, staging API keys, and business architectures remain strictly confidential.
              </p>

              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Candidate Signature</span>
                  <div className="font-mono text-indigo-600 font-bold mt-1">/s/ Alex Chen</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Signed via WorkFest Auth</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Startup Authority</span>
                  <div className="font-mono text-emerald-600 font-bold mt-1">/s/ {selectedDoc.startupName}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Escrow Bound Verified</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Cryptographically Signed & Verifiable for External Use</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  id="preview-modal-export-pdf-btn"
                  onClick={() => handleExportVerifiedPdf(selectedDoc)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export as Verified PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review & E-Sign Modal */}
      {showSignModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Digital Signature Room
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Sign {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 leading-relaxed">
              By executing this digital signature, you confirm acceptance of the mutual NDA and milestone collaboration terms with <strong>{selectedDoc.startupName}</strong>.
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block">Candidate Identity:</span>
              <p className="text-xs text-slate-600 font-mono">
                Alex Chen • B.S. CS '25 • IP: 192.168.1.102 • Timestamp: {new Date().toLocaleTimeString()}
              </p>
            </div>

            <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={signConsent}
                onChange={(e) => setSignConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                I agree to the legally binding electronic record and signature terms.
              </span>
            </label>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-e-signature-btn"
                onClick={handleExecuteSignature}
                disabled={!signConsent}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
              >
                Execute Electronic Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Upload New Project Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Architecture RFC Spec v2"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Document Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="milestone_spec">Milestone Technical Specification</option>
                  <option value="nda">Mutual Non-Disclosure Agreement</option>
                  <option value="internship_contract">Virtual Internship Agreement</option>
                  <option value="experience_verification">Work Experience Credential</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700 block">
                  Drag and drop PDF or markdown spec
                </span>
                <span className="text-[10px] text-slate-400">PDF, DOCX, MD up to 25MB</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Upload & Compute Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
