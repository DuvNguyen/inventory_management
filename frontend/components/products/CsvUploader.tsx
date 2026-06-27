'use client';

import { useState, useRef } from 'react';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/api';
import { ApiResponse, CsvUploadResult } from '../../types';
import { UploadCloud, FileText, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CsvUploader() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<CsvUploadResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv') {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast('Invalid file type. Only CSV files are supported.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast('Invalid file type. Only CSV files are supported.', 'error');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<ApiResponse<CsvUploadResult>>(
        '/products/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResult(response.data.data);
      toast('CSV file processed successfully.', 'success');
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center bg-surface/40 ${
            isDragActive ? 'border-tertiary bg-surface/80' : 'border-secondary/35 hover:border-tertiary'
          }`}
          style={{ borderRadius: '2px' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <UploadCloud className="w-10 h-10 text-secondary mb-4" />
          <h4 className="font-serif text-base text-primary tracking-wide">DRAG & DROP CSV FILE</h4>
          <p className="text-[11px] text-secondary mt-1 tracking-widest uppercase font-semibold">
            Or click to browse files
          </p>
        </div>
      ) : (
        <div
          className="bg-surface border border-secondary/20 p-6 flex items-center justify-between"
          style={{ borderRadius: '2px' }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral border border-secondary/20">
              <FileText className="w-6 h-6 text-tertiary" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary font-sans">{file.name}</p>
              <p className="text-xs text-secondary mt-0.5 font-mono">{formatSize(file.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={removeFile}
              disabled={isUploading}
              className="p-2 border border-secondary/20 text-secondary hover:text-primary disabled:opacity-50 transition-colors cursor-pointer"
              style={{ borderRadius: '2px' }}
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-tertiary text-on-primary hover:bg-tertiary/90 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              {isUploading ? 'IMPORTING...' : 'UPLOAD & PROCESS'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div
          className="bg-surface border border-secondary/25 p-6 space-y-6"
          style={{ borderRadius: '2px' }}
        >
          <h4 className="font-serif text-lg text-primary tracking-wide border-b border-secondary/15 pb-3">
            IMPORT RESULT SUMMARY
          </h4>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-neutral p-4 border border-secondary/15">
              <span className="block text-[10px] text-secondary tracking-widest font-semibold uppercase">
                INSERTED
              </span>
              <span className="block mt-2 font-mono text-2xl text-tertiary font-bold">
                {result.inserted}
              </span>
            </div>
            <div className="bg-neutral p-4 border border-secondary/15">
              <span className="block text-[10px] text-secondary tracking-widest font-semibold uppercase">
                UPDATED
              </span>
              <span className="block mt-2 font-mono text-2xl text-primary font-bold">
                {result.updated}
              </span>
            </div>
            <div className="bg-neutral p-4 border border-secondary/15">
              <span className="block text-[10px] text-secondary tracking-widest font-semibold uppercase">
                SKIPPED
              </span>
              <span className="block mt-2 font-mono text-2xl text-secondary">
                {result.skipped}
              </span>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="border border-secondary/15">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="w-full flex items-center justify-between px-4 py-3 bg-neutral text-xs font-semibold tracking-wider text-secondary hover:text-primary transition-colors uppercase cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Row Errors ({result.errors.length})</span>
                </span>
                {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showErrors && (
                <div className="divide-y divide-secondary/15 max-h-60 overflow-y-auto bg-neutral/30">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="p-3 text-xs flex justify-between gap-4 font-sans">
                      <span className="text-secondary font-mono">Row {err.row}</span>
                      <span className="text-tertiary font-mono uppercase">{err.sku || 'N/A'}</span>
                      <span className="text-red-400 text-right flex-1">{err.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {result.errors.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-tertiary font-semibold uppercase tracking-wider bg-tertiary/5 p-3 border border-tertiary/20">
              <CheckCircle2 className="w-4 h-4 text-tertiary" />
              <span>All records successfully parsed and verified.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
