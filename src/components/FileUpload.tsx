import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...newFiles]);
            onUpload(newFiles);
        }
    }, [onUpload]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            onUpload(newFiles);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden group",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-surface/50"
                )}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileInput}
                    multiple
                    accept=".pdf,.jpg,.png,.tiff,.ai,.eps"
                />

                <div className="relative z-0 flex flex-col items-center gap-4">
                    <div className={clsx(
                        "p-4 rounded-full transition-colors duration-300",
                        isDragging ? "bg-primary/20 text-primary" : "bg-surface text-muted group-hover:text-primary group-hover:bg-primary/10"
                    )}>
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text">
                            {isDragging ? "Drop files here" : "Drag & drop files here"}
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            or click to browse (PDF, AI, TIFF, PNG)
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <h4 className="text-sm font-medium text-muted uppercase tracking-wider">Ready to Process</h4>
                        {files.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border group hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-background rounded-md text-primary">
                                        <File size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text truncate max-w-[300px]">{file.name}</p>
                                        <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                    <div className="p-2 text-green-500">
                                        <CheckCircle size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
