const prisma = require('../../config/prisma');

async function getEvents(userId, { month, year }) {
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year)  || new Date().getFullYear();

  const from = new Date(y, m - 1, 1, 0, 0, 0);
  const to   = new Date(y, m, 0, 23, 59, 59);

  return prisma.calendar_events.findMany({
    where: {
      user_id:    userId,
      event_date: { gte: from, lte: to },
    },
    orderBy: { event_date: 'asc' },
  });
}

async function getById(userId, id) {
  const event = await prisma.calendar_events.findFirst({
    where: { id, user_id: userId },
  });
  if (!event) throw Object.assign(new Error('Evento no encontrado'), { status: 404 });
  return event;
}

async function create(userId, data) {
  return prisma.calendar_events.create({
    data: {
      user_id:    userId,
      title:      data.title,
      event_date: new Date(data.eventDate),
      event_type: data.eventType,
      amount:     data.amount     || null,
      recurrent:  data.recurrent  ?? false,
      status:     'pending',
    },
  });
}

async function update(userId, id, data) {
  await getById(userId, id);

  const updateData = {};
  if (data.title      !== undefined) updateData.title      = data.title;
  if (data.eventDate  !== undefined) updateData.event_date = new Date(data.eventDate);
  if (data.eventType  !== undefined) updateData.event_type = data.eventType;
  if (data.status     !== undefined) updateData.status     = data.status;
  if (data.amount     !== undefined) updateData.amount     = data.amount;
  if (data.recurrent  !== undefined) updateData.recurrent  = data.recurrent;
  updateData.updated_at = new Date();

  return prisma.calendar_events.update({
    where: { id },
    data: updateData,
  });
}

async function remove(userId, id) {
  await getById(userId, id);
  await prisma.calendar_events.delete({ where: { id } });
  return { message: 'Evento eliminado correctamente' };
}

module.exports = { getEvents, getById, create, update, remove };