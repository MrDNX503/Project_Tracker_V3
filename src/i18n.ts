// ============================================================
// Lightweight i18n — Spanish (default) / English
// ============================================================

import { create } from 'zustand';

export type Lang = 'es' | 'en';

const LANG_KEY = 'kash_lang';

const dict = {
  // Navigation
  'nav.dashboard': { es: 'Inicio', en: 'Dashboard' },
  'nav.projects': { es: 'Proyectos', en: 'Projects' },
  'nav.planner': { es: 'Planner', en: 'Planner' },
  'nav.susan': { es: 'Susan AI', en: 'Susan AI' },
  'nav.analytics': { es: 'Analítica', en: 'Analytics' },
  'nav.settings': { es: 'Ajustes', en: 'Settings' },

  // Dashboard
  'dash.greeting.morning': { es: 'Buenos días', en: 'Good morning' },
  'dash.greeting.afternoon': { es: 'Buenas tardes', en: 'Good afternoon' },
  'dash.greeting.evening': { es: 'Buenas noches', en: 'Good evening' },
  'dash.ready': { es: '¿Listo para avanzar hoy?', en: 'Ready to make some progress today?' },
  'dash.myday': { es: 'Mi día', en: 'My Day' },
  'dash.newproject': { es: 'Nuevo proyecto', en: 'New Project' },
  'dash.activeprojects': { es: 'Proyectos activos', en: 'Active Projects' },
  'dash.todaytasks': { es: 'Tareas de hoy', en: "Today's Tasks" },
  'dash.avgprogress': { es: 'Progreso promedio', en: 'Avg Progress' },
  'dash.streak': { es: 'Racha actual', en: 'Current Streak' },
  'dash.recentactivity': { es: 'Actividad reciente', en: 'Recent Activity' },
  'dash.todayplan': { es: 'Plan de hoy', en: "Today's Plan" },

  // Planner
  'planner.title': { es: 'Planner diario', en: 'Daily Planner' },
  'planner.today': { es: 'Hoy', en: 'Today' },
  'planner.sync': { es: 'Sincronizar calendario', en: 'Sync Calendar' },
  'planner.notconnected': { es: 'Calendario no conectado', en: 'Calendar not connected' },
  'planner.scheduletask': { es: 'Agendar tarea', en: 'Schedule Task' },
  'planner.addtoschedule': { es: 'Agregar al horario', en: 'Add to Schedule' },
  'planner.tasktitle': { es: 'Título de la tarea', en: 'Task title' },
  'planner.starttime': { es: 'Hora de inicio (opcional)', en: 'Start Time (optional)' },
  'planner.unscheduled': { es: 'Sin horario hoy', en: 'Unscheduled Today' },
  'planner.nothing': { es: 'Nada sin horario.', en: 'Nothing unscheduled.' },

  // Projects
  'projects.title': { es: 'Proyectos', en: 'Projects' },
  'projects.new': { es: 'Nuevo proyecto', en: 'New Project' },
  'projects.search': { es: 'Buscar proyectos...', en: 'Search projects...' },
  'projects.edit': { es: 'Editar proyecto', en: 'Edit Project' },
  'projects.name': { es: 'Nombre del proyecto', en: 'Project Name' },
  'projects.description': { es: 'Descripción', en: 'Description' },
  'projects.status': { es: 'Estado', en: 'Status' },
  'projects.targetdate': { es: 'Fecha objetivo', en: 'Target Date' },
  'projects.iconcolor': { es: 'Icono y color', en: 'Icon & Color' },
  'projects.create': { es: 'Crear proyecto', en: 'Create Project' },
  'projects.save': { es: 'Guardar cambios', en: 'Save Changes' },
  'projects.cancel': { es: 'Cancelar', en: 'Cancel' },
  'projects.tab.tasks': { es: 'tareas', en: 'tasks' },
  'projects.tab.milestones': { es: 'objetivos', en: 'milestones' },
  'projects.tab.logs': { es: 'registros', en: 'logs' },
  'projects.tab.settings': { es: 'ajustes', en: 'settings' },
  'projects.status.planning': { es: 'Planeación', en: 'Planning' },
  'projects.status.active': { es: 'Activo', en: 'Active' },
  'projects.status.paused': { es: 'Pausado', en: 'Paused' },
  'projects.status.completed': { es: 'Completado', en: 'Completed' },

  // Settings
  'settings.title': { es: 'Ajustes', en: 'Settings' },
  'settings.subtitle': { es: 'Administra tus preferencias e integraciones.', en: 'Manage your preferences and integrations.' },
  'settings.appearance': { es: 'Apariencia', en: 'Appearance' },
  'settings.language': { es: 'Idioma', en: 'Language' },
  'settings.language.desc': { es: 'Elige el idioma de la interfaz.', en: 'Choose the interface language.' },
  'settings.saved': { es: '¡Ajustes guardados!', en: 'Settings saved successfully!' },
  'settings.calendar.connect': { es: 'Iniciar sesión con Google', en: 'Sign in with Google' },
  'settings.calendar.connected': { es: 'Reconectar calendario', en: 'Reconnect Calendar' },
  'settings.calendar.notconnected': { es: 'Conectar calendario', en: 'Connect Calendar' },
  'settings.signout': { es: 'Cerrar sesión', en: 'Sign out' },
  'settings.data': { es: 'Gestión de datos', en: 'Data Management' },
  'settings.backupnow': { es: 'Respaldar a Drive ahora', en: 'Backup to Drive now' },
  'settings.restore': { es: 'Restaurar desde Drive', en: 'Restore from Drive' },
  'settings.export': { es: 'Exportar datos (JSON)', en: 'Export Data (JSON)' },
  'settings.import': { es: 'Importar datos', en: 'Import Data' },
  'settings.erase': { es: 'Borrar todos los datos', en: 'Erase All Data' },
  'settings.lastbackup': { es: 'Último respaldo', en: 'Last backup' },

  // Sync feedback
  'planner.sync.none': { es: 'No se encontraron eventos en Google Calendar para este periodo.', en: 'No Google Calendar events found for this period.' },
  'planner.sync.done': { es: 'Eventos importados', en: 'Events imported' },
  'planner.sync.uptodate': { es: 'Todo al día: no hay eventos nuevos que importar.', en: 'Up to date: no new events to import.' },
  'planner.sync.error': { es: 'Error al sincronizar', en: 'Sync error' },

  // Dashboard extra
  'dash.viewall': { es: 'Ver todos', en: 'View All' },
  'dash.noactive': { es: 'Sin proyectos activos. ¡Empieza algo nuevo!', en: 'No active projects. Start something new!' },
  'dash.notasks': { es: 'No hay tareas planeadas para hoy.', en: 'No tasks planned for today.' },
  'dash.noactivity': { es: 'Sin actividad reciente.', en: 'No recent activity.' },

  // Projects extra
  'projects.all': { es: 'Todos los estados', en: 'All Statuses' },
  'projects.none': { es: 'No se encontraron proyectos', en: 'No projects found' },
  'projects.none.empty': { es: 'Aún no has creado ningún proyecto.', en: "You haven't created any projects yet." },
  'projects.none.filter': { es: 'Ningún proyecto coincide con los filtros.', en: 'No projects match your filters.' },
  'projects.notfound': { es: 'Proyecto no encontrado.', en: 'Project not found.' },
  'projects.back': { es: 'Volver a proyectos', en: 'Back to Projects' },
  'projects.nodesc': { es: 'Sin descripción.', en: 'No description provided.' },
  'projects.due': { es: 'Entrega', en: 'Due' },
  'projects.edit.section': { es: 'Editar proyecto', en: 'Edit project' },
  'projects.edit.desc': { es: 'Cambia el nombre, descripción, estado, fecha objetivo, icono o color.', en: 'Change the name, description, status, target date, icon or color.' },
  'projects.edit.btn': { es: 'Editar', en: 'Edit' },
  'projects.danger': { es: 'Zona de peligro', en: 'Danger zone' },
  'projects.danger.desc': { es: 'Eliminar el proyecto borra también sus tareas, objetivos y registros de progreso.', en: 'Deleting the project also removes its tasks, milestones and progress logs.' },
  'projects.delete': { es: 'Eliminar proyecto', en: 'Delete project' },

  // Tasks
  'tasks.title': { es: 'Tareas', en: 'Tasks' },
  'tasks.add': { es: 'Agregar tarea', en: 'Add Task' },
  'tasks.placeholder': { es: '¿Qué hay que hacer?', en: 'What needs to be done?' },
  'tasks.none': { es: 'Sin tareas activas.', en: 'No active tasks.' },
  'tasks.completed': { es: 'Completadas', en: 'Completed' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },

  // Logs
  'logs.title': { es: 'Registros de progreso', en: 'Progress Logs' },
  'logs.add': { es: 'Registrar progreso', en: 'Log Progress' },
  'logs.placeholder': { es: '¿En qué trabajaste hoy?', en: 'What did you work on today?' },
  'logs.mood': { es: 'Ánimo / Energía', en: 'Mood / Energy' },
  'logs.hours': { es: 'Horas (opcional)', en: 'Hours (optional)' },
  'logs.save': { es: 'Guardar registro', en: 'Save Log' },
  'logs.none': { es: 'Sin progreso registrado todavía.', en: 'No progress logged yet.' },

  // Milestones
  'milestones.title': { es: 'Objetivos', en: 'Milestones' },
  'milestones.completed': { es: 'completados', en: 'completed' },
  'milestones.add': { es: 'Agregar objetivo', en: 'Add Milestone' },
  'milestones.placeholder': { es: 'Título del objetivo', en: 'Milestone title' },
  'milestones.empty': { es: 'Sin objetivos todavía. Agrega los objetivos del proyecto y márcalos al completarlos — el % de progreso se calcula automáticamente.', en: 'No milestones yet. Add your project goals and check them off — the progress % is calculated automatically.' },

  // Analytics
  'analytics.title': { es: 'Analítica', en: 'Analytics' },
  'analytics.subtitle': { es: 'Información sobre tu productividad y el avance de tus proyectos.', en: 'Insights into your productivity and project progress.' },
  'analytics.totalprojects': { es: 'Proyectos totales', en: 'Total Projects' },
  'analytics.completedtasks': { es: 'Tareas completadas', en: 'Completed Tasks' },
  'analytics.hours': { es: 'Horas registradas', en: 'Hours Logged' },
  'analytics.progress': { es: 'Progreso de proyectos', en: 'Project Progress' },
  'analytics.heatmap': { es: 'Mapa de actividad', en: 'Activity Heatmap' },

  // Susan extra
  'susan.subtitle': { es: 'Tu asistente personal de productividad', en: 'Your personal productivity assistant' },
  'susan.notconfigured': { es: 'Sin configurar — agrega tu API key en Ajustes', en: 'Not configured - Please add API key in Settings' },
  'susan.greeting': { es: '¿En qué te ayudo hoy, MrDNX?', en: 'How can I help you today, MrDNX?' },
  'susan.greeting.desc': { es: 'Puedo ayudarte a planear tu día, analizar tu productividad o dividir proyectos complejos en tareas manejables.', en: 'I can help you plan your day, analyze your productivity, or break down complex projects into manageable tasks.' },
  'susan.send': { es: 'Enviar', en: 'Send' },

  // Header / search
  'header.search': { es: 'Buscar...', en: 'Search...' },
  'header.cmdplaceholder': { es: 'Escribe un comando o busca...', en: 'Type a command or search...' },
  'header.noresults': { es: 'Sin resultados para', en: 'No results found for' },

  // Susan
  'susan.placeholder': { es: 'Pídele ayuda a Susan...', en: 'Ask Susan for help...' },
  'susan.noapikey': { es: 'Configura tu API key de Gemini en Ajustes', en: 'Please configure Gemini API key in Settings' },
  'susan.briefing': { es: 'Resumen matutino', en: 'Morning Briefing' },
  'susan.analyze': { es: 'Analizar progreso', en: 'Analyze Progress' },
  'susan.motivate': { es: 'Motívame', en: 'Motivate Me' },
} as const;

export type TKey = keyof typeof dict;

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: (localStorage.getItem(LANG_KEY) as Lang) || 'es',
  setLang: (l) => {
    localStorage.setItem(LANG_KEY, l);
    set({ lang: l });
  },
}));

/** Hook: returns the translate function for the active language */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: TKey): string => dict[key]?.[lang] ?? key;
}

/** Non-hook translate (for use outside components) */
export function t(key: TKey): string {
  const lang = useLangStore.getState().lang;
  return dict[key]?.[lang] ?? key;
}
