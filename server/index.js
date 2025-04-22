import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample data
const initialCustomers = [
  {
    "customerId": "CUST1001",
    "name": "Alice Johnson",
    "monthlyIncome": 6200,
    "monthlyExpenses": 3500,
    "creditScore": 710,
    "outstandingLoans": 15000,
    "loanRepaymentHistory": [1, 0, 1, 1, 1, 1, 0, 1],
    "accountBalance": 12500,
    "status": "Review"
  },
  {
    "customerId": "CUST1002",
    "name": "Bob Smith",
    "monthlyIncome": 4800,
    "monthlyExpenses": 2800,
    "creditScore": 640,
    "outstandingLoans": 20000,
    "loanRepaymentHistory": [1, 1, 1, 0, 0, 1, 0, 0],
    "accountBalance": 7300,
    "status": "Approved"
  },
  {
    "customerId": "CUST1003",
    "name": "Charlie Davis",
    "monthlyIncome": 7500,
    "monthlyExpenses": 4200,
    "creditScore": 780,
    "outstandingLoans": 25000,
    "loanRepaymentHistory": [1, 1, 1, 1, 1, 1, 1, 1],
    "accountBalance": 18900,
    "status": "Approved"
  },
  {
    "customerId": "CUST1004",
    "name": "Diana Wilson",
    "monthlyIncome": 3800,
    "monthlyExpenses": 2500,
    "creditScore": 590,
    "outstandingLoans": 12000,
    "loanRepaymentHistory": [0, 0, 1, 0, 1, 0, 1, 0],
    "accountBalance": 3200,
    "status": "Rejected"
  },
  {
    "customerId": "CUST1005",
    "name": "Edward Brown",
    "monthlyIncome": 5500,
    "monthlyExpenses": 3100,
    "creditScore": 680,
    "outstandingLoans": 18000,
    "loanRepaymentHistory": [1, 1, 0, 1, 1, 0, 1, 1],
    "accountBalance": 9800,
    "status": "Review"
  },
  {
    "customerId": "CUST1006",
    "name": "Fiona Taylor",
    "monthlyIncome": 9200,
    "monthlyExpenses": 5800,
    "creditScore": 820,
    "outstandingLoans": 30000,
    "loanRepaymentHistory": [1, 1, 1, 1, 1, 1, 1, 1],
    "accountBalance": 27500,
    "status": "Approved"
  },
  {
    "customerId": "CUST1007",
    "name": "George Martinez",
    "monthlyIncome": 4200,
    "monthlyExpenses": 3300,
    "creditScore": 610,
    "outstandingLoans": 22000,
    "loanRepaymentHistory": [0, 1, 0, 0, 1, 0, 1, 0],
    "accountBalance": 5100,
    "status": "Review"
  },
  {
    "customerId": "CUST1008",
    "name": "Hannah Anderson",
    "monthlyIncome": 6800,
    "monthlyExpenses": 3900,
    "creditScore": 740,
    "outstandingLoans": 17000,
    "loanRepaymentHistory": [1, 1, 1, 0, 1, 1, 1, 1],
    "accountBalance": 15300,
    "status": "Review"
  }
];

// In-memory storage
let customers = [...initialCustomers];
let alerts = [];

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.customerId === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

app.patch('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const customerIndex = customers.findIndex(c => c.customerId === id);
  if (customerIndex === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  // Update customer status
  customers[customerIndex] = {
    ...customers[customerIndex],
    status
  };
  
  res.json(customers[customerIndex]);
});

app.post('/api/alerts', (req, res) => {
  const { customerId, riskScore } = req.body;
  
  const newAlert = {
    id: Date.now().toString(),
    customerId,
    riskScore,
    createdAt: new Date().toISOString(),
    status: 'New'
  };
  
  alerts.push(newAlert);
  res.status(201).json(newAlert);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('dist'));
  
//   // Handle client-side routing
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../dist/index.html'));
//   });
// }

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});