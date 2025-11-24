import React, { useState } from 'react';
import { Upload, Image as ImageIcon, FileType, Folder, Trash2, Download } from 'lucide-react';
import clsx from 'clsx';

interface BrandAsset {
    id: string;
    name: string;
    type: 'logo' | 'image' | 'template' | 'document';
    url: string;
    size: number;
    uploadedAt: Date;
    category?: string;
}

const sampleAssets: BrandAsset[] = [
    {
        id: 'asset-001',
        name: 'company-logo-color.pdf',
        type: 'logo',
        url: '/sample.pdf',
        size: 245000,
        uploadedAt: new Date('2024-01-15'),
        category: 'Logos'
    },
    {
        id: 'asset-002',
        name: 'business-card-template.pdf',
        type: 'template',
        url: '/sample.pdf',
        size: 1200000,
        uploadedAt: new Date('2024-02-10'),
        category: 'Templates'
    },
    {
        id: 'asset-003',
        name: 'brand-guidelines.pdf',
        type: 'document',
        url: '/sample.pdf',
        size: 3500000,
        uploadedAt: new Date('2024-03-05'),
        category: 'Guidelines'
    }
];

interface BrandAssetLibraryProps {
    onClose: () => void;
    onSelectAsset?: (asset: BrandAsset) => void;
}

export const BrandAssetLibrary: React.FC<BrandAssetLibraryProps> = ({ onClose, onSelectAsset }) => {
    const [assets, setAssets] = useState<BrandAsset[]>(sampleAssets);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(assets.map(a => a.category).filter(Boolean)))];

    const filteredAssets = selectedCategory === 'all'
        ? assets
        : assets.filter(a => a.category === selectedCategory);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getAssetIcon = (type: BrandAsset['type']) => {
        switch (type) {
            case 'logo': return <ImageIcon size={40} className="text-blue-500" />;
            case 'image': return <ImageIcon size={40} className="text-green-500" />;
            case 'template': return <FileType size={40} className="text-purple-500" />;
            case 'document': return <Folder size={40} className="text-orange-500" />;
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this asset?')) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Brand Asset Library</h2>
                        <p className="text-sm text-muted mt-1">
                            Manage your logos, templates, and brand materials
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Upload Area */}
                <div className="p-6 border-b border-border bg-background/50">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload size={32} className="mx-auto mb-3 text-muted" />
                        <p className="text-text font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted">PDF, AI, EPS, JPG, PNG (max 50MB)</p>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="p-4 border-b border-border flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                // The 'cat' variable here refers to the category string from the map function.
                                // The instruction's `const cat = asset.category;` would cause a ReferenceError
                                // because 'asset' is not defined in this scope.
                                // Assuming the intent was to check the 'cat' from the map function before setting state.
                                // Since 'cat' from the map is always a string ('all' or a category name),
                                // the 'if (cat)' check is technically redundant but harmless.
                                if (cat) setSelectedCategory(cat);
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                                selectedCategory === cat
                                    ? "bg-primary text-white"
                                    : "bg-surface text-text border border-border hover:border-primary/50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Assets Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAssets.map(asset => (
                            <div
                                key={asset.id}
                                className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer group"
                                onClick={() => onSelectAsset?.(asset)}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0">
                                        {getAssetIcon(asset.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-text truncate">{asset.name}</h3>
                                        <p className="text-xs text-muted capitalize">{asset.type}</p>
                                    </div>
                                </div>

                                <div className="text-xs text-muted space-y-1 mb-3">
                                    <div>Size: {formatFileSize(asset.size)}</div>
                                    <div>Uploaded: {asset.uploadedAt.toLocaleDateString()}</div>
                                    {asset.category && <div>Category: {asset.category}</div>}
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(asset.url, '_blank');
                                        }}
                                        className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(asset.id);
                                        }}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAssets.length === 0 && (
                        <div className="text-center py-12 text-muted">
                            No assets found in this category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
