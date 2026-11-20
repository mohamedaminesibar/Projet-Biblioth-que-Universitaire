import { Router } from 'express';
import { db } from '../db/database';
import { CURRENT_STUDENT, CURRENT_LIBRARIAN } from '../../data/mockData';
import { UserProfile, Role } from '../../types/library';

export const authRouter = Router();

// Helper to resolve user profile details with avatars
function buildUserProfile(
  id: string,
  email: string,
  name: string,
  role: Role,
  filiere?: string,
  department?: string,
  customAvatar?: string
): UserProfile {
  const isLibrarian = role === 'librarian';
  return {
    id,
    name,
    email,
    role,
    filiere: isLibrarian ? undefined : (filiere || 'Génie Informatique & Systèmes Décisionnels (EST)'),
    department: isLibrarian ? (department || 'Direction de la Médiathèque & Ressources Numériques') : undefined,
    studentNumber: isLibrarian ? undefined : 'EST-2024-8942',
    avatarUrl:
      customAvatar ||
      (isLibrarian
        ? (email === 'mohamedamine.sibari@uit.ac.ma'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : CURRENT_LIBRARIAN.avatarUrl)
        : CURRENT_STUDENT.avatarUrl),
  };
}

/**
 * POST /api/auth/google
 * Real Google Account Authentication & Automatic Role Assignment
 */
authRouter.post('/google', (req, res) => {
  const { email, name, avatarUrl } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Adresse email Google invalide ou manquante.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const displayName = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();

  // 1. Explicit mapping for the user's requested accounts:
  // - mohamedamine.sibari@usmba.ac.ma -> Étudiant
  // - mohamedamine.sibari@uit.ac.ma -> Responsable
  let assignedRole: Role;
  let department: string | undefined;
  let filiere: string | undefined;

  if (cleanEmail === 'mohamedamine.sibari@usmba.ac.ma') {
    assignedRole = 'student';
    filiere = 'Génie Informatique & Systèmes Décisionnels (EST)';
  } else if (cleanEmail === 'mohamedamine.sibari@uit.ac.ma') {
    assignedRole = 'librarian';
    department = 'Direction de la Médiathèque & Ressources Numériques';
  } else {
    // 2. Check if user already exists in database
    let existingUser;
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        existingUser = u;
        break;
      }
    }

    if (existingUser) {
      assignedRole = existingUser.role;
      filiere = existingUser.filiere;
      department = existingUser.department;
    } else {
      // 3. Heuristic for new institutional Google accounts
      const isLibrarian =
        cleanEmail.startsWith('admin') ||
        cleanEmail.startsWith('biblio') ||
        cleanEmail.includes('responsable') ||
        cleanEmail.endsWith('@est.usmba.ac.ma') ||
        cleanEmail.endsWith('@uit.ac.ma');

      assignedRole = isLibrarian ? 'librarian' : 'student';
      if (isLibrarian) {
        department = 'Direction de la Médiathèque & Ressources Numériques';
      } else {
        filiere = 'Génie Informatique & Systèmes Décisionnels (EST)';
      }
    }
  }

  // Find or create in db.users
  let userId: string = `usr_google_${Date.now()}`;
  for (const u of db.users.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      userId = u.id;
      break;
    }
  }

  const userProfile = buildUserProfile(
    userId,
    cleanEmail,
    displayName,
    assignedRole,
    filiere,
    department,
    avatarUrl
  );

  // Update or insert into database
  db.users.set(userId, {
    id: userId,
    name: userProfile.name,
    email: userProfile.email,
    role: userProfile.role,
    filiere: userProfile.filiere,
    department: userProfile.department,
  });

  return res.json({
    success: true,
    user: userProfile,
    provider: 'google',
    message: `Connexion Google réussie. Accès attribué : ${
      assignedRole === 'student' ? 'Profil Étudiant' : 'Profil Responsable'
    }.`,
  });
});

/**
 * GET /api/auth/users
 * Returns list of accounts and their assigned roles (Accessible by Responsables)
 */
authRouter.get('/users', (req, res) => {
  const usersList = Array.from(db.users.values()).map((u) =>
    buildUserProfile(u.id, u.email, u.name, u.role, u.filiere, u.department)
  );
  return res.json({ success: true, users: usersList });
});

/**
 * POST /api/auth/assign-role
 * Assign or update a user's role (Étudiant vs Responsable)
 */
authRouter.post('/assign-role', (req, res) => {
  const { email, role, name } = req.body;

  if (!email || !role || (role !== 'student' && role !== 'librarian')) {
    return res.status(400).json({ error: 'Email et rôle valide (student ou librarian) requis.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Find existing or create new
  let targetId = `usr_${Date.now()}`;
  for (const u of db.users.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      targetId = u.id;
      break;
    }
  }

  const updatedName = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();
  const profile = buildUserProfile(targetId, cleanEmail, updatedName, role);

  db.users.set(targetId, {
    id: targetId,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    filiere: profile.filiere,
    department: profile.department,
  });

  return res.json({
    success: true,
    user: profile,
    message: `Rôle mis à jour avec succès : ${cleanEmail} est désormais ${
      role === 'student' ? 'Étudiant' : 'Responsable'
    }.`,
  });
});

/**
 * POST /api/auth/login
 * Standard email / password institutional login
 */
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Veuillez saisir votre adresse email institutionnelle.' });
  }

  if (!password || typeof password !== 'string' || password.length < 3) {
    return res.status(400).json({ error: 'Veuillez saisir un mot de passe valide.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Special explicit accounts
  if (cleanEmail === 'mohamedamine.sibari@usmba.ac.ma') {
    const profile = buildUserProfile(
      CURRENT_STUDENT.id,
      cleanEmail,
      'Mohamed Amine Sibari',
      'student'
    );
    return res.json({ success: true, user: profile });
  }

  if (cleanEmail === 'mohamedamine.sibari@uit.ac.ma') {
    const profile = buildUserProfile(
      'usr_lib_uit_01',
      cleanEmail,
      'Mohamed Amine Sibari',
      'librarian',
      undefined,
      'Direction de la Médiathèque & Ressources Numériques'
    );
    return res.json({ success: true, user: profile });
  }

  // 1. Search existing users in the database
  let foundUser: UserProfile | undefined;
  for (const user of db.users.values()) {
    if (user.email.toLowerCase() === cleanEmail) {
      foundUser = buildUserProfile(
        user.id,
        user.email,
        user.name,
        user.role,
        user.filiere,
        user.department
      );
      break;
    }
  }

  // 2. If not pre-seeded in db.users, determine role and register automatically
  if (!foundUser) {
    const isLibrarian =
      cleanEmail === CURRENT_LIBRARIAN.email.toLowerCase() ||
      cleanEmail.startsWith('admin') ||
      cleanEmail.startsWith('biblio') ||
      cleanEmail.includes('responsable') ||
      cleanEmail.endsWith('@est.usmba.ac.ma') ||
      cleanEmail.endsWith('@uit.ac.ma');

    const generatedId = `usr_${Date.now()}`;
    const formattedName = cleanEmail
      .split('@')[0]
      .split('.')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const role: Role = isLibrarian ? 'librarian' : 'student';
    foundUser = buildUserProfile(generatedId, cleanEmail, formattedName, role);

    db.users.set(foundUser.id, {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      filiere: foundUser.filiere,
      department: foundUser.department,
    });
  }

  return res.json({
    success: true,
    user: foundUser,
    message: `Authentification réussie pour ${foundUser.name}`,
  });
});
