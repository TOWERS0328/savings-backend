const prisma = require('../../config/prisma');

function getDateRange(period) {
  const now = new Date();
  let from, to;

  switch (period) {
    case 'daily':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'weekly':
      const day = now.getDay();
      from = new Date(now);
      from.setDate(now.getDate() - day);
      from.setHours(0, 0, 0, 0);
      to = new Date(from);
      to.setDate(from.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      break;
    case 'biweekly':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() <= 15 ? 1 : 16, 0, 0, 0);
      to   = new Date(now.getFullYear(), now.getMonth(), now.getDate() <= 15 ? 15 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), 23, 59, 59);
      break;
    case 'annual':
      from = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'monthly':
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
  }
  return { from, to };
}

async function getTransactions(userId, { period = 'monthly', type, page = 1, limit = 20, from, to }) {
  const dateRange = from && to
    ? { gte: new Date(from), lte: new Date(to) }
    : (() => { const r = getDateRange(period); return { gte: r.from, lte: r.to }; })();

  const where = {
    user_id: userId,
    date: dateRange,
    ...(type && { type }),
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [data, total] = await Promise.all([
    prisma.transactions.findMany({
      where,
      include: {
        categories:      { select: { id: true, name: true, icon: true, color: true } },
        payment_methods: { select: { id: true, name: true, type: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.transactions.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
}

async function getSummary(userId, { from, to, period = 'monthly' }) {
  const dateRange = from && to
    ? { gte: new Date(from), lte: new Date(to) }
    : (() => { const r = getDateRange(period); return { gte: r.from, lte: r.to }; })();

  const result = await prisma.transactions.groupBy({
    by: ['type'],
    where: { user_id: userId, date: dateRange },
    _sum: { amount: true },
  });

  const income  = Number(result.find(r => r.type === 'income' )?._sum.amount || 0);
  const expense = Number(result.find(r => r.type === 'expense')?._sum.amount || 0);

  return { income, expense, balance: income - expense };
}

async function getByCategory(userId, { period = 'monthly', from, to }) {
  const dateRange = from && to
    ? { gte: new Date(from), lte: new Date(to) }
    : (() => { const r = getDateRange(period); return { gte: r.from, lte: r.to }; })();

  const result = await prisma.transactions.groupBy({
    by: ['category_id'],
    where: { user_id: userId, type: 'expense', date: dateRange },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const totalExpense = result.reduce((acc, r) => acc + Number(r._sum.amount || 0), 0);

  const withCategories = await Promise.all(
    result.map(async (r) => {
      const category = r.category_id
        ? await prisma.categories.findUnique({
            where: { id: r.category_id },
            select: { id: true, name: true, icon: true, color: true },
          })
        : { id: null, name: 'Sin categoría', icon: 'more_horiz', color: '#9CA3AF' };

      const amount = Number(r._sum.amount || 0);
      return {
        category,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    })
  );

  return withCategories;
}

async function getById(userId, id) {
  const transaction = await prisma.transactions.findFirst({
    where: { id, user_id: userId },
    include: {
      categories:      { select: { id: true, name: true, icon: true, color: true } },
      payment_methods: { select: { id: true, name: true, type: true } },
    },
  });
  if (!transaction) throw Object.assign(new Error('Transacción no encontrada'), { status: 404 });
  return transaction;
}

async function create(userId, data) {
  return prisma.transactions.create({
    data: {
      user_id:           userId,
      type:              data.type,
      amount:            data.amount,
      establishment:     data.establishment || null,
      category_id:       data.categoryId || null,
      payment_method_id: data.paymentMethodId || null,
      description:       data.description || null,
      date:              data.date ? new Date(data.date) : new Date(),
    },
    include: {
      categories:      { select: { id: true, name: true, icon: true, color: true } },
      payment_methods: { select: { id: true, name: true, type: true } },
    },
  });
}

async function update(userId, id, data) {
  await getById(userId, id);

  const updateData = {};
  if (data.type              !== undefined) updateData.type              = data.type;
  if (data.amount            !== undefined) updateData.amount            = data.amount;
  if (data.establishment     !== undefined) updateData.establishment     = data.establishment;
  if (data.categoryId        !== undefined) updateData.category_id       = data.categoryId;
  if (data.paymentMethodId   !== undefined) updateData.payment_method_id = data.paymentMethodId;
  if (data.description       !== undefined) updateData.description       = data.description;
  if (data.date              !== undefined) updateData.date              = new Date(data.date);
  if (data.photoUrl          !== undefined) updateData.photo_url         = data.photoUrl;
  updateData.updated_at = new Date();

  return prisma.transactions.update({
    where: { id },
    data: updateData,
    include: {
      categories:      { select: { id: true, name: true, icon: true, color: true } },
      payment_methods: { select: { id: true, name: true, type: true } },
    },
  });
}

async function remove(userId, id) {
  await getById(userId, id);
  await prisma.transactions.delete({ where: { id } });
  return { message: 'Transacción eliminada correctamente' };
}

async function updatePhoto(userId, id, photoUrl) {
  await getById(userId, id);
  return prisma.transactions.update({
    where: { id },
    data: { photo_url: photoUrl, updated_at: new Date() },
    select: { id: true, photo_url: true },
  });
}

module.exports = { getTransactions, getSummary, getByCategory, getById, create, update, remove, updatePhoto };