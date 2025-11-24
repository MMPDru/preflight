import { useState } from 'react';
import { Folder, FileType, Download, Trash2, List, Grid, Eye, Archive, X, RotateCcw, LayoutGrid } from 'lucide-react';

const INITIAL_ASSETS = [
    { id: 1, name: 'Asset_Sample_1.png', size: '2.4 MB', date: 'Added today', type: 'image', status: 'active', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
    { id: 2, name: 'Asset_Sample_2.png', size: '2.4 MB', date: 'Added today', type: 'image', status: 'active', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80' },
    { id: 3, name: 'Asset_Sample_3.png', size: '2.4 MB', date: 'Added today', type: 'image', status: 'active', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
    { id: 4, name: 'Asset_Sample_4.png', size: '2.4 MB', date: 'Added today', type: 'image', status: 'active', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80' },
    { id: 5, name: 'Brand_Guidelines_2025.pdf', size: '15.8 MB', date: 'Yesterday', type: 'pdf', status: 'active', url: null },
    { id: 6, name: 'Logo_Pack_Final.zip', size: '45.2 MB', date: '3 days ago', type: 'zip', status: 'active', url: null },
];

export const Assets = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [currentFolder, setCurrentFolder] = useState<'library' | 'archive'>('library');
    const [assets, setAssets] = useState(INITIAL_ASSETS);
    const [previewAsset, setPreviewAsset] = useState<typeof INITIAL_ASSETS[0] | null>(null);

    const filteredAssets = assets.filter(asset =>
        currentFolder === 'library' ? asset.status === 'active' : asset.status === 'archived'
    );

    const handleDownload = async (asset: typeof INITIAL_ASSETS[0]) => {
        if (asset.url) {
            try {
                const response = await fetch(asset.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = asset.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download failed:', error);
                // Fallback to opening in new tab if fetch fails
                window.open(asset.url, '_blank');
            }
        } else {
            alert(`Downloading ${asset.name}...`);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to permanently delete this asset?')) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleArchive = (id: number) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'archived' } : a));
    };

    const handleRestore = (id: number) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
    };

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-surface/30 p-4 flex flex-col gap-2">
                <button
                    onClick={() => setCurrentFolder('library')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentFolder === 'library' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-surface'
                        }`}
                >
                    <LayoutGrid size={18} />
                    Asset Library
                </button>
                <button
                    onClick={() => setCurrentFolder('archive')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentFolder === 'archive' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-surface'
                        }`}
                >
                    <Archive size={18} />
                    Archived Assets
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto relative">
                {/* Preview Modal */}
                {previewAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewAsset(null)}>
                        <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="font-bold text-text">{previewAsset.name}</h3>
                                <button onClick={() => setPreviewAsset(null)} className="text-muted hover:text-text transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 flex items-center justify-center bg-black/50 min-h-[400px]">
                                {previewAsset.url ? (
                                    <img src={previewAsset.url} alt={previewAsset.name} className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg" />
                                ) : (
                                    <div className="text-center text-white">
                                        <FileType size={64} className="mx-auto mb-4 opacity-50" />
                                        <p>Preview not available for this file type</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-border flex justify-end gap-2 bg-surface">
                                <button
                                    onClick={() => handleDownload(previewAsset)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-text">
                        {currentFolder === 'library' ? 'Asset Library' : 'Archived Assets'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-surface border border-border rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-text'}`}
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-text'}`}
                            >
                                <Grid size={20} />
                            </button>
                        </div>
                        {currentFolder === 'library' && (
                            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                Upload Asset
                            </button>
                        )}
                    </div>
                </div>

                {filteredAssets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted">
                        {currentFolder === 'library' ? (
                            <>
                                <Folder size={48} className="mb-4 opacity-50" />
                                <p>No assets in library</p>
                            </>
                        ) : (
                            <>
                                <Archive size={48} className="mb-4 opacity-50" />
                                <p>No archived assets</p>
                            </>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAssets.map((asset) => (
                            <div key={asset.id} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group relative">
                                <div className="aspect-square bg-background rounded-lg mb-3 flex items-center justify-center text-muted group-hover:text-primary transition-colors overflow-hidden relative">
                                    {asset.url ? (
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                    ) : (
                                        asset.type === 'pdf' ? <FileType size={48} /> : <Folder size={48} />
                                    )}
                                    {/* Grid Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }} className="p-2 bg-surface text-text rounded-full hover:bg-primary hover:text-white transition-colors" title="Preview">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDownload(asset); }} className="p-2 bg-surface text-text rounded-full hover:bg-primary hover:text-white transition-colors" title="Download">
                                            <Download size={18} />
                                        </button>
                                        {currentFolder === 'library' ? (
                                            <button onClick={(e) => { e.stopPropagation(); handleArchive(asset.id); }} className="p-2 bg-surface text-text rounded-full hover:bg-orange-500 hover:text-white transition-colors" title="Archive">
                                                <Archive size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); handleRestore(asset.id); }} className="p-2 bg-surface text-text rounded-full hover:bg-green-500 hover:text-white transition-colors" title="Restore">
                                                <RotateCcw size={18} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="p-2 bg-surface text-text rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-medium text-text truncate" title={asset.name}>{asset.name}</h3>
                                <p className="text-xs text-muted">{asset.size} • {asset.date}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-background border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-muted text-sm">Asset Name</th>
                                    <th className="px-6 py-4 font-medium text-muted text-sm">Type</th>
                                    <th className="px-6 py-4 font-medium text-muted text-sm">Size</th>
                                    <th className="px-6 py-4 font-medium text-muted text-sm">Date Added</th>
                                    <th className="px-6 py-4 font-medium text-muted text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-background/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center overflow-hidden shrink-0 border border-border cursor-pointer" onClick={() => setPreviewAsset(asset)}>
                                                    {asset.url ? (
                                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        asset.type === 'pdf' ? <FileType size={20} className="text-muted" /> : <Folder size={20} className="text-muted" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-text cursor-pointer hover:text-primary transition-colors" onClick={() => setPreviewAsset(asset)}>{asset.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted uppercase">{asset.type}</td>
                                        <td className="px-6 py-4 text-sm text-muted">{asset.size}</td>
                                        <td className="px-6 py-4 text-sm text-muted">{asset.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setPreviewAsset(asset)} className="p-2 hover:bg-background rounded-lg text-muted hover:text-primary transition-colors" title="Preview">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDownload(asset)} className="p-2 hover:bg-background rounded-lg text-muted hover:text-primary transition-colors" title="Download">
                                                    <Download size={18} />
                                                </button>
                                                {currentFolder === 'library' ? (
                                                    <button onClick={() => handleArchive(asset.id)} className="p-2 hover:bg-background rounded-lg text-muted hover:text-orange-500 transition-colors" title="Archive">
                                                        <Archive size={18} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleRestore(asset.id)} className="p-2 hover:bg-background rounded-lg text-muted hover:text-green-500 transition-colors" title="Restore">
                                                        <RotateCcw size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(asset.id)} className="p-2 hover:bg-background rounded-lg text-muted hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
