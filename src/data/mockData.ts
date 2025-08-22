export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
}

export interface Movement {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  operator: string;
  referenceDoc: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  rating: number;
  activeOrders: number;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "PRD-001",
    sku: "ELEC-SRV-902",
    name: "Serveur Rack 2U Dell PowerEdge",
    category: "Infrastructure",
    quantity: 14,
    minThreshold: 5,
    unitPrice: 2450.00,
    supplier: "Dell Technologies Maroc",
    location: "Baie A-04",
    lastUpdated: "2025-09-02 14:32"
  },
  {
    id: "PRD-002",
    sku: "NET-SW-48P",
    name: "Switch Cisco Catalyst 48 Ports PoE+",
    category: "Réseau",
    quantity: 8,
    minThreshold: 4,
    unitPrice: 1180.50,
    supplier: "Cisco Systems Solutions",
    location: "Rayon B-12",
    lastUpdated: "2025-09-03 10:15"
  },
  {
    id: "PRD-003",
    sku: "SEC-FW-FG60",
    name: "Firewall Fortinet FortiGate 60F",
    category: "Sécurité",
    quantity: 3,
    minThreshold: 5,
    unitPrice: 890.00,
    supplier: "Fortinet Direct",
    location: "Coffre S-02",
    lastUpdated: "2025-09-04 09:20"
  },
  {
    id: "PRD-004",
    sku: "ACC-BAT-UPS",
    name: "Onduleur APC Smart-UPS RT 3000VA",
    category: "Énergie",
    quantity: 2,
    minThreshold: 4,
    unitPrice: 1420.00,
    supplier: "Schneider Electric Maghreb",
    location: "Zone Énergie E-01",
    lastUpdated: "2025-09-01 16:50"
  },
  {
    id: "PRD-005",
    sku: "STO-SSD-384",
    name: "Disque SSD Entreprise NVMe 3.84TB",
    category: "Stockage",
    quantity: 32,
    minThreshold: 10,
    unitPrice: 410.00,
    supplier: "Kingston Enterprise",
    location: "Tiroir T-08",
    lastUpdated: "2025-09-05 11:00"
  },
  {
    id: "PRD-006",
    sku: "CAB-FO-OM4",
    name: "Jarretière Optique LC-LC Duplex 5m OM4",
    category: "Câblage",
    quantity: 120,
    minThreshold: 30,
    unitPrice: 18.50,
    supplier: "Nexans Maroc",
    location: "Rayon C-03",
    lastUpdated: "2025-09-05 15:45"
  }
];

export const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: "MVT-8921",
    timestamp: "2025-09-05 15:45",
    sku: "CAB-FO-OM4",
    productName: "Jarretière Optique LC-LC Duplex 5m OM4",
    type: "INBOUND",
    quantity: 50,
    operator: "Anass EL Kharbaoui",
    referenceDoc: "BL-2025-9982"
  },
  {
    id: "MVT-8920",
    timestamp: "2025-09-05 11:00",
    sku: "STO-SSD-384",
    productName: "Disque SSD Entreprise NVMe 3.84TB",
    type: "OUTBOUND",
    quantity: 8,
    operator: "Karim Benani",
    referenceDoc: "OT-DATA-042"
  },
  {
    id: "MVT-8919",
    timestamp: "2025-09-04 16:20",
    sku: "SEC-FW-FG60",
    productName: "Firewall Fortinet FortiGate 60F",
    type: "TRANSFER",
    quantity: 2,
    operator: "Anass EL Kharbaoui",
    referenceDoc: "TR-RACK-009"
  },
  {
    id: "MVT-8918",
    timestamp: "2025-09-03 10:15",
    sku: "NET-SW-48P",
    productName: "Switch Cisco Catalyst 48 Ports PoE+",
    type: "INBOUND",
    quantity: 4,
    operator: "Omar Tazi",
    referenceDoc: "BL-CIS-7721"
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "SUP-01",
    name: "Dell Technologies Maroc",
    contact: "Hassan Amrani",
    email: "contact@dell.ma",
    phone: "+212 522 99 88 77",
    rating: 4.9,
    activeOrders: 2
  },
  {
    id: "SUP-02",
    name: "Cisco Systems Solutions",
    contact: "Leila Mansouri",
    email: "supply@cisco-solutions.ma",
    phone: "+212 522 45 12 00",
    rating: 4.8,
    activeOrders: 1
  },
  {
    id: "SUP-03",
    name: "Fortinet Direct",
    contact: "Mehdi Cherkaoui",
    email: "orders@fortinet-partner.ma",
    phone: "+212 537 77 66 55",
    rating: 4.7,
    activeOrders: 1
  },
  {
    id: "SUP-04",
    name: "Schneider Electric Maghreb",
    contact: "Youssef Idrissi",
    email: "energy@schneider.ma",
    phone: "+212 522 30 40 50",
    rating: 4.9,
    activeOrders: 2
  }
];
