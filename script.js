// ===== DATA =====
const ambassadors = [
  { id: 1, name: 'Priya Sharma', college: 'IIT Bombay', points: 980, rank: 'Platinum', streak: 8, avatar: 'PS', color: '#ede9fe', textColor: '#6d28d9', tasksCompleted: 10 },
  { id: 2, name: 'Arjun Mehta', college: 'NIT Nagpur', points: 820, rank: 'Gold', streak: 5, avatar: 'AM', color: '#fef3c7', textColor: '#b45309', tasksCompleted: 8 },
  { id: 3, name: 'Sneha Patel', college: 'BITS Pilani', points: 650, rank: 'Gold', streak: 3, avatar: 'SP', color: '#dbeafe', textColor: '#1d4ed8', tasksCompleted: 7 },
  { id: 4, name: 'Rahul Verma', college: 'VIT Pune', points: 340, rank: 'Silver', streak: 2, avatar: 'RV', color: '#dcfce7', textColor: '#166534', tasksCompleted: 4 },
  { id: 5, name: 'Ananya Roy', college: 'SRM Chennai', points: 210, rank: 'Bronze', streak: 1, avatar: 'AR', color: '#fee2e2', textColor: '#991b1b', tasksCompleted: 2 },
];

// ===== TASKS =====
const tasks = [
  { id: 1, title: 'Instagram Post', desc: 'Share brand story with #UnsaidTalks tag', deadline: '2026-04-30', assignedTo: 'Priya Sharma', points: 50, done: false },
  { id: 2, title: 'Refer 3 Friends', desc: 'Get 3 signups using your referral link', deadline: '2026-05-05', assignedTo: 'Arjun Mehta', points: 40, done: false },
  { id: 3, title: 'Organize Campus Event', desc: 'Host a session at your college', deadline: '2026-05-10', assignedTo: 'Sneha Patel', points: 60, done: false },
  { id: 4, title: 'Create LinkedIn Post', desc: 'Write about your CA experience', deadline: '2026-04-29', assignedTo: 'Rahul Verma', points: 80, done: false },
];

function addTask(title, deadline, assignedTo, points) {
  const newTask = {
    id: tasks.length + 1,
    title,
    deadline,
    assignedTo,
    points,
    done: false
  };
  tasks.push(newTask);
  renderAdminDashboard(); // refresh dashboard stats
}

// Track monthly activity
let monthlyActivityLog = []; // { id, name, college, day, month }
let currentMonth = new Date().getMonth();

const colleges = [
  { name: 'IIT Bombay', total: 980 },
  { name: 'NIT Nagpur', total: 820 },
  { name: 'BITS Pilani', total: 650 },
  { name: 'VIT Pune', total: 340 },
  { name: 'SRM Chennai', total: 210 },
];

let myPoints = 340;
let myStreak = 2;
let currentProofTaskId = null;
let weeklyChart = null;

const adminNav = [
  { icon: 'fa-gauge', label: 'Dashboard', fn: renderAdminDashboard },
  { icon: 'fa-users', label: 'Ambassadors', fn: renderAmbassadors },
  { icon: 'fa-list-check', label: 'Tasks', fn: renderAdminTasks },
  { icon: 'fa-trophy', label: 'Leaderboard', fn: renderLeaderboard },
];
const ambNav = [
  { icon: 'fa-gauge', label: 'My Dashboard', fn: renderAmbDashboard },
  { icon: 'fa-list-check', label: 'My Tasks', fn: renderAmbTasks },
  { icon: 'fa-chart-line', label: 'Weekly Performance', fn: renderWeekly },
  { icon: 'fa-robot', label: 'AI Summary', fn: renderAISummary },
];

let currentOrganization = { name: "", email: "" };
let currentCandidate = { name: "", college: "", email: "", org: "" };
let currentRole = 'admin';
let currentNavIndex = 0;

// ===== LOGIN / LOGOUT =====
function login(role) {
  currentRole = role;
  currentNavIndex = 0;
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('appPage').classList.add('active');
  setupSidebar();
  renderCurrentPage();
}

