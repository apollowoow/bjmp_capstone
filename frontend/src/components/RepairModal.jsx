import React, { useState, useEffect } from 'react';
import { X, Wrench, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, UserCheck, Calendar, FileText } from 'lucide-react';
import API_BASE_URL from "../apiConfig";

const RepairModal = ({ isOpen, onClose, record, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState({ type: null, message: "" });
    const [isAgreed, setIsAgreed] = useState(false);
    const [correctedValue, setCorrectedValue] = useState("");
    const [reference, setReference] = useState("");

    // 🎯 Detect if we are just viewing a previous repair (Receipt Mode)
    const isHistoryView = !!record?.restored_by;

    useEffect(() => {
        if (record && !isHistoryView) {
            setCorrectedValue(record.old_val ?? "");
            setReference("");
            setStep(1);
            setStatus({ type: null, message: "" });
            setIsAgreed(false);
        }
    }, [record, isOpen, isHistoryView]);

    if (!isOpen || !record) return null;

    const isLoading = status.type === 'loading';
    const isSuccess = status.type === 'success';

    const handleRepair = async (e) => {
        if (e) e.preventDefault();
        if (isLoading || isSuccess) return;

        setStatus({ type: 'loading', message: "Generating new cryptographic seal..." });

        try {
            const token = localStorage.getItem("token");
            const isAttendance = record.type === 'attendance';

            const endpoint = isAttendance 
                ? `${API_BASE_URL}/api/sessions/repair-integrity`
                : `${API_BASE_URL}/api/sessions/repair-credits`;

            const payload = isAttendance ? {
                session_id: record.id,
                pdl_id: record.pdl_id,
                corrected_hours: correctedValue,
                paper_log_ref: reference
            } : {
                record_id: record.id,
                pdl_id: record.pdl_id,
                corrected_value: record.type === 'gcta' ? 20 : correctedValue,
                paper_log_ref: reference,
                credit_type: record.type
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus({ type: 'success', message: "Integrity Restored. Record re-sealed." });
                setTimeout(() => { 
                    onSuccess(); 
                    onClose(); 
                }, 2000);
            } else {
                const err = await res.json();
                setStatus({ type: 'error', message: err.error || "Repair failed." });
            }
        } catch (err) {
            setStatus({ type: 'error', message: "Network error. Transaction aborted." });
        }
    };

    return (
        <div className="ia-modal-overlay">
            <div className={`ia-repair-modal-container ${step === 2 || isHistoryView ? 'ia-confirm-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
                
                {status.message && (
                    <div className={`ia-status-banner ia-status-${status.type}`}>
                        {isLoading ? <Loader2 size={16} className="ia-spin" /> : 
                         status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        <span>{status.message}</span>
                    </div>
                )}

                <div className="ia-modal-top-bar">
                    <h3 className="ia-modal-title">
                        {isHistoryView ? <ShieldCheck size={18} color="#10b981" /> : step === 1 ? <Wrench size={18} /> : <ShieldCheck size={18} />}
                        {isHistoryView ? "Forensic Restoration Receipt" : step === 1 ? "Integrity Repair Protocol" : "Final Authorization"}
                    </h3>
                    <button type="button" className="ia-close-x" disabled={isLoading || isSuccess} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="ia-modal-content-area">
                    {isHistoryView ? (
                        /* 🕵️ THE FORENSIC RECEIPT VIEW */
                        <div className="ia-history-view">
                            <div className="ia-receipt-header">
                                <div className="ia-check-outer">
                                    <CheckCircle2 size={40} color="#10b981" />
                                </div>
                                <h4>Integrity Verified</h4>
                                <p>This record was manually re-sealed and cryptographically verified.</p>
                            </div>

                            <div className="ia-review-summary-card ia-history-card">
                                <div className="ia-review-row">
                                    <span className="ia-label"><UserCheck size={14} /> Restored By:</span> 
                                    <strong>{record.restored_by}</strong>
                                </div>
                                <div className="ia-review-row">
                                    <span className="ia-label"><Calendar size={14} /> Date Fixed:</span> 
                                    <strong>{new Date(record.restoration_date).toLocaleString()}</strong>
                                </div>
                                <div className="ia-review-row">
                                    <span className="ia-label"><FileText size={14} /> Evidence:</span> 
                                    <strong className="ia-text-highlight">
                                        {record.remarks?.split('[')[1]?.split(']')[0] || "Paper Logbook"}
                                    </strong>
                                </div>
                                <div className="ia-review-row">
                                    <span className="ia-label">System Log:</span> 
                                    <small>{record.remarks}</small>
                                </div>
                            </div>
                        </div>
                    ) : step === 1 ? (
                        /* 🛠️ STEP 1: INPUT VIEW (ORIGINAL) */
                        <div className="ia-input-view">
                            <p className="ia-modal-target">Target PDL: <strong>{record.pdl_name}</strong></p>
                            
                            {record.type === 'gcta' ? (
                                <div className="ia-form-group">
                                    <label>Standard GCTA Credit</label>
                                    <div className="ia-fixed-value-display">
                                        <CheckCircle2 size={16} color="#10b981" /> 20 Days (Fixed Limit)
                                    </div>
                                    <p className="ia-input-subtext">GCTA grants are fixed at 20 days as per RA 10592.</p>
                                </div>
                            ) : (
                                <div className="ia-form-group">
                                    <label>Corrected {record.type === 'attendance' ? 'Hours' : 'Study/Work Hours'}</label>
                                    <input 
                                        type="number" 
                                        min={record.type === 'tastm' ? 60 : 0}
                                        disabled={isLoading || isSuccess}
                                        value={correctedValue} 
                                        onChange={(e) => setCorrectedValue(e.target.value)} 
                                    />
                                </div>
                            )}

                            <div className="ia-form-group">
                                <label>Paper Log Reference</label>
                                <input 
                                    type="text" 
                                    disabled={isLoading || isSuccess}
                                    placeholder="e.g. Logbook 2026-A, Page 45" 
                                    value={reference} 
                                    onChange={(e) => setReference(e.target.value)} 
                                />
                            </div>
                        </div>
                    ) : (
                        /* 🛡️ STEP 2: SECURITY CONFIRMATION (ORIGINAL) */
                        <div className="ia-security-view">
                            <div className="ia-review-summary-card">
                                <div className="ia-review-row"><span>Log:</span> <strong>{record.type.toUpperCase()}</strong></div>
                                <div className="ia-review-row">
                                    <span>Correction:</span> 
                                    <strong className="ia-text-highlight">
                                        {record.old_val} {record.type === 'gcta' ? 'Days' : 'Hours'} → 
                                        {record.type === 'gcta' ? '20' : correctedValue} {record.type === 'gcta' ? 'Days' : 'Hours'}
                                    </strong>
                                </div>
                                <div className="ia-review-row"><span>Evidence:</span> <strong>{reference}</strong></div>
                            </div>
                            <label className={`ia-checkbox-wrapper ${isLoading ? 'ia-disabled' : ''}`}>
                                <input type="checkbox" disabled={isLoading || isSuccess} checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                                <span className="ia-custom-check"></span>
                                I confirm this matches the physical judicial evidence.
                            </label>
                        </div>
                    )}
                </div>

                <div className="ia-repair-footer">
                    {isHistoryView ? (
                        <button type="button" className="ia-btn-primary" onClick={onClose}>Close Receipt</button>
                    ) : step === 1 ? (
                        <>
                            <button type="button" className="ia-btn-ghost" disabled={isLoading || isSuccess} onClick={onClose}>Abort</button>
                            <button 
                                type="button"
                                className="ia-btn-primary" 
                                disabled={
                                    isLoading || isSuccess ||
                                    !reference.trim() || 
                                    (record.type === 'tastm' && Number(correctedValue) < 60) ||
                                    (record.type === 'attendance' && !correctedValue)
                                } 
                                onClick={() => setStep(2)}
                            >
                                Review Repair <ArrowRight size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="ia-btn-back" disabled={isLoading || isSuccess} onClick={() => setStep(1)}>
                                <ArrowLeft size={16} /> Edit
                            </button>
                            <button 
                                type="button"
                                className="ia-btn-authorize" 
                                disabled={!isAgreed || isLoading || isSuccess} 
                                onClick={handleRepair}
                            >
                                {isLoading ? <><Loader2 size={16} className="ia-spin" /> Sealing...</> : "Confirm & Re-Seal"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepairModal;