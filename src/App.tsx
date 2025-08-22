import React, { useState, useMemo } from 'react';
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
  SlidersHorizontal,
  ChevronRight,
  Filter,
  X
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'suppliers' | 'architecture'>('inventory');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mvtSku, setMvtSku] = useState(INITIAL_PRODUCTS[0]?.sku || '');
  const [mvtType, setMvtType] = useState<'INBOUND' | 'OUTBOUND' | 'TRANSFER'>('INBOUND');
  const [mvtQty, setMvtQty] = useState(1);
  const [mvtDoc, setMvtDoc] = useState('');

  // Categories
  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // KPIs
  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.quantity <= p.minThreshold).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

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

    // Update Product
    setProducts(prev => prev.map(p => p.sku === mvtSku ? {
      ...p,
      quantity: newQty,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : p));

    // Record Movement
    const newMovement: Movement = {
      id: `MVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: mvtSku,
      productName: product.name,
      type: mvtType,
      quantity: mvtQty,
      operator: 'Anass EL Kharbaoui',
      referenceDoc: mvtDoc.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setMovements(prev => [newMovement, ...prev]);
    setIsModalOpen(false);
    setMvtQty(1);
    setMvtDoc('');
  };

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
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">INFODIX // StockManager</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-400">Projet de Développement Full Stack • Stage INFODIX SARL</p>
          </div>
        </div>

        {/* Live Cluster Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">PostgreSQL: Connecté</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Redis Cache: Synchronisé</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Mouvement</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Valeur Totale du Stock</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalStockValue.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">MAD</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">+4.2%</span> vs mois précédent
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Références Actives (SKUs)</span>
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {products.length}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Réparties sur {categories.length - 1} familles de matériel
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Alertes Stock Critique</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {lowStockCount} <span className="text-sm font-normal text-slate-400">référence(s)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {lowStockCount > 0 ? "Réapprovisionnement suggéré" : "Niveaux nominaux garantis"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Fournisseurs Actifs</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {suppliers.length}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Partenaires certifiés IT & Data
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'inventory' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventaire & Produits
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
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
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'suppliers' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Fournisseurs
          </button>
          <button 
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'architecture' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Architecture Technique
          </button>
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Rechercher par référence, nom ou baie..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-500 shrink-0" />
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
                      <th className="py-3.5 px-4 font-semibold">SKU & Désignation</th>
                      <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                      <th className="py-3.5 px-4 font-semibold">Emplacement</th>
                      <th className="py-3.5 px-4 font-semibold">Quantité en Stock</th>
                      <th className="py-3.5 px-4 font-semibold">Prix Unitaire</th>
                      <th className="py-3.5 px-4 font-semibold">Statut</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Ajustement Rapide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map(product => {
                      const isLow = product.quantity <= product.minThreshold;
                      return (
                        <tr key={product.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                            {product.location}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            <span className={isLow ? 'text-amber-400 font-bold' : 'text-slate-100'}>
                              {product.quantity}
                            </span>
                            <span className="text-xs text-slate-500 font-normal ml-1">
                              (Min: {product.minThreshold})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {product.unitPrice.toFixed(2)} MAD
                          </td>
                          <td className="py-3.5 px-4">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                Stock Faible
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
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition"
                              >
                                -1
                              </button>
                              <button 
                                onClick={() => handleQuickAdjust(product.sku, 1)}
                                title="Entrée rapide de 1 unité"
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition"
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

        {/* Tab 2: Movements Log */}
        {activeTab === 'movements' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Traçabilité des Flux de Stock</h3>
                <p className="text-xs text-slate-400">Historique temps réel des entrées, sorties et transferts</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Dernière synchronisation: instantanée</span>
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
                      <td className="py-3.5 px-4 font-bold text-white">
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

        {/* Tab 3: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{sup.name}</h4>
                    <p className="text-xs text-slate-400">Contact: {sup.contact}</p>
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
                    Commandes en cours: <strong className="text-white font-mono">{sup.activeOrders}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Architecture */}
        {activeTab === 'architecture' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Architecture & Conception Technique</h3>
              <p className="text-sm text-slate-400">Développement Full Stack réalisé pour INFODIX SARL</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
                <h4 className="font-semibold text-white text-sm">Frontend SPA</h4>
                <p className="text-xs text-slate-400">React 18, Vite, TypeScript, Tailwind CSS. Interface réactive et composants modulaires.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
                <h4 className="font-semibold text-white text-sm">Backend API REST</h4>
                <p className="text-xs text-slate-400">Node.js, Express, TypeScript. Endpoints sécurisés pour la gestion des mouvements et des alertes.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">3</div>
                <h4 className="font-semibold text-white text-sm">Cache Redis</h4>
                <p className="text-xs text-slate-400">Mise en cache des niveaux de stock fréquents et gestion des files d'attente de traitement.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
                <h4 className="font-semibold text-white text-sm">PostgreSQL & Docker</h4>
                <p className="text-xs text-slate-400">Base de données relationnelle ACID, déclencheurs d'audit et conteneurisation Docker-Compose.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Enregistrer un Mouvement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
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
                      {p.name} ({p.sku}) — Stock: {p.quantity}
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
                    <option value="INBOUND">Entrée (+)</option>
                    <option value="OUTBOUND">Sortie (-)</option>
                    <option value="TRANSFER">Transfert</option>
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
                  onClick={() => setIsModalOpen(false)}
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
