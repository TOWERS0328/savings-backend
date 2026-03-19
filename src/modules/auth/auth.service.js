const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');

// Categorías por defecto al registrar un usuario
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación',    icon: 'restaurant',     color: '#E24B4A' },
  { name: 'Transporte',      icon: 'directions_car', color: '#F59E0B' },
  { name: 'Salud',           icon: 'local_hospital', color: '#EF4444' },
  { name: 'Entretenimiento', icon: 'movie',          color: '#8B5CF6' },
  { name: 'Educación',       icon: 'school',         color: '#3B82F6' },
  { name: 'Ropa',            icon: 'checkroom',      color: '#EC4899' },
  { name: 'Hogar',           icon: 'home',           color: '#6B7280' },
  { name: 'Servicios',       icon: 'bolt',           color: '#F97316' },
  { name: 'Otros gastos',    icon: 'more_horiz',     color: '#9CA3AF' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario',         icon: 'work',           color: '#1D9E75' },
  { name: 'Freelance',       icon: 'laptop',         color: '#10B981' },
  { name: 'Inversiones',     icon: 'trending_up',    color: '#059669' },
  { name: 'Regalo',          icon: 'card_giftcard',  color: '#34D399' },
  { name: 'Otros ingresos',  icon: 'add_circle',     color: '#6EE7B7' },
];

const DEFAULT_PAYMENT_METHODS = [
  { name: 'Efectivo',        type: 'cash'         },
  { name: 'Tarjeta débito',  type: 'debit_card'   },
  { name: 'Tarjeta crédito', type: 'credit_card'  },
  { name: 'Transferencia',   type: 'transfer'     },
  { name: 'Otro',            type: 'other'        },
];

function signToken(userId, email) {
  return jwt.sign(
    { sub: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register({ name, email, password, language = 'es' }) {
  // Verificar si el email ya existe
  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.code = 'P2002';
    throw err;
  }

  // Hash de la contraseña
  const passwordHash = await bcrypt.hash(password, 12);

  // Crear usuario
  const user = await prisma.users.create({
    data: { name, email, password_hash: passwordHash, language },
    select: { id: true, name: true, email: true, language: true, currency: true, theme: true, onboarding_done: true, created_at: true },
  });

  // Crear categorías y medios de pago por defecto
  await prisma.categories.createMany({
    data: [
      ...DEFAULT_EXPENSE_CATEGORIES.map(c => ({ ...c, user_id: user.id, type: 'expense', is_default: true })),
      ...DEFAULT_INCOME_CATEGORIES.map(c => ({ ...c, user_id: user.id, type: 'income', is_default: true })),
    ],
  });

  await prisma.payment_methods.createMany({
    data: DEFAULT_PAYMENT_METHODS.map(pm => ({ ...pm, user_id: user.id })),
  });

  const token = signToken(user.id, user.email);
  return { user, token };
}

async function login({ email, password }) {
  // Buscar usuario
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  // Verificar contraseña
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const safeUser = {
    id: user.id, name: user.name, email: user.email,
    language: user.language, currency: user.currency,
    theme: user.theme, onboarding_done: user.onboarding_done,
    created_at: user.created_at,
  };

  const token = signToken(user.id, user.email);
  return { user: safeUser, token };
}

async function getProfile(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, language: true, currency: true, theme: true, timezone: true, profile_photo_url: true, onboarding_done: true, created_at: true },
  });
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return user;
}

async function updateProfile(userId, data) {
  const allowed = ['name', 'language', 'currency', 'theme', 'timezone', 'calendar_config'];
  const updateData = {};
  allowed.forEach(key => { if (data[key] !== undefined) updateData[key] = data[key]; });
  updateData.updated_at = new Date();

  return prisma.users.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, language: true, currency: true, theme: true, timezone: true, onboarding_done: true },
  });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw Object.assign(new Error('La contraseña actual es incorrecta'), { status: 400 });

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: newHash, updated_at: new Date() },
  });
  return { message: 'Contraseña actualizada correctamente' };
}

module.exports = { register, login, getProfile, updateProfile, changePassword };