function logout() {
  document.getElementById('appPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
}

// ===== ORGANIZATION LOGIN FLOW =====
function loginOrganization() {
  const name = document.getElementById('orgName').value.trim();
  const email = document.getElementById('orgEmail').value.trim();

  if (!name || !email) {
    alert("Please enter both organization name and email!");
    return;
  }

  // Save organization info
  currentOrganization.name = name;
  currentOrganization.email = email;

  // Switch role to admin
  currentRole = 'admin';
  currentNavIndex = 0;

  // Hide login page, show app page
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('appPage').classList.add('active');

  // Hide org form so it doesn’t stick
  document.getElementById('orgLoginForm').classList.add('hidden');

  setupSidebar();
  renderCurrentPage();
}


// ===== CANDIDATE LOGIN FLOW =====
function showCandidateLogin() {
  const form = document.getElementById('candidateLoginForm');
  if (form) {
    form.classList.remove('hidden');
  }
}

function loginCandidate() {
  const name = document.getElementById('candName').value.trim();
  const college = document.getElementById('candCollege').value.trim();
  const email = document.getElementById('candEmail').value.trim();
  const org = document.getElementById('candOrg').value.trim();

  if (!name || !college || !email || !org) {
    alert("Please fill in all fields!");
    return;
  }

  currentCandidate.name = name;
  currentCandidate.college = college;
  currentCandidate.email = email;
  currentCandidate.org = org;

  currentRole = 'ambassador';
  currentNavIndex = 0;

  // ✅ Hide login page and candidate form
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('appPage').classList.add('active');
  document.getElementById('candidateLoginForm').classList.add('hidden');

  setupSidebar();
  renderCurrentPage();
}


// ===== SIDEBAR =====
function setupSidebar() {
  const nav = currentRole === 'admin' ? adminNav : ambNav;

  // Use organization name if available, otherwise candidate name
  const name = currentRole === 'admin'
    ? (currentOrganization.name || 'Admin Panel')
    : (currentCandidate.name || 'Candidate');

  // Generate initials from org or candidate name
  const initials = currentRole === 'admin'
    ? (currentOrganization.name
        ? currentOrganization.name.split(' ').map(w => w[0].toUpperCase()).slice(0,2).join('')
        : 'AD')
    : (currentCandidate.name
        ? currentCandidate.name.split(' ').map(w => w[0].toUpperCase()).slice(0,2).join('')
        : 'CA');

  document.getElementById('sidebarRoleBadge').textContent =
    currentRole === 'admin' ? 'Organization Admin' : 'Campus Ambassador';

  document.getElementById('topbarUser').innerHTML = `
    <div class="user-avatar">${initials}</div>
    <span>${name}</span>
  `;

  const navEl = document.getElementById('sidebarNav');
  navEl.innerHTML = nav.map((item, i) => `
    <div class="nav-item ${i === currentNavIndex ? 'active' : ''}" onclick="navigate(${i})">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
    </div>
  `).join('');
}


function navigate(index) {
  currentNavIndex = index;
  setupSidebar();
  renderCurrentPage();
  document.getElementById('notifPanel').classList.remove('show');
}

function renderCurrentPage() {
  const nav = currentRole === 'admin' ? adminNav : ambNav;
  document.getElementById('topbarTitle').textContent = nav[currentNavIndex].label;
  nav[currentNavIndex].fn();
}

// ===== NOTIFICATIONS =====
function toggleNotifPanel() {
  document.getElementById('notifPanel').classList.toggle('show');
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notifPanel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.classList.remove('show');
  }
});

// ===== MILESTONE =====
function showMilestone(msg) {
  document.getElementById('milestoneMsg').textContent = msg;
  document.getElementById('milestoneOverlay').classList.add('show');
}
function closeMilestone() {
  document.getElementById('milestoneOverlay').classList.remove('show');
}

