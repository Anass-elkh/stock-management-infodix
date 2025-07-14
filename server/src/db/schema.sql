-- ============================================================
-- SCHEMA RELATIONNEL POSTGRESQL // GESTION DE STOCK INFODIX
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    min_threshold INTEGER NOT NULL DEFAULT 5,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    storage_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE movement_type AS ENUM ('INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT');

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    movement_uuid UUID DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    operator_name VARCHAR(150) NOT NULL,
    reference_document VARCHAR(150),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mise à jour automatique des stocks
CREATE OR REPLACE FUNCTION update_product_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'INBOUND' THEN
        UPDATE products 
        SET current_quantity = current_quantity + NEW.quantity, updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.product_id;
    ELSIF NEW.movement_type = 'OUTBOUND' THEN
        UPDATE products 
        SET current_quantity = current_quantity - NEW.quantity, updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_stock_movement_apply
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION update_product_stock_trigger();
