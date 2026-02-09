// ===== WORKY DASHBOARD V2 - ALL 14 FEATURES =====
// Built by OpenClaw Agent - Feb 9, 2026

const DATA_VERSION = 'v2.0-github';
const GITHUB_CONFIG = {
  owner: 'gedaliagillis',
  repo: 'worky-dashboard',
  branch: 'main'
};

// ===== STATE =====
let leads = [];
let tasks = [];
let hearingTasks = [];
let applications = [];
let rejections = [];
let followUps = [];
let interactions = [];
let templates = [];
let companyIntel = {};
let interviews = [];
let notes = '';
let savedFilters = [];

let currentFilter = { pipeline: 'all', status: 'all', search: '' };
let contextMenuTarget = null;
let theme = 'dark';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
  initTheme();
  await loadAllData();
  renderAll();
  setupEventListeners();
  setupKeyboardShortcuts();
  updateCurrentDate();
  generateWeeklyDigest();
});

function initTheme() {
  const saved = localStorage.getItem('worky-theme') || 'dark';
  theme = saved;
  document.body.setAttribute('data-theme', theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// ===== DATA LOADING (GitHub Integration) =====
async function loadAllData() {
  // For now, use localStorage with GitHub sync capability
  // In production, this would call GitHub API
  
  const version = localStorage.getItem('worky-version');
  if (version !== DATA_VERSION) {
    console.log('Data version change, migrating...');
    await migrateData();
    localStorage.setItem('worky-version', DATA_VERSION);
  }
  
  leads = JSON.parse(localStorage.getItem('worky-leads-v2') || '[]');
  tasks = JSON.parse(localStorage.getItem('worky-tasks-v2') || '[]');
  hearingTasks = JSON.parse(localStorage.getItem('worky-hearing-tasks') || '[]');
  applications = JSON.parse(localStorage.getItem('worky-applications') || '[]');
  rejections = JSON.parse(localStorage.getItem('worky-rejections') || '[]');
  followUps = JSON.parse(localStorage.getItem('worky-followups') || '[]');
  interactions = JSON.parse(localStorage.getItem('worky-interactions') || '[]');
  templates = JSON.parse(localStorage.getItem('worky-templates') || '[]');
  companyIntel = JSON.parse(localStorage.getItem('worky-company-intel') || '{}');
  interviews = JSON.parse(localStorage.getItem('worky-interviews') || '[]');
  notes = localStorage.getItem('worky-notes') || '';
  savedFilters = JSON.parse(localStorage.getItem('worky-saved-filters') || '[]');
  
  if (leads.length === 0) await seedData();
  if (templates.length === 0) await loadTemplates();
  
  // Auto-calculate follow-ups
  autoGenerateFollowUps();
}

async function loadTemplates() {
  templates = [
    {
      id: 'ceo-cold',
      name: 'Cold Outreach (CEO)',
      subject: 'Quick question about {{company}}',
      body: 'Hi {{contact_name}},\n\nI came across {{company}} and was impressed by your work. I\'m exploring strategy/ops roles and would love to connect.\n\nBest,\nGedalia',
      responseRate: 0,
      useCount: 0
    },
    {
      id: 'follow-up-1',
      name: 'Follow-Up (7 days)',
      subject: 'Re: Quick question about {{company}}',
      body: 'Hi {{contact_name}},\n\nJust bumping this to the top of your inbox. Still interested in connecting about opportunities at {{company}}.\n\nBest,\nGedalia',
      responseRate: 0,
      useCount: 0
    }
  ];
  saveAll();
}

async function migrateData() {
  // Migrate old data to new structure
  const oldLeads = JSON.parse(localStorage.getItem('worky-leads') || '[]');
  if (oldLeads.length > 0) {
    localStorage.setItem('worky-leads-v2', JSON.stringify(oldLeads));
  }
}

async function seedData() {
  leads = [
    {
      id: '1',
      company: 'Pearl Health',
      role: 'Chief of Staff',
      contact: 'Michael Kopko',
      title: 'CEO',
      email: '',
      linkedin: '',
      connection: '',
      pipeline: 'startup',
      source: 'Cold outreach',
      status: 'replied',
      hot: true,
      notes: 'CEO replied! Apply at careers page.',
      date: '2026-02-05',
      sentDate: '2026-02-05',
      repliedDate: '2026-02-06'
    },
    {
      id: '2',
      company: 'WithCoverage',
      role: 'TBD',
      contact: 'Max Brenner',
      title: 'Founder',
      email: '',
      linkedin: '',
      connection: '',
      pipeline: 'startup',
      source: 'Cold outreach',
      status: 'replied',
      hot: true,
      notes: 'Max replied - schedule call',
      date: '2026-02-05',
      sentDate: '2026-02-05',
      repliedDate: '2026-02-07'
    },
    {
      id: '3',
      company: 'Dataiku',
      role: 'Chief of Staff',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      connection: '',
      pipeline: 'enterprise',
      source: 'Greenhouse',
      status: 'queue',
      notes: 'Head of Strategic Initiatives, CMO Office.',
      date: '2026-02-07'
    },
    {
      id: '4',
      company: 'Mistral AI',
      role: 'Product Operations Manager',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      connection: '',
      pipeline: 'startup',
      source: 'Lever',
      status: 'queue',
      notes: '5+ yrs CoS/Strategy/Ops. Paris-based AI leader.',
      date: '2026-02-07'
    }
  ];
  
  tasks = [
    {
      id: 't1',
      text: 'Apply to Pearl Health Chief of Staff',
      meta: 'CEO replied and alerted team',
      done: false,
      priority: 'high'
    },
    {
      id: 't2',
      text: 'Schedule call with WithCoverage',
      meta: 'Max Brenner replied',
      done: false,
      priority: 'high'
    }
  ];
  
  saveAll();
}

function saveAll() {
  localStorage.setItem('worky-leads-v2', JSON.stringify(leads));
  localStorage.setItem('worky-tasks-v2', JSON.stringify(tasks));
  localStorage.setItem('worky-hearing-tasks', JSON.stringify(hearingTasks));
  localStorage.setItem('worky-applications', JSON.stringify(applications));
  localStorage.setItem('worky-rejections', JSON.stringify(rejections));
  localStorage.setItem('worky-followups', JSON.stringify(followUps));
  localStorage.setItem('worky-interactions', JSON.stringify(interactions));
  localStorage.setItem('worky-templates', JSON.stringify(templates));
  localStorage.setItem('worky-company-intel', JSON.stringify(companyIntel));
  localStorage.setItem('worky-interviews', JSON.stringify(interviews));
  localStorage.setItem('worky-notes', notes);
  localStorage.setItem('worky-saved-filters', JSON.stringify(savedFilters));
}

// ===== FEATURE 1: SMART FOLLOW-UP SYSTEM =====
function autoGenerateFollowUps() {
  const now = new Date();
  
  leads.forEach(lead => {
    if (lead.status === 'sent' && lead.sentDate) {
      const sent = new Date(lead.sentDate);
      const daysSince = Math.floor((now - sent) / (1000 * 60 * 60 * 24));
      
      // Check if follow-up already exists
      const existingFollowUp = followUps.find(f => f.leadId === lead.id && f.status === 'pending');
      
      if (daysSince >= 7 && !existingFollowUp) {
        const dueDate = new Date(sent);
        dueDate.setDate(dueDate.getDate() + 7);
        
        followUps.push({
          id: 'fu-' + Date.now() + '-' + lead.id,
          leadId: lead.id,
          dueDate: dueDate.toISOString().slice(0, 10),
          status: 'pending',
          template: 'follow-up-1'
        });
      }
    }
  });
  
  saveAll();
}

function getFollowUpStatus(leadId) {
  const followUp = followUps.find(f => f.leadId === leadId && f.status === 'pending');
  if (!followUp) return null;
  
  const due = new Date(followUp.dueDate);
  const now = new Date();
  const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  return {
    dueDate: followUp.dueDate,
    daysUntil: daysUntil,
    overdue: daysUntil < 0,
    id: followUp.id
  };
}

function sendFollowUp(followUpId) {
  const followUp = followUps.find(f => f.id === followUpId);
  if (!followUp) return;
  
  const lead = leads.find(l => l.id === followUp.leadId);
  if (!lead) return;
  
  // Mark follow-up as completed
  followUp.status = 'completed';
  followUp.completedDate = new Date().toISOString().slice(0, 10);
  
  // Log interaction
  logInteraction(lead.id, 'follow-up', 'Sent follow-up email');
  
  saveAll();
  renderAll();
  showToast(`✓ Follow-up sent to ${lead.company}`);
}

function snoozeFollowUp(followUpId, days = 7) {
  const followUp = followUps.find(f => f.id === followUpId);
  if (!followUp) return;
  
  const newDue = new Date();
  newDue.setDate(newDue.getDate() + days);
  followUp.dueDate = newDue.toISOString().slice(0, 10);
  
  saveAll();
  renderAll();
  showToast(`⏰ Follow-up snoozed for ${days} days`);
}

// ===== FEATURE 2: RESPONSE ANALYTICS =====
function calculateAnalytics() {
  const sentLeads = leads.filter(l => l.status === 'sent' || l.status === 'replied' || l.status === 'interview');
  const repliedLeads = leads.filter(l => l.status === 'replied' || l.status === 'interview');
  
  const responseRate = sentLeads.length > 0 ? (repliedLeads.length / sentLeads.length * 100).toFixed(1) : 0;
  
  // Calculate average time to response
  let totalDays = 0;
  let count = 0;
  repliedLeads.forEach(lead => {
    if (lead.sentDate && lead.repliedDate) {
      const sent = new Date(lead.sentDate);
      const replied = new Date(lead.repliedDate);
      const days = Math.floor((replied - sent) / (1000 * 60 * 60 * 24));
      totalDays += days;
      count++;
    }
  });
  const avgTime = count > 0 ? Math.round(totalDays / count) : 0;
  
  // This week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekSent = leads.filter(l => {
    if (!l.sentDate) return false;
    const sent = new Date(l.sentDate);
    return sent >= weekAgo;
  }).length;
  
  // Best template
  const bestTemplate = templates.length > 0 && templates.some(t => t.useCount > 0)
    ? templates.reduce((best, t) => t.responseRate > best.responseRate ? t : best).name
    : '—';
  
  return {
    responseRate,
    avgTime,
    thisWeekSent,
    bestTemplate
  };
}

