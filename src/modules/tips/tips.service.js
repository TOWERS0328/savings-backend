const prisma = require('../../config/prisma');

async function getTodayTip(userId) {
  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const to    = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const existing = await prisma.financial_tips.findFirst({
    where: {
      user_id:    userId,
      created_at: { gte: from, lte: to },
    },
  });
  if (existing) return existing;

  const tip = await generateTip(userId);
  return prisma.financial_tips.create({
    data: {
      user_id:  userId,
      message:  tip,
      is_read:  false,
    },
  });
}

async function getAll(userId) {
  return prisma.financial_tips.findMany({
    where:   { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}

async function markAsRead(userId, id) {
  const tip = await prisma.financial_tips.findFirst({ where: { id, user_id: userId } });
  if (!tip) throw Object.assign(new Error('Consejo no encontrado'), { status: 404 });

  return prisma.financial_tips.update({
    where: { id },
    data:  { is_read: true },
  });
}

async function generateTip(userId) {
  const now  = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const summary = await prisma.transactions.groupBy({
    by:    ['type'],
    where: { user_id: userId, date: { gte: from, lte: to } },
    _sum:  { amount: true },
  });

  const income  = Number(summary.find(r => r.type === 'income' )?._sum.amount || 0);
  const expense = Number(summary.find(r => r.type === 'expense')?._sum.amount || 0);
  const balance = income - expense;

  const tips = [];

  if (expense > income) {
    tips.push('Tus gastos superan tus ingresos este mes. Revisa en qué categorías estás gastando más y considera reducir gastos no esenciales.');
    tips.push('Este mes has gastado más de lo que ingresaste. Intenta identificar al menos un gasto recurrente que puedas eliminar.');
  } else if (balance > 0 && income > 0) {
    const savingRate = (balance / income) * 100;
    if (savingRate >= 20) {
      tips.push(`¡Excelente! Estás ahorrando el ${Math.round(savingRate)}% de tus ingresos este mes. Considera invertir ese excedente.`);
    } else {
      tips.push(`Estás ahorrando el ${Math.round(savingRate)}% de tus ingresos. La meta recomendada es al menos el 20%.`);
    }
  } else {
    tips.push('Comienza registrando tus ingresos y gastos diarios. Con solo 2 semanas de datos tendrás una visión clara de tus finanzas.');
  }

  const generic = [
    'Registra cada gasto por pequeño que sea. Los gastos hormiga pueden representar hasta el 15% de tu presupuesto mensual.',
    'Usa la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro.',
    'Antes de una compra no planificada, espera 24 horas. Muchas veces el impulso desaparece.',
    'Tener un fondo de emergencia equivalente a 3 meses de gastos te da tranquilidad ante imprevistos.',
    'Pagar primero el ahorro, como si fuera un gasto fijo, es el hábito más efectivo para construir patrimonio.',
  ];

  tips.push(...generic);

  return tips[Math.floor(Math.random() * tips.length)];
}

module.exports = { getTodayTip, getAll, markAsRead };