// ===== PROOF MODAL =====
function openProofModal(taskId) {
  currentProofTaskId = taskId;
  const task = tasks.find(t => t.id === taskId);
  document.getElementById('proofTaskName').textContent = task.title;
  document.getElementById('proofInput').value = '';
  document.getElementById('proofModal').classList.add('show');
}
function closeProofModal() {
  document.getElementById('proofModal').classList.remove('show');
  currentProofTaskId = null;
}
function submitProof() {
  const proof = document.getElementById('proofInput').value.trim();
  if (!proof) {
    alert('Please enter your proof before submitting.');
    return;
  }

  const task = tasks.find(t => t.id === currentProofTaskId);
  if (!task) return;

  // Mark task as done
  task.done = true;

  // Find the logged-in ambassador (replace with dynamic login later)
  const amb = ambassadors.find(a => a.name === currentCandidate.name);
  if (amb) {
    amb.points += task.points;   // update ambassador’s points
    amb.tasksCompleted += 1;     // increment tasks completed
  }

  myPoints += task.points;       // update myPoints too

  // Reset log if month has changed
  const today = new Date();
  const month = today.getMonth();
  if (month !== currentMonth) {
    monthlyActivityLog = [];
    currentMonth = month;
  }

  // Log activity with task name
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  if (amb) {
    monthlyActivityLog.push({
      id: amb.id,
      name: amb.name,
      college: amb.college,
      day: dayName,
      month,
      activity: `completed "${task.title}"`
    });
  }

  closeProofModal();
  checkMilestones(task.points);
  renderCurrentPage();
}


function checkMilestones(earned) {
  if (myPoints >= 500 && myPoints - earned < 500) {
    showMilestone('You hit 500 points and unlocked Gold rank! Keep going!');
  } else if (myPoints >= 1000 && myPoints - earned < 1000) {
    showMilestone('Incredible! 1000 points reached — Platinum rank unlocked!');
  } else {
    showMilestone(`+${earned} points earned! Great work!`);
  }
}

