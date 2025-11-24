import React, { useState } from 'react';
import {
    Package, Clock, CheckCircle, XCircle, RefreshCw, Download,
    Eye, Search, Filter, Calendar, DollarSign, FileText, Copy
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface Order {
    id: string;
    orderNumber: string;
    jobName: string;
    customerId: string;
    customerName: string;
    status: 'draft' | 'submitted' | 'in-analysis' | 'fixing' | 'proofing' | 'approved' | 'in-production' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    files: OrderFile[];
    specifications: OrderSpecifications;
    timeline: OrderTimeline[];
    pricing: OrderPricing;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    tags: string[];
}

export interface OrderFile {
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: Date;
    preflightStatus?: 'pending' | 'passed' | 'warning' | 'failed';
}

export interface OrderSpecifications {
    quantity: number;
    paperType: string;
    paperSize: string;
    colorMode: 'bw' | 'color' | 'spot';
    finishing: string[];
    deliveryMethod: 'pickup' | 'shipping';
    notes?: string;
}

export interface OrderTimeline {
    id: string;
    status: string;
    timestamp: Date;
    user: string;
    notes?: string;
}

export interface OrderPricing {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
}

export interface OrderHistoryProps {
    customerId: string;
    onReorder: (order: Order) => void;
    onViewProof: (orderId: string) => void;
    onDownloadFiles: (orderId: string) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
    customerId,
    onReorder,
    onViewProof,
    onDownloadFiles
}) => {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'draft': 'bg-gray-500',
            'submitted': 'bg-blue-500',
            'in-analysis': 'bg-purple-500',
            'fixing': 'bg-yellow-500',
            'proofing': 'bg-orange-500',
            'approved': 'bg-green-500',
            'in-production': 'bg-cyan-500',
            'completed': 'bg-green-600',
            'cancelled': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={18} />;
            case 'cancelled':
                return <XCircle size={18} />;
            case 'in-production':
                return <Package size={18} />;
            default:
                return <Clock size={18} />;
        }
    };

    const handleReorder = (order: Order) => {
        if (confirm(`Reorder "${order.jobName}"? This will create a new order with the same specifications.`)) {
            onReorder(order);
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Order History</h1>
                <p className="text-muted">View and manage your past orders</p>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by job name or order number..."
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface text-text"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-border rounded-lg bg-surface text-text"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="proofing">Proofing</option>
                    <option value="approved">Approved</option>
                    <option value="in-production">In Production</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-surface border border-border rounded-lg">
                    <div className="text-2xl font-bold text-text">{orders.length}</div>
                    <div className="text-sm text-muted">Total Orders</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                        {orders.filter(o => o.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted">Completed</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">
                        {orders.filter(o => ['submitted', 'proofing', 'in-production'].includes(o.status)).length}
                    </div>
                    <div className="text-sm text-muted">In Progress</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                    <div className="text-2xl font-bold text-text">
                        ${orders.reduce((sum, o) => sum + o.pricing.total, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted">Total Spent</div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map(order => (
                    <div
                        key={order.id}
                        className="p-6 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-text">{order.jobName}</h3>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2",
                                        getStatusColor(order.status)
                                    )}>
                                        {getStatusIcon(order.status)}
                                        {order.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                    {order.priority === 'urgent' && (
                                        <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                                            URGENT
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted">Order #{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">${order.pricing.total.toFixed(2)}</div>
                                <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <div className="text-xs text-muted mb-1">Quantity</div>
                                <div className="font-medium text-text">{order.specifications.quantity}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted mb-1">Paper Size</div>
                                <div className="font-medium text-text">{order.specifications.paperSize}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted mb-1">Color Mode</div>
                                <div className="font-medium text-text">{order.specifications.colorMode.toUpperCase()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted mb-1">Files</div>
                                <div className="font-medium text-text">{order.files.length} file(s)</div>
                            </div>
                        </div>

                        {/* Tags */}
                        {order.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {order.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleViewDetails(order)}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2"
                            >
                                <Eye size={16} />
                                View Details
                            </button>

                            {['proofing', 'approved'].includes(order.status) && (
                                <button
                                    onClick={() => onViewProof(order.id)}
                                    className="px-4 py-2 bg-surface border border-border hover:bg-background text-text rounded-lg flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    View Proof
                                </button>
                            )}

                            <button
                                onClick={() => onDownloadFiles(order.id)}
                                className="px-4 py-2 bg-surface border border-border hover:bg-background text-text rounded-lg flex items-center gap-2"
                            >
                                <Download size={16} />
                                Download Files
                            </button>

                            {order.status === 'completed' && (
                                <button
                                    onClick={() => handleReorder(order)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Reorder
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-muted mb-4" />
                        <h3 className="text-xl font-bold text-text mb-2">No orders found</h3>
                        <p className="text-muted">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-text">{selectedOrder.jobName}</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-background rounded-lg"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <p className="text-sm text-muted">Order #{selectedOrder.orderNumber}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Specifications */}
                            <div>
                                <h3 className="font-bold text-text mb-3">Specifications</h3>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                                    <div>
                                        <div className="text-sm text-muted">Quantity</div>
                                        <div className="font-medium">{selectedOrder.specifications.quantity}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Paper Type</div>
                                        <div className="font-medium">{selectedOrder.specifications.paperType}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Paper Size</div>
                                        <div className="font-medium">{selectedOrder.specifications.paperSize}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Color Mode</div>
                                        <div className="font-medium">{selectedOrder.specifications.colorMode.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Finishing</div>
                                        <div className="font-medium">{selectedOrder.specifications.finishing.join(', ')}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Delivery</div>
                                        <div className="font-medium capitalize">{selectedOrder.specifications.deliveryMethod}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Files */}
                            <div>
                                <h3 className="font-bold text-text mb-3">Files</h3>
                                <div className="space-y-2">
                                    {selectedOrder.files.map(file => (
                                        <div
                                            key={file.id}
                                            className="p-3 bg-background rounded-lg flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="font-medium text-text">{file.name}</div>
                                                <div className="text-xs text-muted">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {file.preflightStatus && (
                                                <span className={clsx(
                                                    "px-2 py-1 rounded text-xs font-medium",
                                                    file.preflightStatus === 'passed' && "bg-green-500/20 text-green-500",
                                                    file.preflightStatus === 'warning' && "bg-yellow-500/20 text-yellow-500",
                                                    file.preflightStatus === 'failed' && "bg-red-500/20 text-red-500"
                                                )}>
                                                    {file.preflightStatus}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="font-bold text-text mb-3">Timeline</h3>
                                <div className="space-y-3">
                                    {selectedOrder.timeline.map(event => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                            <div className="flex-1">
                                                <div className="font-medium text-text">{event.status}</div>
                                                <div className="text-sm text-muted">
                                                    {new Date(event.timestamp).toLocaleString()} • {event.user}
                                                </div>
                                                {event.notes && (
                                                    <div className="text-sm text-muted mt-1">{event.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div>
                                <h3 className="font-bold text-text mb-3">Pricing</h3>
                                <div className="p-4 bg-background rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Subtotal</span>
                                        <span className="font-medium">${selectedOrder.pricing.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Tax</span>
                                        <span className="font-medium">${selectedOrder.pricing.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Shipping</span>
                                        <span className="font-medium">${selectedOrder.pricing.shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border pt-2 flex justify-between">
                                        <span className="font-bold text-text">Total</span>
                                        <span className="font-bold text-primary text-xl">${selectedOrder.pricing.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Mock data
const MOCK_ORDERS: Order[] = [
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        jobName: 'Business Cards - ABC Corp',
        customerId: 'cust-1',
        customerName: 'Alice Johnson',
        status: 'completed',
        priority: 'medium',
        files: [
            {
                id: 'f1',
                name: 'business-cards-front.pdf',
                url: '/files/f1.pdf',
                size: 2048000,
                uploadedAt: new Date('2024-01-15'),
                preflightStatus: 'passed'
            }
        ],
        specifications: {
            quantity: 1000,
            paperType: 'Glossy Card Stock',
            paperSize: '3.5" x 2"',
            colorMode: 'color',
            finishing: ['Rounded Corners'],
            deliveryMethod: 'shipping'
        },
        timeline: [
            {
                id: 't1',
                status: 'Order Submitted',
                timestamp: new Date('2024-01-15T10:00:00'),
                user: 'Alice Johnson'
            },
            {
                id: 't2',
                status: 'In Production',
                timestamp: new Date('2024-01-16T09:00:00'),
                user: 'System'
            },
            {
                id: 't3',
                status: 'Completed',
                timestamp: new Date('2024-01-18T14:00:00'),
                user: 'System'
            }
        ],
        pricing: {
            subtotal: 125.00,
            tax: 10.00,
            shipping: 15.00,
            total: 150.00,
            currency: 'USD'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18'),
        completedAt: new Date('2024-01-18'),
        tags: ['business-cards', 'rush']
    },
    {
        id: '2',
        orderNumber: 'ORD-2024-002',
        jobName: 'Flyers - Spring Sale',
        customerId: 'cust-1',
        customerName: 'Alice Johnson',
        status: 'proofing',
        priority: 'high',
        files: [
            {
                id: 'f2',
                name: 'spring-sale-flyer.pdf',
                url: '/files/f2.pdf',
                size: 5048000,
                uploadedAt: new Date('2024-02-01'),
                preflightStatus: 'warning'
            }
        ],
        specifications: {
            quantity: 5000,
            paperType: 'Glossy Paper',
            paperSize: '8.5" x 11"',
            colorMode: 'color',
            finishing: [],
            deliveryMethod: 'pickup'
        },
        timeline: [
            {
                id: 't4',
                status: 'Order Submitted',
                timestamp: new Date('2024-02-01T11:00:00'),
                user: 'Alice Johnson'
            },
            {
                id: 't5',
                status: 'Proof Ready',
                timestamp: new Date('2024-02-01T15:00:00'),
                user: 'System',
                notes: 'Please review and approve'
            }
        ],
        pricing: {
            subtotal: 450.00,
            tax: 36.00,
            shipping: 0,
            total: 486.00,
            currency: 'USD'
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        tags: ['flyers', 'marketing']
    }
];
