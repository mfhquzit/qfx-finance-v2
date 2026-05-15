CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  account_type VARCHAR(30) NOT NULL DEFAULT 'checking',
  account_number VARCHAR(30) UNIQUE NOT NULL,
  iban VARCHAR(34),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES bank_accounts(id),
  transaction_id UUID NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('debit','credit')),
  amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_account_id UUID,
  to_account_id UUID,
  amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(20,8) DEFAULT 1.0,
  converted_amount DECIMAL(20,8),
  transaction_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reference VARCHAR(100) UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_curr VARCHAR(10) NOT NULL,
  to_curr VARCHAR(10) NOT NULL,
  rate DECIMAL(20,8) NOT NULL,
  source VARCHAR(50) DEFAULT 'exchangerate.host',
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE VIEW account_balances AS
SELECT
  a.id AS account_id,
  a.user_id,
  a.currency,
  a.account_type,
  a.account_number,
  a.status,
  COALESCE(SUM(
    CASE
      WHEN le.entry_type = 'credit' THEN le.amount
      WHEN le.entry_type = 'debit' THEN -le.amount
      ELSE 0
    END
  ), 0) AS balance
FROM bank_accounts a
LEFT JOIN ledger_entries le ON le.account_id = a.id
GROUP BY a.id, a.user_id, a.currency, a.account_type, a.account_number, a.status;