// ===== HELPERS =====
function getRankBadge(rank) {
  const map = { Platinum: 'badge-platinum', Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze' };
  return `<span class="badge ${map[rank] || 'badge-silver'}">${rank}</span>`;
}
function getMyRank() {
  if (myPoints >= 1000) return 'Platinum';
  if (myPoints >= 500) return 'Gold';
  if (myPoints >= 200) return 'Silver';
  return 'Bronze';
}
function getNextMilestone() {
  if (myPoints < 200) return 200;
  if (myPoints < 500) return 500;
  if (myPoints < 1000) return 1000;
  return 2000;
}
function destroyChart() {
  if (weeklyChart) { weeklyChart.destroy(); weeklyChart = null; }
}

// ===== ADMIN: DASHBOARD =====
function renderAdminDashboard() {
  destroyChart();
  const totalPts = ambassadors.reduce((s, a) => s + a.points, 0);

  document.getElementById('contentArea').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card" onclick="renderAmbassadorNames()">
        <div class="stat-icon" style="background:#ede9fe;color:#7c3aed">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-value">${ambassadors.length}</div>
        <div class="stat-label">Total Ambassadors</div>
      </div>

      <div class="stat-card" onclick="renderMonthlyActivity()">
        <div class="stat-icon" style="background:#dcfce7;color:#16a34a">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div class="stat-value">${monthlyActivityLog.length}</div>
        <div class="stat-label">Active This Month</div>
      </div>

      <div class="stat-card" onclick="renderTasksAssigned()">
        <div class="stat-icon" style="background:#dbeafe;color:#2563eb">
          <i class="fa-solid fa-list-check"></i>
        </div>
        <div class="stat-value">${tasks.length}</div>
        <div class="stat-label">Tasks Assigned</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#fef3c7;color:#d97706">
          <i class="fa-solid fa-star"></i>
        </div>
        <div class="stat-value">${totalPts.toLocaleString()}</div>
        <div class="stat-label">Total Points Given</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <!-- 🔹 Top Performers -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Top Performers</div>
          <span class="badge badge-purple">This Month</span>
        </div>
        ${[...ambassadors].sort((a, b) => b.points - a.points).slice(0, 3).map((a, i) => `
          <div class="lb-row">
            <div class="lb-rank rank-${i+1}">#${i+1}</div>
            <div class="avatar" style="background:${a.color};color:${a.textColor}">${a.avatar}</div>
            <div class="lb-info">
              <div class="lb-name">${a.name}</div>
              <div class="lb-college">${a.college}</div>
            </div>
            ${getRankBadge(a.rank)}
            <div class="lb-points">${a.points}</div>
          </div>
        `).join('')}
      </div>

      <!-- 🔹 Recent Activity -->
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Activity</div></div>
        ${monthlyActivityLog.length === 0
          ? '<div class="notif-item">No recent activity</div>'
          : monthlyActivityLog.slice(-5).map(log => `
              <div class="notif-item">
                <i class="fa-solid fa-check-circle" style="color:#22c55e;font-size:16px"></i>
                ${log.name} from ${log.college} ${log.activity || 'was active'} on ${log.day}
              </div>
            `).join('')
        }
      </div>
    </div>
  `;
}

// ===== ADMIN: AMBASSADORS =====
function renderAmbassadors() {
  destroyChart();
  const avatarColors = [
    { bg: '#ede9fe', text: '#6d28d9' }, { bg: '#fef3c7', text: '#b45309' },
    { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#dcfce7', text: '#166534' },
    { bg: '#fee2e2', text: '#991b1b' }, { bg: '#fce7f3', text: '#9d174d' },
  ];
  document.getElementById('contentArea').innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <div class="card-title">Add Ambassador</div>
        <span class="badge badge-purple">${ambassadors.length} Total</span>
      </div>
      <div class="add-task-form">
        <div class="form-row">
          <input type="text" id="newAmbName" class="form-input" placeholder="Full Name (e.g. Rahul Verma)" />
          <input type="text" id="newAmbCollege" class="form-input" placeholder="College Name (e.g. IIT Bombay)" />
        </div>
        <button class="btn-add" onclick="addAmbassador()">
          <i class="fa-solid fa-user-plus"></i> Add Ambassador
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:16px">All Ambassadors</div>
      <div class="amb-grid">
        ${ambassadors.map(a => `
          <div class="amb-card">
            <div class="amb-avatar" style="background:${a.color};color:${a.textColor}">${a.avatar}</div>
            <div class="amb-name">${a.name}</div>
            <div class="amb-college">${a.college}</div>
            <div style="margin-bottom:10px">${getRankBadge(a.rank)}</div>
            <div class="amb-pts">${a.points}</div>
            <div class="amb-pts-label">points</div>
            <div style="margin-top:10px;font-size:12px;color:#f59e0b;font-weight:600">🔥 ${a.streak} week streak</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addAmbassador() {
  const name = document.getElementById('newAmbName').value.trim();
  const college = document.getElementById('newAmbCollege').value.trim();
  if (!name || !college) { alert('Please enter both name and college!'); return; }
  const initials = name.split(' ').map(w => w[0].toUpperCase()).slice(0, 2).join('');
  const colors = [
    { bg: '#ede9fe', text: '#6d28d9' }, { bg: '#fef3c7', text: '#b45309' },
    { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#dcfce7', text: '#166534' },
    { bg: '#fee2e2', text: '#991b1b' }, { bg: '#fce7f3', text: '#9d174d' },
  ];
  const c = colors[ambassadors.length % colors.length];
  ambassadors.push({
    id: Date.now(), name, college, points: 0,
    rank: 'Bronze', streak: 0, avatar: initials,
    color: c.bg, textColor: c.text, tasksCompleted: 0
  });
  colleges.push({ name: college, total: 0 });
  renderAmbassadors();
}

// ===== ADMIN: TASKS =====
function renderAdminTasks() {
  destroyChart();
  document.getElementById('contentArea').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Create New Task</div>
      </div>
      <div class="add-task-form">
        <div class="form-row">
          <input type="text" id="newTaskTitle" class="form-input" placeholder="Task title" />
          <input type="number" id="newTaskPts" class="form-input" placeholder="Points" min="10" />
        </div>
        <div class="form-row">
          <input type="text" id="newTaskDesc" class="form-input" placeholder="Description" />
          <input type="text" id="newTaskDeadline" class="form-input" placeholder="Deadline (e.g. May 10)" />
          <!-- ✅ New input for Assigned To -->
          <input type="text" id="newTaskAssignedTo" class="form-input" placeholder="Assigned To (e.g. Priya Sharma)" />
        </div>
        <button class="btn-add" onclick="addTask()"><i class="fa-solid fa-plus"></i> Add Task</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">All Tasks</div>
      ${tasks.map(t => `
        <div class="task-row">
          <div class="task-check ${t.done ? 'done' : ''}">
            ${t.done ? '<i class="fa-solid fa-check" style="font-size:11px"></i>' : ''}
          </div>
          <div class="task-info">
            <!-- ✅ Show Assigned To before task title -->
            <div class="task-assigned" style="font-size:12px;color:#6b7280;margin-bottom:4px">
              Assigned to: <strong>${t.assignedTo || 'Unassigned'}</strong>
            </div>
            <div class="task-title" style="${t.done?'text-decoration:line-through;color:#9ca3af':''}">
              ${t.title}
            </div>
            <div class="task-meta">${t.desc} &nbsp;·&nbsp; Deadline: ${t.deadline}</div>
          </div>
          <div class="task-pts">+${t.points} pts</div>
          <span class="badge ${t.done ? 'badge-green' : 'badge-blue'}">${t.done ? 'Completed' : 'Active'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function addTask() {
  const title = document.getElementById('newTaskTitle').value.trim();
  const pts = parseInt(document.getElementById('newTaskPts').value);
  const desc = document.getElementById('newTaskDesc').value.trim();
  const deadline = document.getElementById('newTaskDeadline').value.trim();
  const assignedTo = document.getElementById('newTaskAssignedTo').value.trim(); // ✅ new line

  if (!title || !pts || !desc || !deadline || !assignedTo) { 
    alert('Please fill all fields including Assigned To!'); 
    return; 
  }

  tasks.push({ 
    id: Date.now(), 
    title, 
    desc, 
    points: pts, 
    deadline, 
    assignedTo,   
    done: false 
  });

  renderAdminTasks();
}

// ===== ADMIN: LEADERBOARD =====
function renderLeaderboard() {
  destroyChart();
  const sorted = [...ambassadors].sort((a, b) => b.points - a.points);
  const maxPts = sorted[0].points;
  document.getElementById('contentArea').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Overall Leaderboard</div>
          <span class="badge badge-purple">All Time</span>
        </div>
        ${sorted.map((a, i) => `
          <div class="lb-row">
            <div class="lb-rank ${i < 3 ? 'rank-' + (i+1) : ''}">#${i+1}</div>
            <div class="avatar" style="background:${a.color};color:${a.textColor}">${a.avatar}</div>
            <div class="lb-info">
              <div class="lb-name">${a.name}</div>
              <div class="lb-college">${a.college} &nbsp;·&nbsp; 🔥 ${a.streak}w</div>
            </div>
            ${getRankBadge(a.rank)}
            <div class="lb-points">${a.points}</div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">College Leaderboard</div>
          <span class="badge badge-green">Top Colleges</span>
        </div>
        ${colleges.map((c, i) => `
          <div class="college-row">
            <div class="college-rank">#${i+1}</div>
            <div class="college-name">${c.name}</div>
            <div class="college-bar-wrap">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${Math.round(c.total/maxPts*100)}%;background:${i===0?'#7c3aed':i===1?'#f59e0b':'#9ca3af'}"></div>
              </div>
            </div>
            <div class="lb-points" style="min-width:60px;text-align:right">${c.total}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAmbassadorNames() {
  document.getElementById('contentArea').innerHTML = `
    <div class="card" style="background:#fff;border:none;box-shadow:0 8px 24px rgba(0,0,0,0.12)">
      <div class="card-header">
        <div class="card-title" style="color:#7c3aed;font-size:18px;font-weight:800">👥 Ambassadors List</div>
        <button onclick="renderAdminDashboard()" 
                style="background:#7c3aed;color:white;border:none;
                       padding:6px 14px;border-radius:8px;
                       font-size:12px;cursor:pointer;">
          ← Back
        </button>
      </div>
      <div style="margin-top:12px;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead style="background:#ede9fe;color:#6d28d9">
            <tr>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #c4b5fd">Ambassador Name</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #c4b5fd">College</th>
            </tr>
          </thead>
          <tbody>
            ${ambassadors.length === 0 
              ? `<tr><td colspan="2" style="padding:16px;text-align:center;color:#6b7280">No ambassadors added yet</td></tr>`
              : ambassadors.map(a => `
                  <tr>
                    <td style="padding:10px;border-bottom:1px solid #e5e7eb">${a.name}</td>
                    <td style="padding:10px;border-bottom:1px solid #e5e7eb">${a.college}</td>
                  </tr>
                `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}


function renderMonthlyActivity() {
  document.getElementById('contentArea').innerHTML = `
    <div class="card" style="background:linear-gradient(135deg,#fef3c7,#ede9fe);border:none;box-shadow:0 8px 24px rgba(0,0,0,0.12)">
      <div class="card-header">
        <div class="card-title" style="color:#5b21b6;font-size:18px;font-weight:800">📅 Active Ambassadors This Month</div>
        <button onclick="renderAdminDashboard()" 
                style="background:#7c3aed;color:white;border:none;
                       padding:8px 16px;border-radius:8px;
                       font-size:13px;cursor:pointer;">
          ← Back
        </button>
      </div>
      <div style="margin-top:12px">
        ${monthlyActivityLog.length === 0 
          ? '<div style="padding:16px;text-align:center;color:#6b7280;font-size:14px">No activity yet this month</div>'
          : monthlyActivityLog.map(a => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #e5e7eb">
                <div class="amb-avatar" style="background:#dbeafe;color:#2563eb">${a.name.split(' ').map(w=>w[0]).join('')}</div>
                <div>
                  <div style="font-weight:600;color:#1a1a2e">${a.name}</div>
                  <div style="font-size:12px;color:#6b7280">${a.college}</div>
                  <div style="font-size:12px;color:#22c55e;font-weight:600">Active on ${a.day}</div>
                </div>
              </div>
            `).join('')}
      </div>
    </div>
  `;
}

function renderTasksAssigned() {
  document.getElementById('contentArea').innerHTML = `
    <div class="card" style="background:#fff;border:none;box-shadow:0 8px 24px rgba(0,0,0,0.12)">
      <div class="card-header">
        <div class="card-title" style="color:#1d4ed8;font-size:18px;font-weight:800">📋 Tasks Assigned</div>
        <button onclick="renderAdminDashboard()" 
                style="background:#2563eb;color:white;border:none;
                       padding:8px 16px;border-radius:8px;
                       font-size:13px;cursor:pointer;">
          ← Back
        </button>
      </div>
      <div style="margin-top:12px;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead style="background:#dbeafe;color:#1d4ed8">
            <tr>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #93c5fd">Ambassador</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #93c5fd">Task</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #93c5fd">Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.length === 0 
              ? `<tr><td colspan="3" style="padding:16px;text-align:center;color:#6b7280">No tasks assigned</td></tr>`
              : tasks.map(t => `
                  <tr>
                    <td style="padding:10px;border-bottom:1px solid #e5e7eb">${t.assignedTo}</td>
                    <td style="padding:10px;border-bottom:1px solid #e5e7eb">${t.title}</td>
                    <td style="padding:10px;border-bottom:1px solid #e5e7eb">${t.deadline}</td>
                  </tr>
                `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== AMBASSADOR: DASHBOARD =====
function renderAmbDashboard() {
  destroyChart();

  const amb = ambassadors.find(a => a.name === currentCandidate.name);
  const myPoints = amb ? amb.points : 0;
  const myStreak = amb ? amb.streak : 0;
  const doneTasks = tasks.filter(t => t.assignedTo === currentCandidate.name && t.done).length;

  const myRank = getMyRank();
  const nextMilestone = getNextMilestone();
  const progress = Math.min(100, Math.round(myPoints / nextMilestone * 100));

  document.getElementById('contentArea').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon" style="background:#ede9fe;color:#7c3aed"><i class="fa-solid fa-star"></i></div>
        <div class="stat-value">${myPoints}</div><div class="stat-label">My Points</div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#fef3c7;color:#d97706"><i class="fa-solid fa-fire"></i></div>
        <div class="stat-value">${myStreak}</div><div class="stat-label">Week Streak 🔥</div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#dcfce7;color:#16a34a"><i class="fa-solid fa-check-double"></i></div>
        <div class="stat-value">${doneTasks}</div><div class="stat-label">Tasks Completed</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">My Profile</div></div>
      <div style="font-size:14px;color:#6b7280">
        <strong>${currentCandidate.name}</strong><br>
        ${currentCandidate.college}<br>
        ${currentCandidate.org}<br>
        ${currentCandidate.email}
      </div>
    </div>
  `;
}

// ===== AMBASSADOR: TASKS =====
function renderAmbTasks() {
  destroyChart();
  const myName = currentCandidate.name;
  const myTasks = tasks.filter(t => t.assignedTo === myName);

  document.getElementById('contentArea').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">My Tasks</div>
        <span class="badge badge-purple">${myTasks.filter(t=>t.done).length}/${myTasks.length} done</span>
      </div>
      ${myTasks.length === 0 
        ? '<div style="padding:16px;text-align:center;color:#6b7280">No tasks assigned to you</div>'
        : myTasks.map(t => `
          <div class="task-row">
            <div class="task-check ${t.done ? 'done' : ''}">
              ${t.done ? '<i class="fa-solid fa-check" style="font-size:11px"></i>' : ''}
            </div>
            <div class="task-info">
              <div class="task-assigned" style="font-size:12px;color:#6b7280;margin-bottom:4px">
                Assigned to: <strong>${t.assignedTo}</strong>
              </div>
              <div class="task-title" style="${t.done?'text-decoration:line-through;color:#9ca3af':''}">
                ${t.title}
              </div>
              <div class="task-meta">${t.desc} · Deadline: ${t.deadline}</div>
            </div>
            <div class="task-pts">+${t.points} pts</div>
            <button class="btn-complete ${t.done ? 'done' : ''}" onclick="${t.done ? '' : 'openProofModal(' + t.id + ')'}">
              ${t.done ? '✓ Done' : 'Submit Proof'}
            </button>
          </div>
        `).join('')}
    </div>
  `;
}


// ===== AMBASSADOR: WEEKLY =====
function renderWeekly() {
  destroyChart();
  const weeklyData = [45, 80, 60, 120, 95, 140, 110];
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];
  const avg = Math.round(weeklyData.reduce((a, b) => a + b) / weeklyData.length);
  const best = Math.max(...weeklyData);

  document.getElementById('contentArea').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#ede9fe;color:#7c3aed"><i class="fa-solid fa-chart-line"></i></div>
        <div class="stat-value">${best}</div>
        <div class="stat-label">Best Week (W6)</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#dbeafe;color:#2563eb"><i class="fa-solid fa-calendar-week"></i></div>
        <div class="stat-value">${weeklyData[6]}</div>
        <div class="stat-label">This Week</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#dcfce7;color:#16a34a"><i class="fa-solid fa-calculator"></i></div>
        <div class="stat-value">${avg}</div>
        <div class="stat-label">Weekly Average</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef3c7;color:#d97706"><i class="fa-solid fa-ranking-star"></i></div>
        <div class="stat-value">#3</div>
        <div class="stat-label">Weekly Rank</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Points Per Week</div>
        <span class="badge badge-purple">Last 7 Weeks</span>
      </div>
      <div class="chart-wrap">
        <canvas id="weeklyChart"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Weekly Report Card</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:14px">
        <div><span style="color:#6b7280">Tasks completed:</span> <strong>${tasks.filter(t=>t.done).length}/${tasks.length}</strong></div>
        <div><span style="color:#6b7280">Points this week:</span> <strong>110</strong></div>
        <div><span style="color:#6b7280">Rank change:</span> <strong style="color:#22c55e">↑ +1 position</strong></div>
        <div><span style="color:#6b7280">Streak:</span> <strong>🔥 ${myStreak} weeks</strong></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Points',
          data: weeklyData,
          backgroundColor: weeklyData.map((v, i) => i === 5 ? '#7c3aed' : '#ede9fe'),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { family: 'DM Sans' } } },
          x: { grid: { display: false }, ticks: { font: { family: 'DM Sans' } } }
        }
      }
    });
  }, 50);
}

