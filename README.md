# sevdesk MCP Server v2.0

A comprehensive Model Context Protocol (MCP) server for integrating with the [sevdesk](https://sevdesk.de) German accounting and bookkeeping API. Features **76 tools** for full CRUD operations across all major sevdesk resources.

## Features

- **Contact Management** - Full CRUD for customers, suppliers, and partners
- **Invoice Handling** - Create, send, and manage sales invoices with line items
- **Expense Tracking** - Manage vouchers/receipts with booking and enshrinement
- **Order Management** - Handle offers, order confirmations, and delivery notes
- **Credit Notes** - Full credit note lifecycle management
- **Products & Services** - Manage parts catalog with stock tracking
- **Bank Integration** - Accounts, balances, and transaction management
- **Tags & Categories** - Organize records with tags
- **Contact Details** - Addresses and communication ways (email, phone)
- **PDF Generation** - Download PDFs for invoices, orders, and credit notes
- **Email Sending** - Send documents directly via email

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- A sevdesk account with API access

## Installation

```bash
git clone https://github.com/sajadghawami/sevdesk-mcp.git
cd sevdesk-mcp

# Install dependencies (choose one)
pnpm install   # or: npm install | yarn install

# Build
pnpm build     # or: npm run build | yarn build
```

## Configuration

### Getting Your API Token

1. Log in to your sevdesk account at [my.sevdesk.de](https://my.sevdesk.de)
2. Navigate to **Settings** → **Users** → **API Token**
3. Generate or copy your API token

### Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sevdesk": {
      "command": "node",
      "args": ["/path/to/sevdesk-mcp/build/index.js"],
      "env": {
        "SEVDESK_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### Claude Code

Add to `.mcp.json` in your project directory (project-specific) or `~/.claude/.mcp.json` (global):

```json
{
  "mcpServers": {
    "sevdesk-mcp": {
      "command": "node",
      "args": ["/path/to/sevdesk-mcp/build/index.js"],
      "env": {
        "SEVDESK_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## Available Tools (76 total)

### Contacts (6 tools)

| Tool | Description |
|------|-------------|
| `list_contacts` | List customers, suppliers, and partners |
| `get_contact` | Get detailed contact information by ID |
| `create_contact` | Create a new contact |
| `update_contact` | Update existing contact |
| `delete_contact` | Delete a contact |
| `get_next_customer_number` | Get next available customer number |

### Invoices (14 tools)

| Tool | Description |
|------|-------------|
| `list_invoices` | List sales invoices with filters |
| `get_invoice` | Get invoice details by ID |
| `create_invoice` | Create invoice with line items |
| `update_invoice` | Update existing invoice |
| `delete_invoice` | Delete an invoice |
| `get_invoice_pdf` | Get invoice PDF as base64 |
| `send_invoice_email` | Send invoice via email |
| `change_invoice_status` | Change invoice status |
| `book_invoice_payment` | Record a payment |
| `list_invoice_positions` | List invoice line items |
| `get_invoice_position` | Get position details |
| `create_invoice_position` | Add line item |
| `update_invoice_position` | Update line item |
| `delete_invoice_position` | Delete line item |

### Vouchers (12 tools)

| Tool | Description |
|------|-------------|
| `list_vouchers` | List expense vouchers/receipts |
| `get_voucher` | Get voucher details by ID |
| `create_voucher` | Create expense voucher |
| `update_voucher` | Update existing voucher |
| `delete_voucher` | Delete a voucher |
| `book_voucher_payment` | Record payment on voucher |
| `enshrine_voucher` | Finalize/lock a voucher |
| `list_voucher_positions` | List voucher line items |
| `get_voucher_position` | Get position details |
| `create_voucher_position` | Add line item |
| `update_voucher_position` | Update line item |
| `delete_voucher_position` | Delete line item |

### Orders (13 tools)

| Tool | Description |
|------|-------------|
| `list_orders` | List orders (offers, confirmations) |
| `get_order` | Get order details by ID |
| `create_order` | Create order with line items |
| `update_order` | Update existing order |
| `delete_order` | Delete an order |
| `get_order_pdf` | Get order PDF as base64 |
| `send_order_email` | Send order via email |
| `change_order_status` | Change order status |
| `list_order_positions` | List order line items |
| `get_order_position` | Get position details |
| `create_order_position` | Add line item |
| `update_order_position` | Update line item |
| `delete_order_position` | Delete line item |

### Credit Notes (12 tools)

| Tool | Description |
|------|-------------|
| `list_credit_notes` | List credit notes |
| `get_credit_note` | Get credit note by ID |
| `create_credit_note` | Create credit note |
| `update_credit_note` | Update credit note |
| `delete_credit_note` | Delete credit note |
| `get_credit_note_pdf` | Get PDF as base64 |
| `send_credit_note_email` | Send via email |
| `list_credit_note_positions` | List line items |
| `get_credit_note_position` | Get position |
| `create_credit_note_position` | Add line item |
| `update_credit_note_position` | Update line item |
| `delete_credit_note_position` | Delete line item |

### Bank Accounts (6 tools)

| Tool | Description |
|------|-------------|
| `list_check_accounts` | List all bank accounts |
| `get_check_account` | Get account details |
| `get_check_account_balance` | Get balance at date |
| `create_check_account` | Create bank account |
| `update_check_account` | Update account |
| `delete_check_account` | Delete account |

### Transactions (5 tools)

| Tool | Description |
|------|-------------|
| `list_transactions` | List bank transactions |
| `get_transaction` | Get transaction details |
| `create_transaction` | Create transaction |
| `update_transaction` | Update transaction |
| `delete_transaction` | Delete transaction |

### Parts/Products (6 tools)

| Tool | Description |
|------|-------------|
| `list_parts` | List products/services |
| `get_part` | Get part details |
| `create_part` | Create product/service |
| `update_part` | Update part |
| `delete_part` | Delete part |
| `get_part_stock` | Get current stock level |

### Tags (8 tools)

| Tool | Description |
|------|-------------|
| `list_tags` | List all tags |
| `get_tag` | Get tag details |
| `create_tag` | Create new tag |
| `update_tag` | Update tag |
| `delete_tag` | Delete tag |
| `list_tag_relations` | List tagged objects |
| `add_tag_to_object` | Tag an object |
| `remove_tag_from_object` | Remove tag |

### Contact Addresses (5 tools)

| Tool | Description |
|------|-------------|
| `list_contact_addresses` | List addresses |
| `get_contact_address` | Get address details |
| `create_contact_address` | Create address |
| `update_contact_address` | Update address |
| `delete_contact_address` | Delete address |

### Communication Ways (5 tools)

| Tool | Description |
|------|-------------|
| `list_communication_ways` | List email/phone entries |
| `get_communication_way` | Get details |
| `create_communication_way` | Create entry |
| `update_communication_way` | Update entry |
| `delete_communication_way` | Delete entry |

## Development

### Build Commands

```bash
# Install dependencies
pnpm install

# Build the TypeScript source
pnpm build

# Start the server
pnpm start

# Watch mode for development
pnpm dev
```

### Project Structure

```
sevdesk-mcp/
├── src/
│   ├── index.ts           # MCP server entry + 76 tool registrations
│   ├── api.ts             # HTTP client (GET/POST/PUT/DELETE/PDF)
│   ├── types.ts           # TypeScript interfaces (20+ types)
│   └── tools/
│       ├── contacts.ts    # Contact CRUD
│       ├── invoices.ts    # Invoice CRUD + PDF/email/status/positions
│       ├── vouchers.ts    # Voucher CRUD + book/enshrine/positions
│       ├── accounts.ts    # Bank account + transaction CRUD
│       ├── orders.ts      # Order CRUD + PDF/email/positions
│       ├── creditnotes.ts # Credit note CRUD + PDF/email/positions
│       ├── parts.ts       # Part CRUD + stock
│       ├── tags.ts        # Tag + TagRelation CRUD
│       ├── addresses.ts   # Contact address CRUD
│       └── communication.ts # Communication way CRUD
├── build/                 # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

## API Reference

This server integrates with the sevdesk REST API. For complete API documentation, see:

- [sevdesk API Documentation](https://api.sevdesk.de/)
- API Base URL: `https://my.sevdesk.de/api/v1`

## License

ISC
