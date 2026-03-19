const prisma = require('../../config/prisma');

async function getAll(userId) {
  return prisma.payment_methods.findMany({
    where: { user_id: userId },
    orderBy: { name: 'asc' },
  });
}

async function getById(userId, id) {
  const method = await prisma.payment_methods.findFirst({
    where: { id, user_id: userId },
  });
  if (!method) throw Object.assign(new Error('Medio de pago no encontrado'), { status: 404 });
  return method;
}

async function create(userId, data) {
  return prisma.payment_methods.create({
    data: {
      user_id: userId,
      name:    data.name,
      type:    data.type,
    },
  });
}

async function update(userId, id, data) {
  await getById(userId, id);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  updateData.updated_at = new Date();

  return prisma.payment_methods.update({
    where: { id },
    data: updateData,
  });
}

async function remove(userId, id) {
  await getById(userId, id);
  await prisma.payment_methods.delete({ where: { id } });
  return { message: 'Medio de pago eliminado correctamente' };
}

module.exports = { getAll, getById, create, update, remove };