// ===== AMBASSADOR: AI SUMMARY =====
function renderAISummary() {
  destroyChart();
  const myRank = getMyRank();
  const doneTasks = tasks.filter(t => t.done).length;
  document.getElementById('contentArea').innerHTML = `
    <div class="ai-card">
      <div class="ai-card-header">
        <div class="ai-icon"><i class="fa-solid fa-robot"></i></div>
        <div class="ai-card-title">AI Performance Summary</div>
      </div>
      <div class="ai-text">
        <span class="ai-highlight">Rahul Verma</span> has shown consistent improvement over the past 7 weeks, with weekly points growing from 
        <span class="ai-highlight">45 in Week 1</span> to <span class="ai-highlight">110 in Week 7</span>. 
        Best performance was Week 6 with <span class="ai-highlight">140 points</span>. 
        Currently ranked <span class="ai-highlight">${myRank}</span> with a 
        <span class="ai-highlight">${myStreak}-week activity streak</span>, and has completed 
        <span class="ai-highlight">${doneTasks} out of ${tasks.length} tasks</span>.<br><br>
        <strong style="color:white">Recommendation:</strong> Complete the 
        <span class="ai-highlight">"Refer 3 Friends"</span> task before the April 30 deadline to earn 150 points 
        and potentially unlock Gold rank. Maintaining your weekly login streak will also unlock special streak badges!
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Rank Progression</div></div>
      <div class="rank-progress">
        <div class="rank-step ${myRank==='Bronze'?'active-rank':''}">
          <div class="rank-icon">🥉</div>
          <div class="rank-name">Bronze</div>
          <div class="rank-pts">0–199 pts</div>
        </div>
        <div class="rank-step ${myRank==='Silver'?'active-rank':''}">
          <div class="rank-icon">🥈</div>
          <div class="rank-name">Silver</div>
          <div class="rank-pts">200–499 pts</div>
        </div>
        <div class="rank-step ${myRank==='Gold'?'active-rank':''}">
          <div class="rank-icon">🥇</div>
          <div class="rank-name">Gold</div>
          <div class="rank-pts">500–999 pts</div>
        </div>
        <div class="rank-step ${myRank==='Platinum'?'active-rank':''}">
          <div class="rank-icon">💎</div>
          <div class="rank-name">Platinum</div>
          <div class="rank-pts">1000+ pts</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Performance Tips</div></div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="color:#7c3aed;font-size:16px">💡</span>
          <span>Complete tasks before deadlines to maintain your streak and earn bonus points.</span>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="color:#f59e0b;font-size:16px">🎯</span>
          <span>Focus on high-point tasks like "Organize Campus Event" (200 pts) to rank up faster.</span>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="color:#22c55e;font-size:16px">📈</span>
          <span>Log in daily to keep collecting the daily login bonus and maintain your activity streak.</span>
        </div>
      </div>
    </div>
  `;
}
function showOrgLogin() {
  document.getElementById('orgLoginForm').classList.remove('hidden');
  document.getElementById('candidateLoginForm').classList.add('hidden');
}

function showCandidateLogin() {
  document.getElementById('candidateLoginForm').classList.remove('hidden');
  document.getElementById('orgLoginForm').classList.add('hidden');
}

