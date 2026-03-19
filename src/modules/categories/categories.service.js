const prisma = require('../../config/prisma');

async function getAll(userId, { type } = {}) {
  return prisma.categories.findMany({
    where: {
      user_id: userId,
      ...(type && { type }),
    },
    orderBy: { name: 'asc' },
  });
}

async function getById(userId, id) {
  const category = await prisma.categories.findFirst({
    where: { id, user_id: userId },
  });
  if (!category) throw Object.assign(new Error('Categoría no encontrada'), { status: 404 });
  return category;
}

async function create(userId, data) {
  return prisma.categories.create({
    data: {
      user_id: userId,
      name:    data.name,
      icon:    data.icon,
      color:   data.color,
      type:    data.type,
    },
  });
}

async function update(userId, id, data) {
  await getById(userId, id);

  const updateData = {};
  if (data.name  !== undefined) updateData.name  = data.name;
  if (data.icon  !== undefined) updateData.icon  = data.icon;
  if (data.color !== undefined) updateData.color = data.color;
  updateData.updated_at = new Date();

  return prisma.categories.update({
    where: { id },
    data: updateData,
  });
}

async function remove(userId, id) {
  await getById(userId, id);
  await prisma.categories.delete({ where: { id } });
  return { message: 'Categoría eliminada correctamente' };
}

module.exports = { getAll, getById, create, update, remove };