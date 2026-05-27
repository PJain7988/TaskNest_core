import { useAuth } from '@/context/AuthContext'

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    team: 'Team',
    messages: 'Messages',
    aicopilot: 'AI Copilot',
    settings: 'Settings',
    logout: 'Logout',
    profile: 'Profile',
    notifications: 'Notifications',
    appearance: 'Appearance',
    language: 'Language',
    welcomeBack: 'Welcome back',
    loggedAs: 'Logged in as',
    activityLog: 'Activity Log',
    newProject: 'New Project',
    createTask: 'Create Task',
    recentActivity: 'Recent Activity',
    projectVelocity: 'Project Velocity',
    searchPlaceholder: 'Search projects, tasks...',
    security: 'Security',
  },
  es: {
    dashboard: 'Tablero',
    projects: 'Proyectos',
    tasks: 'Tareas',
    team: 'Equipo',
    messages: 'Mensajes',
    aicopilot: 'AI Copiloto',
    settings: 'Ajustes',
    logout: 'Cerrar sesión',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    appearance: 'Apariencia',
    language: 'Idioma',
    welcomeBack: 'Bienvenido de nuevo',
    loggedAs: 'Sesión iniciada como',
    activityLog: 'Registro de actividad',
    newProject: 'Nuevo Proyecto',
    createTask: 'Crear Tarea',
    recentActivity: 'Actividad Reciente',
    projectVelocity: 'Velocidad del Proyecto',
    searchPlaceholder: 'Buscar proyectos, tareas...',
    security: 'Seguridad',
  },
  fr: {
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    tasks: 'Tâches',
    team: 'Équipe',
    messages: 'Messages',
    aicopilot: 'AI Copilote',
    settings: 'Paramètres',
    logout: 'Se déconnecter',
    profile: 'Profil',
    notifications: 'Notifications',
    appearance: 'Apparence',
    language: 'Langue',
    welcomeBack: 'Bon retour',
    loggedAs: 'Connecté en tant que',
    activityLog: 'Journal d\'activité',
    newProject: 'Nouveau Projet',
    createTask: 'Créer une tâche',
    recentActivity: 'Activité Récente',
    projectVelocity: 'Vélocité du Projet',
    searchPlaceholder: 'Rechercher des projets, des tâches...',
    security: 'Sécurité',
  },
  de: {
    dashboard: 'Dashboard',
    projects: 'Projekte',
    tasks: 'Aufgaben',
    team: 'Team',
    messages: 'Nachrichten',
    aicopilot: 'KI-Copilot',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    profile: 'Profil',
    notifications: 'Benachrichtigungen',
    appearance: 'Aussehen',
    language: 'Sprache',
    welcomeBack: 'Willkommen zurück',
    loggedAs: 'Angemeldet als',
    activityLog: 'Aktivitätsprotokoll',
    newProject: 'Neues Projekt',
    createTask: 'Aufgabe erstellen',
    recentActivity: 'Kürzliche Aktivitäten',
    projectVelocity: 'Projektgeschwindigkeit',
    searchPlaceholder: 'Suchen Sie nach Projekten, Aufgaben...',
    security: 'Sicherheit',
  }
}

export function useTranslation() {
  const { user } = useAuth()
  const lang = user?.language || 'en'

  const t = (key: string): string => {
    const langDict = translations[lang] || translations['en']
    return langDict[key] || translations['en'][key] || key
  }

  return { t, currentLanguage: lang }
}
