const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', require('./modules/auth/auth.routes'));

app.use('/api/transactions', require('./modules/transactions/transactions.routes'));

app.use('/api/categories', require('./modules/categories/categories.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Savings API funcionando' });
});

// Manejador global de errores
app.use(errorHandler);

module.exports = app;