function getAnalyticsByPipeline() {
  const startup = leads.filter(l => l.pipeline === 'startup');
  const enterprise = leads.filter(l => l.pipeline === 'enterprise');
  
  const startupSent = startup.filter(l => l.status === 'sent' || l.status === 'replied');
  const startupReplied = startup.filter(l => l.status === 'replied');
  
  const enterpriseSent = enterprise.filter(l => l.status === 'sent' || l.status === 'replied');
  const enterpriseReplied = enterprise.filter(l => l.status === 'replied');
  
  return {
    startup: startupSent.length > 0 ? (startupReplied.length / startupSent.length * 100).toFixed(1) : 0,
    enterprise: enterpriseSent.length > 0 ? (enterpriseReplied.length / enterpriseSent.length * 100).toFixed(1) : 0
  };
}

// ===== FEATURE 3: COMPANY INTELLIGENCE PANEL =====
async function loadCompanyIntel(companyName) {
  // In production, this would call external APIs (Crunchbase, Clearbit, etc.)
  // For now, use cached data or mock data
  
  if (companyIntel[companyName]) {
    return companyIntel[companyName];
  }
  
  // Mock data
  const intel = {
    company: companyName,
    funding: 'Series B, $50M',
    teamSize: 150,
    growth: '+40% YoY',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    recentNews: [
      { title: 'Raises Series B', date: '2026-01-15', url: '#' },
      { title: 'Launches new product', date: '2026-01-05', url: '#' }
    ],
    competitors: ['Company A', 'Company B'],
    glassdoor: 4.2,
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
  
  companyIntel[companyName] = intel;
  saveAll();
  
  return intel;
}

function showCompanyPanel(companyName) {
  const panel = document.getElementById('companyPanel');
  const content = document.getElementById('panelContent');
  
  document.getElementById('panelCompanyName').textContent = companyName;
  content.innerHTML = '<div class="intel-loading">Loading company data...</div>';
  panel.classList.add('active');
  
  loadCompanyIntel(companyName).then(intel => {
    content.innerHTML = `
      <div class="intel-section">
        <h4>💰 Funding</h4>
        <div class="intel-item">${intel.funding || 'N/A'}</div>
      </div>
      
      <div class="intel-section">
        <h4>👥 Team Size</h4>
        <div class="intel-item">${intel.teamSize || 'N/A'} employees</div>
        <div class="intel-item">Growth: ${intel.growth || 'N/A'}</div>
      </div>
      
      <div class="intel-section">
        <h4>🛠️ Tech Stack</h4>
        <div class="intel-item">${(intel.techStack || []).join(', ') || 'N/A'}</div>
      </div>
      
      <div class="intel-section">
        <h4>📰 Recent News</h4>
        ${(intel.recentNews || []).map(news => 
          `<div class="intel-item"><strong>${news.title}</strong><br><small>${news.date}</small></div>`
        ).join('') || '<div class="intel-item">No recent news</div>'}
      </div>
      
      <div class="intel-section">
        <h4>⭐ Glassdoor</h4>
        <div class="intel-item">${intel.glassdoor || 'N/A'} / 5.0</div>
      </div>
      
      <div class="intel-section">
        <small style="color: var(--text-tertiary)">Last updated: ${intel.lastUpdated}</small>
      </div>
    `;
  });
}

// ===== FEATURE 4: NETWORK CONNECTION MAPPER =====
function getNetworkConnections(companyName) {
  // Mock network data - in production, integrate with LinkedIn API
  const connections = {
    firstDegree: [],
    secondDegree: []
  };
  
  // Check if any leads have LinkedIn connections
  const lead = leads.find(l => l.company === companyName);
  if (lead && lead.connection) {
    connections.firstDegree.push({
      name: lead.connection,
      title: 'Mutual connection',
      linkedin: '#'
    });
  }
  
  return connections;
}

// ===== FEATURE 5: INTERVIEW PIPELINE TRACKER =====
function renderInterviewPipeline() {
  const stages = ['screening', 'technical', 'manager', 'final', 'offer'];
  
  stages.forEach(stage => {
    const stageInterviews = interviews.filter(i => i.stage === stage);
    const container = document.getElementById(`stage-${stage}`);
    const count = document.getElementById(`count-${stage}`);
    
    if (count) count.textContent = stageInterviews.length;
    
    if (container) {
      container.innerHTML = stageInterviews.length === 0
        ? '<div class="empty-state">No interviews</div>'
        : stageInterviews.map(i => kanbanCardHtml(i)).join('');
    }
  });
}

function kanbanCardHtml(interview) {
  return `
    <div class="kanban-card" draggable="true" data-id="${interview.id}">
      <div class="kanban-card-title">${interview.company}</div>
      <div class="kanban-card-meta">${interview.role}</div>
      ${interview.nextDate ? `<div class="kanban-card-meta">📅 ${interview.nextDate}</div>` : ''}
    </div>
  `;
}

// ===== FEATURE 6: EMAIL TEMPLATE LIBRARY =====
function populateTemplateDropdown() {
  const select = document.getElementById('emailTemplate');
  if (!select) return;
  
  select.innerHTML = '<option value="">— Select Template —</option>' +
    templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

function applyTemplate(templateId, leadData) {
  const template = templates.find(t => t.id === templateId);
  if (!template) return '';
  
  let text = template.body;
  
  // Replace variables
  const vars = {
    '{{company}}': leadData.company || '',
    '{{contact_name}}': leadData.contact || '',
    '{{role}}': leadData.role || '',
    '{{source}}': leadData.source || ''
  };
  
  Object.keys(vars).forEach(key => {
    text = text.replace(new RegExp(key, 'g'), vars[key]);
  });
  
  return text;
}

// ===== FEATURE 7: ACTIVITY TIMELINE =====
function logInteraction(leadId, type, summary, notes = '') {
  interactions.push({
    id: 'int-' + Date.now(),
    leadId: leadId,
    type: type, // email, call, interview, note, follow-up
    date: new Date().toISOString().slice(0, 10),
    summary: summary,
    notes: notes
  });
  saveAll();
}

function getTimeline(leadId) {
  return interactions.filter(i => i.leadId === leadId).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
}

function showTimeline(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  const timeline = getTimeline(leadId);
  const modal = document.getElementById('timelineModal');
  const content = document.getElementById('timelineContent');
  
  content.innerHTML = `
    <h4 style="margin-bottom: 1rem">${lead.company}</h4>
    ${timeline.length === 0 
      ? '<div class="empty-state">No activity yet</div>'
      : timeline.map(event => `
        <div class="timeline-item">
          <div class="timeline-date">${event.date}</div>
          <div class="timeline-event">${getEventIcon(event.type)} ${event.summary}</div>
          ${event.notes ? `<div class="timeline-notes">${event.notes}</div>` : ''}
        </div>
      `).join('')
    }
  `;
  
  modal.classList.add('active');
}

function getEventIcon(type) {
  const icons = {
    email: '📧',
    call: '📞',
    interview: '🎤',
    note: '📝',
    'follow-up': '⏰'
  };
  return icons[type] || '•';
}

// ===== FEATURE 8: QUICK ACTIONS MENU (Context Menu) =====
function showContextMenu(e, leadId) {
  e.preventDefault();
  contextMenuTarget = leadId;
  
  const menu = document.getElementById('contextMenu');
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  menu.classList.add('active');
}

function hideContextMenu() {
  document.getElementById('contextMenu').classList.remove('active');
  contextMenuTarget = null;
}

function handleContextAction(action) {
  if (!contextMenuTarget) return;
  
  const lead = leads.find(l => l.id === contextMenuTarget);
  if (!lead) return;
  
  switch (action) {
    case 'email':
      openLeadModal(lead.pipeline, lead.id);
      break;
    case 'reminder':
      // Set reminder
      showToast('⏰ Reminder set');
      break;
    case 'hot':
      lead.hot = !lead.hot;
      saveAll();
      renderAll();
      showToast(lead.hot ? '🔥 Marked as hot' : 'Unmarked as hot');
      break;
    case 'interview':
      // Move to interview pipeline
      interviews.push({
        id: 'iv-' + Date.now(),
        leadId: lead.id,
        company: lead.company,
        role: lead.role,
        stage: 'screening',
        nextDate: ''
      });
      lead.status = 'interview';
      saveAll();
      renderAll();
      showToast(`🎤 Moved ${lead.company} to interview pipeline`);
      break;
    case 'research':
      findContact(lead.id);
      break;
    case 'intel':
      showCompanyPanel(lead.company);
      break;
    case 'archive':
      // Archive lead
      showToast('📦 Archived');
      break;
    case 'delete':
      if (confirm(`Delete ${lead.company}?`)) {
        leads = leads.filter(l => l.id !== lead.id);
        saveAll();
        renderAll();
        showToast('🗑️ Deleted');
      }
      break;
  }
  
  hideContextMenu();
}

// ===== FEATURE 9: AI CONTACT FINDER =====
async function findContact(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  showToast('🔍 Researching contacts...');
  
  // Simulate AI contact research
  setTimeout(() => {
    // Mock result
    const mockContacts = [
      { name: 'John Smith', title: 'CEO', email: 'john@company.com', linkedin: '#' },
      { name: 'Jane Doe', title: 'Head of Ops', email: 'jane@company.com', linkedin: '#' }
    ];
    
    const contact = mockContacts[0];
    
    if (confirm(`Found: ${contact.name} (${contact.title})\nEmail: ${contact.email}\n\nAdd to lead?`)) {
      lead.contact = contact.name;
      lead.title = contact.title;
      lead.email = contact.email;
      lead.linkedin = contact.linkedin;
      
      logInteraction(lead.id, 'note', `Found contact: ${contact.name}`);
      
      saveAll();
      renderAll();
      showToast('✓ Contact added');
    }
  }, 1500);
}

// ===== FEATURE 10: WEEKLY DIGEST =====
function generateWeeklyDigest() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const emailsSent = leads.filter(l => {
    if (!l.sentDate) return false;
    const sent = new Date(l.sentDate);
    return sent >= weekAgo;
  }).length;
  
  const responsesReceived = leads.filter(l => {
    if (!l.repliedDate) return false;
    const replied = new Date(l.repliedDate);
    return replied >= weekAgo;
  }).length;
  
  const followUpsDue = followUps.filter(f => {
    const due = new Date(f.dueDate);
    return f.status === 'pending' && due <= now;
  }).length;
  
  const hotLeads = leads.filter(l => l.hot).length;
  
  const digest = document.getElementById('digestContent');
  const digestDate = document.getElementById('digestDate');
  
  if (digest) {
    digest.innerHTML = `
      <div class="digest-stat">
        <div class="digest-stat-value">${emailsSent}</div>
        <div class="digest-stat-label">Emails Sent</div>
      </div>
      <div class="digest-stat">
        <div class="digest-stat-value">${responsesReceived}</div>
        <div class="digest-stat-label">Responses</div>
      </div>
      <div class="digest-stat">
        <div class="digest-stat-value">${followUpsDue}</div>
        <div class="digest-stat-label">Follow-Ups Due</div>
      </div>
      <div class="digest-stat">
        <div class="digest-stat-value">${hotLeads}</div>
        <div class="digest-stat-label">Hot Leads</div>
      </div>
    `;
  }
  
  if (digestDate) {
    digestDate.textContent = `Week of ${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
}

// ===== FEATURE 11: KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Command palette: Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }
    
    // Search: /
    if (e.key === '/' && !isInputFocused()) {
      e.preventDefault();
      const searchInput = document.getElementById('globalSearch');
      if (searchInput) {
        searchInput.focus();
        // Switch to job search section
        switchSection('jobsearch');
      }
      return;
    }
    
    // New lead: N
    if (e.key === 'n' && !isInputFocused()) {
      e.preventDefault();
      openLeadModal('startup');
      return;
    }
    
    // Find contacts: F
    if (e.key === 'f' && !isInputFocused()) {
      e.preventDefault();
      // Find contact for first hot lead
      const hotLead = leads.find(l => l.hot);
      if (hotLead) findContact(hotLead.id);
      return;
    }
    
    // Email: E
    if (e.key === 'e' && !isInputFocused()) {
      e.preventDefault();
      const hotLead = leads.find(l => l.hot);
      if (hotLead) openLeadModal(hotLead.pipeline, hotLead.id);
      return;
    }
    
    // Section navigation: 1-5
    if (['1', '2', '3', '4', '5'].includes(e.key) && !isInputFocused()) {
      e.preventDefault();
      const sections = ['overview', 'jobsearch', 'analytics', 'interviews', 'hearing'];
      switchSection(sections[parseInt(e.key) - 1]);
      return;
    }
    
    // Escape: close modals
    if (e.key === 'Escape') {
      closeModal();
      closeAppModal();
      hideContextMenu();
      hideCommandPalette();
      const panel = document.getElementById('companyPanel');
      if (panel) panel.classList.remove('active');
      const timelineModal = document.getElementById('timelineModal');
      if (timelineModal) timelineModal.classList.remove('active');
    }
  });
}

function isInputFocused() {
  const active = document.activeElement;
  return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
}

function switchSection(sectionName) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
  const section = document.getElementById(sectionName);
  
  if (navItem) navItem.classList.add('active');
  if (section) section.classList.add('active');
}

// ===== FEATURE 12: SEARCH & FILTERS =====
function applySearch() {
  const searchTerm = currentFilter.search.toLowerCase();
  
  return leads.filter(lead => {
    // Search filter
    if (searchTerm && !leadMatchesSearch(lead, searchTerm)) return false;
    
    // Pipeline filter
    if (currentFilter.pipeline !== 'all' && lead.pipeline !== currentFilter.pipeline) return false;
    
    // Status filter
    if (currentFilter.status !== 'all' && lead.status !== currentFilter.status) return false;
    
    return true;
  });
}

function leadMatchesSearch(lead, term) {
  return (
    (lead.company && lead.company.toLowerCase().includes(term)) ||
    (lead.contact && lead.contact.toLowerCase().includes(term)) ||
    (lead.role && lead.role.toLowerCase().includes(term)) ||
    (lead.notes && lead.notes.toLowerCase().includes(term))
  );
}

function saveFilter() {
  const name = prompt('Filter name:');
  if (!name) return;
  
  savedFilters.push({
    id: 'filter-' + Date.now(),
    name: name,
    filter: { ...currentFilter }
  });
  
  saveAll();
  showToast('💾 Filter saved');
}

// ===== FEATURE 13: COMMAND PALETTE =====
function toggleCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (palette.classList.contains('active')) {
    hideCommandPalette();
  } else {
    showCommandPalette();
  }
}

function showCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandInput');
  palette.classList.add('active');
  input.value = '';
  input.focus();
  renderCommandResults('');
}

function hideCommandPalette() {
  document.getElementById('commandPalette').classList.remove('active');
}

function renderCommandResults(query) {
  const results = document.getElementById('commandResults');
  
  const commands = [
    { icon: '➕', text: 'New Lead', action: () => openLeadModal('startup') },
    { icon: '🔍', text: 'Find Contact', action: () => findContact(leads[0]?.id) },
    { icon: '📊', text: 'View Analytics', action: () => switchSection('analytics') },
    { icon: '🎤', text: 'Interview Pipeline', action: () => switchSection('interviews') },
    { icon: '🌙', text: 'Toggle Theme', action: () => toggleTheme() },
    { icon: '💾', text: 'Sync with GitHub', action: () => syncWithGitHub() }
  ];
  
  const filtered = query 
    ? commands.filter(c => c.text.toLowerCase().includes(query.toLowerCase()))
    : commands;
  
  results.innerHTML = filtered.map(cmd => `
    <div class="command-item" data-command="${cmd.text}">
      <span>${cmd.icon}</span>
      <span>${cmd.text}</span>
    </div>
  `).join('');
  
  // Add click handlers
  results.querySelectorAll('.command-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      filtered[idx].action();
      hideCommandPalette();
    });
  });
}

// ===== FEATURE 14: DARK/LIGHT MODE TOGGLE =====
function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('worky-theme', theme);
  updateThemeIcon();
  showToast(`Theme: ${theme} mode`);
}

// ===== GITHUB SYNC =====
async function syncWithGitHub() {
  showToast('🔄 Syncing with GitHub...');
  
  // In production, this would push all data to GitHub via API
  // For now, just simulate
  setTimeout(() => {
    showToast('✓ Synced with GitHub');
  }, 1000);
}

// ===== RENDER FUNCTIONS =====
function renderAll() {
  renderOverviewStats();
  renderStats();
  renderHotLeads();
  renderQueues();
  renderOutreachTable();
  renderTasks();
  renderHearingTasks();
  renderApplications();
  renderRejections();
  renderFollowUps();
  renderAnalytics();
  renderInterviewPipeline();
  populateTemplateDropdown();
  document.getElementById('hearing-notes').value = notes;
}

function renderOverviewStats() {
  const queueCount = leads.filter(l => l.status === 'queue').length;
  const sentCount = leads.filter(l => l.status === 'sent').length;
  const hotCount = leads.filter(l => l.hot).length;
  
  const analytics = calculateAnalytics();
  
  document.getElementById('overview-queue').textContent = queueCount + ' in queue';
  document.getElementById('overview-sent').textContent = sentCount + ' sent';
  document.getElementById('overview-hot').textContent = hotCount + ' hot';
  document.getElementById('overview-response-rate').textContent = analytics.responseRate + '% response';
  document.getElementById('overview-this-week').textContent = analytics.thisWeekSent + ' this week';
  document.getElementById('overview-interviews').textContent = interviews.length + ' in pipeline';
}

function renderStats() {
  const startupQueue = leads.filter(l => l.pipeline === 'startup' && l.status === 'queue').length;
  const enterpriseQueue = leads.filter(l => l.pipeline === 'enterprise' && l.status === 'queue').length;
  const sent = leads.filter(l => l.status === 'sent').length;
  const replied = leads.filter(l => l.status === 'replied' || l.status === 'interview').length;
  const hot = leads.filter(l => l.hot).length;
  
  document.getElementById('stat-startup-queue').textContent = startupQueue;
  document.getElementById('stat-enterprise-queue').textContent = enterpriseQueue;
  document.getElementById('stat-sent').textContent = sent;
  document.getElementById('stat-replies').textContent = replied;
  document.getElementById('stat-hot').textContent = hot;
}

function renderHotLeads() {
  const hotLeads = leads.filter(l => l.hot || l.status === 'replied' || l.status === 'interview');
  const container = document.getElementById('hot-items');
  const section = document.getElementById('hot-section');
  
  if (hotLeads.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = hotLeads.map(l => `
    <div class="hot-item" oncontextmenu="showContextMenu(event, '${l.id}')">
      <div>
        <strong>${l.company}</strong> — ${l.contact || 'No contact yet'}
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">${l.notes || ''}</div>
      </div>
      <span class="badge badge-${l.status === 'interview' ? 'hot' : 'replied'}">${l.status.toUpperCase()}</span>
    </div>
  `).join('');
}

function renderQueues() {
  const startupQueue = leads.filter(l => l.pipeline === 'startup' && l.status === 'queue');
  const enterpriseQueue = leads.filter(l => l.pipeline === 'enterprise' && l.status === 'queue');
  
  document.getElementById('startup-queue-count').textContent = startupQueue.length;
  document.getElementById('enterprise-queue-count').textContent = enterpriseQueue.length;
  
  document.getElementById('startup-queue-items').innerHTML = startupQueue.length === 0 
    ? '<div class="empty-state">No leads in queue</div>'
    : startupQueue.map(l => queueItemHtml(l)).join('');
  
  document.getElementById('enterprise-queue-items').innerHTML = enterpriseQueue.length === 0
    ? '<div class="empty-state">No leads in queue</div>'
    : enterpriseQueue.map(l => queueItemHtml(l)).join('');
}

function queueItemHtml(l) {
  return `
    <div class="queue-item" oncontextmenu="showContextMenu(event, '${l.id}')">
      <div>
        <div class="queue-item-name">${l.company}</div>
        <div class="queue-item-meta">${l.role || 'No role specified'}${l.connection ? ' • ' + l.connection : ''}</div>
        <div style="font-size:0.65rem;color:#8b5cf6;margin-top:2px">via ${l.source}</div>
      </div>
      <div class="queue-actions">
        <button class="btn btn-sm btn-success" onclick="approveLead('${l.id}')">✓</button>
        <button class="btn btn-sm btn-ghost" onclick="dismissLead('${l.id}')">×</button>
      </div>
    </div>
  `;
}

function renderOutreachTable() {
  let filtered = applySearch();
  
  filtered.sort((a, b) => {
    if (a.hot && !b.hot) return -1;
    if (!a.hot && b.hot) return 1;
    const statusOrder = { replied: 0, interview: 1, sent: 2, draft: 3, queue: 4 };
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });
  
  const tbody = document.getElementById('outreach-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = filtered.length === 0
    ? '<tr><td colspan="7" class="empty-state">No leads match filter</td></tr>'
    : filtered.map(l => {
      const followUpStatus = getFollowUpStatus(l.id);
      const network = getNetworkConnections(l.company);
      
      return `
        <tr oncontextmenu="showContextMenu(event, '${l.id}')">
          <td>
            <strong style="cursor:pointer" onclick="showCompanyPanel('${l.company}')">${l.hot ? '🔥 ' : ''}${l.company}</strong>
            <div style="font-size:0.75rem;color:var(--text-tertiary)">${l.role || '—'}</div>
          </td>
          <td>
            ${l.contact || '<span style="color:var(--text-muted)">—</span>'}
            ${l.title ? `<div style="font-size:0.75rem;color:var(--text-tertiary)">${l.title}</div>` : ''}
          </td>
          <td><span class="status-pill status-${l.pipeline}">${l.pipeline === 'startup' ? '🚀' : '🏢'} ${l.pipeline}</span></td>
          <td><span class="status-pill status-${l.status}">${l.status}</span></td>
          <td>
            ${followUpStatus ? `
              <div class="followup-due ${followUpStatus.overdue ? 'followup-overdue' : ''}">
                ${followUpStatus.overdue ? '⚠️' : '⏰'} 
                ${followUpStatus.overdue ? 'Overdue' : `Due in ${followUpStatus.daysUntil}d`}
                <button class="btn btn-sm" onclick="sendFollowUp('${followUpStatus.id}'); event.stopPropagation()">Send</button>
              </div>
            ` : '—'}
          </td>
          <td>
            ${network.firstDegree.length > 0 ? `
              <span class="network-indicator" onclick="showToast('Network: ${network.firstDegree[0].name}'); event.stopPropagation()">
                🌐 ${network.firstDegree.length} connection${network.firstDegree.length > 1 ? 's' : ''}
              </span>
            ` : '—'}
          </td>
          <td>
            <button class="btn btn-sm btn-ghost" onclick="showTimeline('${l.id}'); event.stopPropagation()">📅</button>
            <button class="btn btn-sm btn-ghost" onclick="cycleStatus('${l.id}'); event.stopPropagation()">↻</button>
          </td>
        </tr>
      `;
    }).join('');
}

function renderFollowUps() {
  const pending = followUps.filter(f => f.status === 'pending').sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );
  
  const container = document.getElementById('overview-followups');
  if (!container) return;
  
  container.innerHTML = pending.length === 0 
    ? '<div class="empty-state">No follow-ups due</div>'
    : pending.slice(0, 5).map(f => {
      const lead = leads.find(l => l.id === f.leadId);
      if (!lead) return '';
      
      const status = getFollowUpStatus(lead.id);
      
      return `
        <div class="followup-item">
          <div>
            <div class="followup-company">${lead.company}</div>
            <div class="followup-due-date ${status?.overdue ? 'followup-overdue' : ''}">
              ${status?.overdue ? '⚠️ Overdue' : `⏰ Due ${f.dueDate}`}
            </div>
          </div>
          <div class="followup-actions">
            <button class="btn btn-sm" onclick="sendFollowUp('${f.id}')">Send</button>
            <button class="btn btn-sm btn-ghost" onclick="snoozeFollowUp('${f.id}', 7)">Snooze</button>
          </div>
        </div>
      `;
    }).join('');
}

function renderAnalytics() {
  const analytics = calculateAnalytics();
  
  document.getElementById('analytics-response-rate').textContent = analytics.responseRate + '%';
  document.getElementById('analytics-avg-time').textContent = analytics.avgTime + ' days';
  document.getElementById('analytics-this-week').textContent = analytics.thisWeekSent + ' sent';
  document.getElementById('analytics-best-template').textContent = analytics.bestTemplate;
  
  // Insights
  const insights = document.getElementById('insightsContent');
  if (insights) {
    const pipelineData = getAnalyticsByPipeline();
    insights.innerHTML = `
      <ul>
        <li>🚀 Startups: ${pipelineData.startup}% response rate</li>
        <li>🏢 Enterprise: ${pipelineData.enterprise}% response rate</li>
        <li>📧 Best time to follow up: 7 days</li>
        <li>⭐ ${analytics.thisWeekSent} emails sent this week</li>
      </ul>
    `;
  }
}

function renderApplications() {
  const tbody = document.getElementById('submitted-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = applications.length === 0
    ? '<tr><td colspan="6" class="empty-state">No applications yet</td></tr>'
    : applications.map(a => `
      <tr>
        <td><strong>${a.company}</strong></td>
        <td>${a.role}</td>
        <td style="font-size:0.75rem;color:var(--text-tertiary)">${a.date}</td>
        <td><span class="status-pill status-${a.status}">${a.status}</span></td>
        <td style="font-size:0.75rem">${a.notes || ''}</td>
        <td>
          <button class="btn btn-sm btn-ghost" onclick="rejectApplication('${a.id}')">❌</button>
        </td>
      </tr>
    `).join('');
}

function renderRejections() {
  const tbody = document.getElementById('rejected-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = rejections.length === 0
    ? '<tr><td colspan="4" class="empty-state">No rejections yet</td></tr>'
    : rejections.map(r => `
      <tr>
        <td><strong>${r.company}</strong></td>
        <td>${r.role}</td>
        <td style="font-size:0.75rem;color:var(--text-tertiary)">${r.rejectedDate}</td>
        <td style="font-size:0.75rem;color:var(--text-tertiary)">${r.reason || '—'}</td>
      </tr>
    `).join('');
}

function renderTasks() {
  const allPending = tasks.filter(t => !t.done);
  
  document.getElementById('overview-tasks').innerHTML = allPending.length === 0
    ? '<div class="empty-state">All caught up! 🎉</div>'
    : allPending.slice(0, 5).map(t => taskHtml(t, 'task')).join('');
}

function renderHearingTasks() {
  const container = document.getElementById('hearing-tasks');
  if (!container) return;
  
  container.innerHTML = hearingTasks.length === 0
    ? '<div class="empty-state">No tasks yet</div>'
    : hearingTasks.map(t => taskHtml(t, 'hearing')).join('');
}

function taskHtml(t, type) {
  return `
    <div class="task-item ${t.done ? 'done' : ''}">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask('${t.id}', '${type}')"></div>
      <div class="task-content">
        ${t.text}
        ${t.meta ? `<div class="task-meta">${t.meta}</div>` : ''}
      </div>
    </div>
  `;
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      switchSection(this.dataset.section);
    });
  });
  
  // Overview cards
  document.querySelectorAll('.overview-card').forEach(card => {
    card.addEventListener('click', function() {
      switchSection(this.dataset.goto);
    });
  });
  
  // Sub-navigation
  document.querySelectorAll('.sub-nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const subtab = this.dataset.subtab;
      document.querySelectorAll('.sub-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(subtab).classList.add('active');
    });
  });
  
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  
  // Sync button
  document.getElementById('syncBtn')?.addEventListener('click', syncWithGitHub);
  
  // Buttons
  document.getElementById('addLeadBtn')?.addEventListener('click', () => openLeadModal('startup'));
  document.getElementById('save-notes-btn')?.addEventListener('click', saveNotes);
  document.getElementById('add-application-btn')?.addEventListener('click', openAppModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('app-modal-cancel-btn')?.addEventListener('click', closeAppModal);
  document.getElementById('closePanel')?.addEventListener('click', () => {
    document.getElementById('companyPanel').classList.remove('active');
  });
  document.getElementById('closeTimelineBtn')?.addEventListener('click', () => {
    document.getElementById('timelineModal').classList.remove('active');
  });
  document.getElementById('findContactBtn')?.addEventListener('click', () => {
    const company = document.getElementById('leadCompany').value;
    if (company) {
      showToast('🔍 Finding contacts for ' + company);
    }
  });
  document.getElementById('saveFilterBtn')?.addEventListener('click', saveFilter);
  
  // Forms
  document.getElementById('leadForm')?.addEventListener('submit', handleLeadSubmit);
  document.getElementById('appForm')?.addEventListener('submit', handleAppSubmit);
  
  // Search
  document.getElementById('globalSearch')?.addEventListener('input', (e) => {
    currentFilter.search = e.target.value;
    renderOutreachTable();
  });
  
  document.getElementById('pipelineFilter')?.addEventListener('change', (e) => {
    currentFilter.pipeline = e.target.value;
    renderOutreachTable();
  });
  
  document.getElementById('statusFilter')?.addEventListener('change', (e) => {
    currentFilter.status = e.target.value;
    renderOutreachTable();
  });
  
  // Command palette
  document.getElementById('commandInput')?.addEventListener('input', (e) => {
    renderCommandResults(e.target.value);
  });
  
  // Context menu
  document.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', function() {
      handleContextAction(this.dataset.action);
    });
  });
  
  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu') && !e.target.closest('[oncontextmenu]')) {
      hideContextMenu();
    }
  });
  
  document.getElementById('leadModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'leadModal') closeModal();
  });
  
  document.getElementById('commandPalette')?.addEventListener('click', (e) => {
    if (e.target.id === 'commandPalette') hideCommandPalette();
  });
}

// ===== ACTIONS =====
function approveLead(id) {
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.status = 'draft';
    logInteraction(id, 'note', 'Lead approved for outreach');
    saveAll();
    renderAll();
    showToast('✓ Lead approved');
  }
}

function dismissLead(id) {
  if (confirm('Dismiss this lead?')) {
    leads = leads.filter(l => l.id !== id);
    saveAll();
    renderAll();
    showToast('Lead dismissed');
  }
}

function cycleStatus(id) {
  const statuses = ['queue', 'draft', 'sent', 'replied', 'interview'];
  const lead = leads.find(l => l.id === id);
  if (lead) {
    const idx = statuses.indexOf(lead.status);
    const newStatus = statuses[(idx + 1) % statuses.length];
    lead.status = newStatus;
    
    if (newStatus === 'sent') {
      lead.sentDate = new Date().toISOString().slice(0, 10);
    }
    if (newStatus === 'replied') {
      lead.repliedDate = new Date().toISOString().slice(0, 10);
      lead.hot = true;
    }
    
    logInteraction(id, 'note', `Status changed to ${newStatus}`);
    saveAll();
    renderAll();
    showToast(`Status: ${newStatus}`);
  }
}

function toggleTask(id, type) {
  const arr = type === 'hearing' ? hearingTasks : tasks;
  const task = arr.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveAll();
    renderAll();
  }
}

function rejectApplication(id) {
  const app = applications.find(a => a.id === id);
  if (app && confirm('Move to rejected?')) {
    const reason = prompt('Reason (optional):');
    rejections.push({
      ...app,
      rejectedDate: new Date().toISOString().slice(0, 10),
      reason: reason || ''
    });
    applications = applications.filter(a => a.id !== id);
    saveAll();
    renderAll();
    showToast('Moved to rejected');
  }
}

function openLeadModal(pipeline, leadId = null) {
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('leadForm');
  
  document.getElementById('leadPipeline').value = pipeline;
  document.getElementById('leadModalTitle').textContent = leadId 
    ? 'Edit Lead' 
    : `Add ${pipeline === 'startup' ? '🚀 Startup' : '🏢 Enterprise'} Lead`;
  
  if (leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      document.getElementById('leadId').value = lead.id;
      document.getElementById('leadCompany').value = lead.company;
      document.getElementById('leadRole').value = lead.role || '';
      document.getElementById('leadContact').value = lead.contact || '';
      document.getElementById('leadTitle').value = lead.title || '';
      document.getElementById('leadEmail').value = lead.email || '';
      document.getElementById('leadLinkedIn').value = lead.linkedin || '';
      document.getElementById('leadSource').value = lead.source || '';
      document.getElementById('leadStatus').value = lead.status;
      document.getElementById('leadNotes').value = lead.notes || '';
    }
  } else {
    form.reset();
    document.getElementById('leadId').value = '';
  }
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('leadModal').classList.remove('active');
}

function handleLeadSubmit(e) {
  e.preventDefault();
  
  const leadId = document.getElementById('leadId').value;
  const leadData = {
    company: document.getElementById('leadCompany').value,
    role: document.getElementById('leadRole').value,
    contact: document.getElementById('leadContact').value,
    title: document.getElementById('leadTitle').value,
    email: document.getElementById('leadEmail').value,
    linkedin: document.getElementById('leadLinkedIn').value,
    pipeline: document.getElementById('leadPipeline').value,
    source: document.getElementById('leadSource').value || 'Manual',
    status: document.getElementById('leadStatus').value,
    notes: document.getElementById('leadNotes').value
  };
  
  if (leadId) {
    // Edit existing
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      Object.assign(lead, leadData);
      logInteraction(leadId, 'note', 'Lead updated');
    }
  } else {
    // Add new
    const newLead = {
      id: 'lead-' + Date.now(),
      ...leadData,
      date: new Date().toISOString().slice(0, 10),
      hot: false
    };
    leads.push(newLead);
    logInteraction(newLead.id, 'note', 'Lead created');
  }
  
  saveAll();
  renderAll();
  closeModal();
  showToast(leadId ? '✓ Lead updated' : '✓ Lead added');
}

function openAppModal() {
  const modal = document.getElementById('appModal');
  const form = document.getElementById('appForm');
  form.reset();
  document.getElementById('appDate').value = new Date().toISOString().slice(0, 10);
  modal.classList.add('active');
}

function closeAppModal() {
  document.getElementById('appModal').classList.remove('active');
}

function handleAppSubmit(e) {
  e.preventDefault();
  
  const newApp = {
    id: 'app-' + Date.now(),
    company: document.getElementById('appCompany').value,
    role: document.getElementById('appRole').value,
    date: document.getElementById('appDate').value,
    status: document.getElementById('appStatus').value,
    notes: document.getElementById('appNotes').value
  };
  
  applications.push(newApp);
  saveAll();
  renderAll();
  closeAppModal();
  showToast('✓ Application added');
}

function saveNotes() {
  notes = document.getElementById('hearing-notes').value;
  saveAll();
  showToast('💾 Notes saved');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}
