import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Search, 
  Plus, 
  Boxes, 
  CheckCircle2, 
  Server, 
  Database, 
  Layers, 
  Filter,
  X,
  Download,
  QrCode,
  SlidersHorizontal,
  Building2,
  Clock,
  Sparkles,
  Check,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_SUPPLIERS, 
  Product, 
  Movement, 
  Supplier 
} from './data/mockData';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics' | 'movements' | 'suppliers' | 'architecture'>('inventory');
  
  // Warehouse selector
  const [currentWarehouse, setCurrentWarehouse] = useState('Entrepôt Principal (Fès Nord)');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOMINAL' | 'LOW' | 'OUT'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'unitPrice' | 'totalValue'>('quantity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Movement Form
  const [mvtSku, setMvtSku] = useState(INITIAL_PRODUCTS[0]?.sku || '');
  const [mvtType, setMvtType] = useState<'INBOUND' | 'OUTBOUND' | 'TRANSFER'>('INBOUND');
  const [mvtQty, setMvtQty] = useState(1);
  const [mvtDoc, setMvtDoc] = useState('');

  // New Product Form
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category: 'Infrastructure',
    quantity: 10,
    minThreshold: 5,
    unitPrice: 500,
    supplier: 'Fournisseur Agréé Maroc',
    location: 'Baie C-01'
  });

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR'));
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('fr-FR')), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories
  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // KPIs
  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => p.quantity === 0).length;
  }, [products]);

  const nominalCount = useMemo(() => {
    return products.filter(p => p.quantity > p.minThreshold).length;
  }, [products]);

  // Category Breakdown for Visual Analytics
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    products.forEach(p => {
      const cur = map.get(p.category) || { count: 0, value: 0 };
      map.set(p.category, {
        count: cur.count + p.quantity,
        value: cur.value + (p.quantity * p.unitPrice)
      });
    });
    return Array.from(map.entries()).map(([cat, val]) => ({
      category: cat,
      quantity: val.count,
      value: val.value,
      pct: totalStockValue > 0 ? (val.value / totalStockValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [products, totalStockValue]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      
      let matchStatus = true;
      if (statusFilter === 'NOMINAL') matchStatus = p.quantity > p.minThreshold;
      if (statusFilter === 'LOW') matchStatus = p.quantity > 0 && p.quantity <= p.minThreshold;
      if (statusFilter === 'OUT') matchStatus = p.quantity === 0;

      return matchSearch && matchCat && matchStatus;
    });

    list.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (sortBy === 'totalValue') {
        valA = a.quantity * a.unitPrice;
        valB = b.quantity * b.unitPrice;
      }
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [products, searchQuery, selectedCategory, statusFilter, sortBy, sortOrder]);

  // CSV Export
  const exportToCSV = () => {
    const headers = ["ID", "SKU", "Désignation", "Catégorie", "Quantité", "Seuil Minimal", "Prix Unitaire (MAD)", "Valeur Totale (MAD)", "Emplacement", "Fournisseur", "Dernière Mise à Jour"];
    const rows = products.map(p => [
      p.id,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.quantity,
      p.minThreshold,
      p.unitPrice.toFixed(2),
      (p.quantity * p.unitPrice).toFixed(2),
      `"${p.location}"`,
      `"${p.supplier}"`,
      p.lastUpdated
    ]);

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventaire_infodix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export CSV généré avec succès (Format Excel / UTF-8 BOM)");
  };

  // Handle Stock Movement
  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === mvtSku);
    if (!product) return;

    if (mvtType === 'OUTBOUND' && product.quantity < mvtQty) {
      alert(`Erreur: Stock insuffisant pour ${product.name} (Stock actuel: ${product.quantity})`);
      return;
    }

    const newQty = mvtType === 'INBOUND' 
      ? product.quantity + mvtQty 
      : mvtType === 'OUTBOUND' 
        ? product.quantity - mvtQty 
        : product.quantity;

    setProducts(prev => prev.map(p => p.sku === mvtSku ? {
      ...p,
      quantity: newQty,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : p));

    const newMovement: Movement = {
      id: `MVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: mvtSku,
      productName: product.name,
      type: mvtType,
      quantity: mvtQty,
      operator: 'Anass EL Kharbaoui',
      referenceDoc: mvtDoc.trim() || `BL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setMovements(prev => [newMovement, ...prev]);
    setIsMovementModalOpen(false);
    setMvtQty(1);
    setMvtDoc('');
    showToast(`Mouvement enregistré: ${mvtType} de ${mvtQty}x ${product.name}`);
  };

  // Quick Adjustment
  const handleQuickAdjust = (sku: string, delta: number) => {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    if (delta < 0 && product.quantity <= 0) return;

    const newQty = product.quantity + delta;
    setProducts(prev => prev.map(p => p.sku === sku ? {
      ...p,
      quantity: newQty,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : p));

    setMovements(prev => [{
      id: `MVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: product.sku,
      productName: product.name,
      type: delta > 0 ? 'INBOUND' : 'OUTBOUND',
      quantity: Math.abs(delta),
      operator: 'Anass EL Kharbaoui',
      referenceDoc: 'AJUSTEMENT-RAPIDE'
    }, ...prev]);

    showToast(`Stock ajusté (${delta > 0 ? '+' : ''}${delta}): ${product.name} (Nouveau: ${newQty})`);
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.sku) return;

    const created: Product = {
      id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
      sku: newProd.sku.toUpperCase().trim(),
      name: newProd.name.trim(),
      category: newProd.category,
      quantity: Number(newProd.quantity),
      minThreshold: Number(newProd.minThreshold),
      unitPrice: Number(newProd.unitPrice),
      supplier: newProd.supplier,
      location: newProd.location,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setProducts(prev => [created, ...prev]);
    setIsNewProductModalOpen(false);
    setNewProd({
      name: '',
      sku: '',
      category: 'Infrastructure',
      quantity: 10,
      minThreshold: 5,
      unitPrice: 500,
      supplier: 'Fournisseur Agréé Maroc',
      location: 'Baie C-01'
    });
    showToast(`Nouvelle référence créée : ${created.name} (${created.sku})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-2xl shadow-blue-500/40 border border-blue-400/30 text-sm font-medium animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Enterprise Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white font-mono">INFODIX // StockManager ERP</h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">Plateforme de Gestion des Flux & Matériels IT • Développé par Anass EL Kharbaoui</p>
            </div>
          </div>

          {/* Operational Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            
            {/* Warehouse Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <select 
                value={currentWarehouse} 
                onChange={e => setCurrentWarehouse(e.target.value)}
                className="bg-transparent border-none text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="Entrepôt Principal (Fès Nord)" className="bg-slate-900">Entrepôt Principal (Fès Nord)</option>
                <option value="Plateforme Logistique (Tanger Med)" className="bg-slate-900">Plateforme Logistique (Tanger Med)</option>
                <option value="Hub Central (Casablanca)" className="bg-slate-900">Hub Central (Casablanca)</option>
              </select>
            </div>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            {/* Scanner Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition active:scale-95"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Scanner Code-Barres</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </button>

            {/* Add Product Button */}
            <button 
              onClick={() => setIsNewProductModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Article</span>
            </button>

            {/* Record Movement Button */}
            <button 
              onClick={() => setIsMovementModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Nouveau Flux</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Valeur Valorisation Stock</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {totalStockValue.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400 font-sans">MAD</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">+6.8%</span> rotation sur les 30 derniers jours
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Références Actives (SKUs)</span>
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {products.length}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {products.reduce((acc, p) => acc + p.quantity, 0)} unités physiques enregistrées
            </p>
          </div>

          <div 
            onClick={() => { setActiveTab('inventory'); setStatusFilter('LOW'); }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Alertes Seuil Critique</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-bold tracking-tight font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {lowStockCount} <span className="text-sm font-normal text-slate-400 font-sans">référence(s)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {lowStockCount > 0 ? "Réapprovisionnement suggéré (cliquer pour filtrer)" : "Niveaux nominaux optimaux"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Fournisseurs IT Certifiés</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {suppliers.length}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Délai moyen de réappro : <strong className="text-slate-200">48h ouvrées</strong>
            </p>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Grille d'Inventaire ({filteredProducts.length})
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Graphiques & Décisionnel
          </button>

          <button 
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'movements' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Journal des Flux ({movements.length})
          </button>

          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'suppliers' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Fournisseurs ({suppliers.length})
          </button>

          <button 
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architecture' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Architecture Technique
          </button>
        </div>

        {/* TAB 1: INVENTORY TABLE */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Tous ({products.length})
                </button>
                <button
                  onClick={() => setStatusFilter('NOMINAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'NOMINAL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                >
                  Niveau Optimal ({nominalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('LOW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'LOW'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-amber-400'
                  }`}
                >
                  Stock Faible ({lowStockCount})
                </button>
                <button
                  onClick={() => setStatusFilter('OUT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'OUT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
                  }`}
                >
                  Rupture ({outOfStockCount})
                </button>
              </div>

              {/* Sort By Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Trier par :</span>
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="quantity">Quantité en stock</option>
                  <option value="totalValue">Valeur totale</option>
                  <option value="unitPrice">Prix unitaire</option>
                  <option value="name">Désignation</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
                </button>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filtrer par SKU, désignation, baie ou emplacement..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Toutes Catégories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">SKU & Matériel</th>
                      <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                      <th className="py-3.5 px-4 font-semibold">Emplacement</th>
                      <th className="py-3.5 px-4 font-semibold">Niveau Stock</th>
                      <th className="py-3.5 px-4 font-semibold">Prix Unit.</th>
                      <th className="py-3.5 px-4 font-semibold">Valeur Totale</th>
                      <th className="py-3.5 px-4 font-semibold">Statut</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Ajustement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map(product => {
                      const isLow = product.quantity > 0 && product.quantity <= product.minThreshold;
                      const isOut = product.quantity === 0;
                      const maxGauge = Math.max(product.minThreshold * 3, product.quantity);
                      const percent = Math.min(100, Math.round((product.quantity / maxGauge) * 100));

                      return (
                        <tr key={product.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-xs text-blue-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{product.sku}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">{product.supplier}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                            {product.location}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-sm ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                                {product.quantity}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                / seuil {product.minThreshold}
                              </span>
                            </div>
                            {/* Stock Bar */}
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {product.unitPrice.toFixed(2)} MAD
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-200">
                            {(product.quantity * product.unitPrice).toFixed(2)} MAD
                          </td>
                          <td className="py-3.5 px-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <ShieldAlert className="w-3 h-3" />
                                Rupture
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                Critique
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Optimal
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button 
                                onClick={() => handleQuickAdjust(product.sku, -1)}
                                title="Sortie rapide de 1 unité"
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition font-mono font-semibold"
                              >
                                -1
                              </button>
                              <button 
                                onClick={() => handleQuickAdjust(product.sku, 1)}
                                title="Entrée rapide de 1 unité"
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition font-mono font-semibold"
                              >
                                +1
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & VISUAL CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Valuation Chart */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Valorisation du Stock par Famille</h3>
                    <p className="text-xs text-slate-400">Ventilation du capital immobilisé par catégorie matérielle</p>
                  </div>
                  <PieChart className="w-5 h-5 text-blue-400" />
                </div>

                <div className="space-y-3.5 pt-2">
                  {categoryBreakdown.map((item, idx) => {
                    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                    const color = colors[idx % colors.length];

                    return (
                      <div key={item.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{item.category} ({item.quantity} unités)</span>
                          <span className="font-mono text-slate-300 font-semibold">
                            {item.value.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD ({item.pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${color}`} 
                            style={{ width: `${item.pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Inbound vs Outbound Movements Flow SVG */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Analyse des Flux Mensuels (2025)</h3>
                    <p className="text-xs text-slate-400">Comparaison Entrées fournisseurs vs Sorties déploiement</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                </div>

                {/* SVG Visual Bar Chart */}
                <div className="pt-4">
                  <div className="flex items-center justify-end gap-4 text-xs font-medium pb-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-3 h-3 rounded bg-emerald-500" />
                      Entrées (Inbound)
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-3 rounded bg-rose-500" />
                      Sorties (Outbound)
                    </span>
                  </div>

                  {/* SVG Container */}
                  <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#475569" strokeWidth="1.5" />

                    {/* Y Axis Labels */}
                    <text x="30" y="24" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">60</text>
                    <text x="30" y="74" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">40</text>
                    <text x="30" y="124" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">20</text>
                    <text x="30" y="174" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">0</text>

                    {/* Bars for 6 Months */}
                    {[
                      { m: 'Avr', in: 38, out: 26, x: 70 },
                      { m: 'Mai', in: 45, out: 34, x: 140 },
                      { m: 'Juin', in: 52, out: 40, x: 210 },
                      { m: 'Juil', in: 48, out: 35, x: 280 },
                      { m: 'Août', in: 30, out: 28, x: 350 },
                      { m: 'Sept', in: 58, out: 42, x: 420 },
                    ].map(bar => {
                      const inHeight = (bar.in / 60) * 150;
                      const outHeight = (bar.out / 60) * 150;

                      return (
                        <g key={bar.m}>
                          {/* Inbound bar */}
                          <rect 
                            x={bar.x - 14} 
                            y={170 - inHeight} 
                            width="12" 
                            height={inHeight} 
                            fill="#10b981" 
                            rx="3"
                          />
                          {/* Outbound bar */}
                          <rect 
                            x={bar.x + 2} 
                            y={170 - outHeight} 
                            width="12" 
                            height={outHeight} 
                            fill="#f43f5e" 
                            rx="3"
                          />
                          {/* Month label */}
                          <text 
                            x={bar.x} 
                            y="190" 
                            fill="#94a3b8" 
                            fontSize="11" 
                            textAnchor="middle"
                            fontWeight="500"
                          >
                            {bar.m}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Taux de rotation global : <strong className="text-white">3.4x / an</strong></span>
                  <span>Disponibilité moyenne du matériel : <strong className="text-emerald-400">98.4%</strong></span>
                </div>
              </div>

            </div>

            {/* Storage Bay Heatmap / Density */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-white text-base">Occupation Géographique des Baies & Rayonnages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {['Baie A-04', 'Rayon B-12', 'Coffre S-02', 'Zone E-01', 'Tiroir T-08', 'Rack R-03'].map(loc => {
                  const itemsInLoc = products.filter(p => p.location.includes(loc.split(' ')[0]));
                  const totalUnits = itemsInLoc.reduce((acc, p) => acc + p.quantity, 0);

                  return (
                    <div key={loc} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                      <span className="font-mono text-xs font-semibold text-blue-400 block">{loc}</span>
                      <span className="text-lg font-bold text-white font-mono">{totalUnits}</span>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">unités stockées</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MOVEMENTS LOG */}
        {activeTab === 'movements' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white">Traçabilité des Flux de Stock</h3>
                <p className="text-xs text-slate-400">Historique temps réel des entrées, sorties et transferts</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                ● Synchronisé avec Redis & PostgreSQL
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Identifiant & Heure</th>
                    <th className="py-3.5 px-4 font-semibold">Type de Flux</th>
                    <th className="py-3.5 px-4 font-semibold">Matériel & SKU</th>
                    <th className="py-3.5 px-4 font-semibold">Quantité</th>
                    <th className="py-3.5 px-4 font-semibold">Opérateur</th>
                    <th className="py-3.5 px-4 font-semibold">Réf. Document</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="text-white font-semibold">{m.id}</div>
                        <div className="text-slate-500">{m.timestamp}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {m.type === 'INBOUND' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3 h-3" /> Entrée
                          </span>
                        )}
                        {m.type === 'OUTBOUND' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ArrowUpRight className="w-3 h-3" /> Sortie
                          </span>
                        )}
                        {m.type === 'TRANSFER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <RefreshCw className="w-3 h-3" /> Transfert
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-slate-200 font-medium">{m.productName}</div>
                        <div className="text-slate-500 font-mono text-xs">{m.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        {m.quantity}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {m.operator}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {m.referenceDoc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLIERS */}
        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{sup.name}</h4>
                    <p className="text-xs text-slate-400">Contact Référent: {sup.contact}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    ★ {sup.rating} / 5.0
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60 font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500">Email:</span> {sup.email}
                  </div>
                  <div>
                    <span className="text-slate-500">Tél:</span> {sup.phone}
                  </div>
                  <div className="col-span-2 text-slate-400 font-sans">
                    Commandes actives : <strong className="text-white font-mono">{sup.activeOrders} en cours</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Architecture & Conception Système</h3>
              <p className="text-sm text-slate-400">Développement Full Stack réalisé durant le stage technique INFODIX SARL</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
                <h4 className="font-semibold text-white text-sm">Frontend SPA</h4>
                <p className="text-xs text-slate-400">React 18, Vite, TypeScript, Tailwind CSS. Interface réactive et composants modulaires avec filtres multi-critères.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
                <h4 className="font-semibold text-white text-sm">Backend API REST</h4>
                <p className="text-xs text-slate-400">Node.js, Express, TypeScript. Endpoints sécurisés pour la gestion transactionnelle des mouvements et des alertes de seuil.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">3</div>
                <h4 className="font-semibold text-white text-sm">Cache Redis</h4>
                <p className="text-xs text-slate-400">Mise en cache en mémoire des niveaux de stock fréquents et files d'attente asynchrones pour les exports massifs.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
                <h4 className="font-semibold text-white text-sm">PostgreSQL & Docker</h4>
                <p className="text-xs text-slate-400">Base relationnelle ACID avec contraintes d'intégrité, tables d'audit complètes et déploiement conteneurisé.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BARCODE SCANNER SIMULATOR MODAL */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Scanner Industriel Code-Barres</h3>
              </div>
              <button onClick={() => { setIsScannerModalOpen(false); setScannedProduct(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scanner Viewport with Laser Beam Animation */}
            <div className="relative h-48 bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-500/40 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" />
              <div className="font-mono text-xs text-slate-400 z-10 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                Pointez le capteur vers le code-barres de l'article...
              </div>
            </div>

            {/* Quick Simulate Buttons */}
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-2">Simuler un scan sur un article :</span>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 5).map(p => (
                  <button
                    key={p.sku}
                    onClick={() => setScannedProduct(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition"
                  >
                    {p.sku}
                  </button>
                ))}
              </div>
            </div>

            {/* Scanned Card Details */}
            {scannedProduct && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{scannedProduct.name}</h4>
                    <span className="text-xs font-mono text-indigo-400">{scannedProduct.sku} • {scannedProduct.location}</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-emerald-400">Stock: {scannedProduct.quantity}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => {
                      handleQuickAdjust(scannedProduct.sku, 1);
                      setScannedProduct(prev => prev ? { ...prev, quantity: prev.quantity + 1 } : null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    + Entrée Rapide (+1)
                  </button>
                  <button 
                    onClick={() => {
                      handleQuickAdjust(scannedProduct.sku, -1);
                      setScannedProduct(prev => prev ? { ...prev, quantity: Math.max(0, prev.quantity - 1) } : null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    - Sortie Rapide (-1)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Ajouter un Nouvel Article en Stock</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Référence SKU
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: NET-FW-10G"
                    value={newProd.sku}
                    onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newProd.category}
                    onChange={e => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Réseau">Réseau</option>
                    <option value="Sécurité">Sécurité</option>
                    <option value="Stockage">Stockage</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Câblage">Câblage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Désignation du Matériel
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Routeur Haute Disponibilité Cisco ISR 4331"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Quantité Initiale
                  </label>
                  <input 
                    type="number"
                    min={0}
                    required
                    value={newProd.quantity}
                    onChange={e => setNewProd({ ...newProd, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Seuil Minimal
                  </label>
                  <input 
                    type="number"
                    min={1}
                    required
                    value={newProd.minThreshold}
                    onChange={e => setNewProd({ ...newProd, minThreshold: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Prix Unit. (MAD)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={newProd.unitPrice}
                    onChange={e => setNewProd({ ...newProd, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Emplacement / Baie
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Baie D-02"
                    value={newProd.location}
                    onChange={e => setNewProd({ ...newProd, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Fournisseur
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Cisco Systems Solutions"
                    value={newProd.supplier}
                    onChange={e => setNewProd({ ...newProd, supplier: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MOVEMENT MODAL */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Enregistrer un Flux de Stock</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordMovement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Matériel & SKU
                </label>
                <select 
                  value={mvtSku}
                  onChange={e => setMvtSku(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) — Stock actuel: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Type de Flux
                  </label>
                  <select 
                    value={mvtType}
                    onChange={e => setMvtType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="INBOUND">Entrée Fournisseur (+)</option>
                    <option value="OUTBOUND">Sortie Déploiement (-)</option>
                    <option value="TRANSFER">Transfert Entrepôt</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Quantité
                  </label>
                  <input 
                    type="number" 
                    min={1}
                    value={mvtQty}
                    onChange={e => setMvtQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Référence Documentaire
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: BL-2025-4412, OT-RESEAU-01"
                  value={mvtDoc}
                  onChange={e => setMvtDoc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  Valider le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
