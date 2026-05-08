// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = type === 'success'
        ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>`
        : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `${icon} ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// --- HAMBURGER MENU ---
function toggleNav() {
    document.getElementById('navLinks').classList.toggle('active');
}

// --- LOGIN & LOGOUT ROUTING ---
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPwd').value;

    // Strict requirement: User must type exactly "dmuportal"
    if (user !== "dmuportal" || pass !== "dmuportal") {
        showToast("Incorrect password or username", "error");
        return;
    }

    const role = document.getElementById('roleSelect').value;
    try { localStorage.setItem('dmu_role', role); } catch (e) { }

    if (role === 'student') window.location.assign('student.html');
    else if (role === 'instructor') window.location.assign('instructor.html');
    else if (role === 'admin') window.location.assign('admin.html');
}

function logout() {
    try { localStorage.removeItem('dmu_role'); } catch (e) { }
    window.location.assign('index.html');
}

// --- MODALS ---
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// --- PASSWORD VALIDATION LOGIC ---
function submitChangePassword(event, modalId) {
    event.preventDefault();
    const form = event.target;

    const currPwd = form.querySelector('.current-pwd').value;
    const newPwd = form.querySelector('.new-pwd').value;
    const confPwd = form.querySelector('.conf-pwd').value;

    // Strict validation: Current password must be "dmuportal"
    if (currPwd !== "dmuportal") {
        showToast("Error: Incorrect current password!", "error");
        return;
    }

    // Passwords must match
    if (newPwd !== confPwd) {
        showToast("Error: New passwords do not match!", "error");
        return;
    }

    toggleModal(modalId);
    showToast("Password updated securely!", "success");
    form.reset();
}

// Admin Specific Reset Tool
let currentResetUser = "";
function openResetPasswordModal(userName) {
    currentResetUser = userName;
    document.getElementById('resetUserName').innerText = userName;
    toggleModal('adminResetPwdModal');
}

function submitAdminResetPassword(event) {
    event.preventDefault();
    const form = event.target;
    const newPwd = form.querySelector('.new-pwd').value;
    const confPwd = form.querySelector('.conf-pwd').value;

    if (newPwd !== confPwd) {
        showToast("Error: Passwords do not match!", "error");
        return;
    }

    toggleModal('adminResetPwdModal');
    showToast(`Password for ${currentResetUser} reset successfully.`, "success");
    form.reset();
}

// --- ADMIN SPECIFIC FUNCTIONS & DYNAMIC STATS ---
document.addEventListener('DOMContentLoaded', () => {
    updateAdminStats();
});

function updateAdminStats() {
    if (!document.getElementById('statStudents')) return;

    let students = 0;
    let instructors = 0;

    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const role = row.cells[2].innerText;
        if (role === 'Student') students++;
        if (role === 'Instructor') instructors++;
    });

    document.getElementById('statStudents').innerText = students;
    document.getElementById('statInstructors').innerText = instructors;

    const courseStat = document.getElementById('statCourses');
    courseStat.innerText = courseStat.getAttribute('data-base');
}

function filterUsers() {
    const query = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const id = row.cells[1].textContent.toLowerCase();
        if (name.includes(query) || id.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function submitNewUser(event) {
    event.preventDefault();
    const form = event.target;
    const name = document.getElementById('newUserName').value;
    const id = document.getElementById('newUserID').value;
    const role = document.getElementById('newUserRole').value;
    const pwd = form.querySelector('.new-pwd').value;
    const conf = form.querySelector('.conf-pwd').value;

    if (pwd !== conf) {
        showToast("Passwords do not match!", "error");
        return;
    }

    const tbody = document.getElementById('userTableBody');
    const tr = document.createElement('tr');

    let actionsHTML = '';
    if (role === 'Student') {
        actionsHTML += `<button class="btn btn-outline" style="padding: 0.3rem; margin-right: 5px;" onclick="viewSingleStudent('${name}', '${id}', true)">Print Record</button>`;
    }
    actionsHTML += `<button class="btn btn-danger" style="padding: 0.3rem;" onclick="openResetPasswordModal('${name}')">Reset Pwd</button>`;

    tr.innerHTML = `<td>${name}</td><td>${id}</td><td>${role}</td><td>${actionsHTML}</td>`;

    if (role === 'Instructor') tr.style.backgroundColor = '#f8fafc';
    if (role === 'Admin') tr.style.backgroundColor = '#fffbeb';

    tbody.insertBefore(tr, tbody.firstChild);

    updateAdminStats();
    toggleModal('addSingleModal');
    showToast('New user account created successfully.', 'success');
    form.reset();
}

function submitNewCourse(event) {
    event.preventDefault();
    const courseStat = document.getElementById('statCourses');
    let count = parseInt(courseStat.getAttribute('data-base')) + 1;
    courseStat.setAttribute('data-base', count);

    updateAdminStats();
    toggleModal('addCourseModal');
    showToast('New course officially added to the system.', 'success');
    event.target.reset();
}

function submitAssignCourse(event) {
    event.preventDefault();
    const inst = document.getElementById('assignInstructor').value;
    const dept = document.getElementById('assignDept').value;
    const course = document.getElementById('assignCourseName').value;
    const sec = document.getElementById('assignSection').value;

    const tbody = document.getElementById('assignmentTableBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${inst}</td><td>${dept}</td><td>${course}</td><td>${sec}</td><td><button class="btn btn-outline" style="color:var(--danger); border-color:var(--danger); padding:0.3rem;" onclick="this.closest('tr').remove()">Revoke</button></td>`;

    tbody.insertBefore(tr, tbody.firstChild);

    toggleModal('assignCourseModal');
    showToast('Course successfully assigned to instructor.', 'success');
    event.target.reset();
}

function generateClassAccounts(event) {
    event.preventDefault();
    toggleModal('addClassModal');
    showToast('Class accounts generated! Default passwords applied.', 'success');
}

// --- INSTRUCTOR LIVE GRADING (STRICT LIMITS) ---
function calculateTotal(inputElement) {
    const row = inputElement.closest('tr');

    const midEl = row.querySelector('.mid-exam');
    const assEl = row.querySelector('.assignment');
    const finEl = row.querySelector('.final-exam');

    const mid = parseFloat(midEl.value) || 0;
    const ass = parseFloat(assEl.value) || 0;
    const fin = parseFloat(finEl.value) || 0;

    let hasError = false;

    if (mid > 30) { midEl.classList.add('input-error'); hasError = true; } else { midEl.classList.remove('input-error'); }
    if (ass > 20) { assEl.classList.add('input-error'); hasError = true; } else { assEl.classList.remove('input-error'); }
    if (fin > 50) { finEl.classList.add('input-error'); hasError = true; } else { finEl.classList.remove('input-error'); }

    const totalCell = row.querySelector('.total-mark');
    const gradeCell = row.querySelector('.final-grade');

    if (hasError) {
        totalCell.textContent = "Error"; gradeCell.textContent = "--";
        totalCell.style.color = "var(--danger)"; gradeCell.style.color = "var(--danger)";
        return;
    }

    if (midEl.value === "" && assEl.value === "" && finEl.value === "") {
        totalCell.textContent = "--"; gradeCell.textContent = "--";
        totalCell.style.color = "var(--text-muted)"; gradeCell.style.color = "var(--text-muted)";
        return;
    }

    const total = mid + ass + fin;
    let grade = 'F', color = 'var(--danger)';

    if (total >= 90) { grade = 'A+'; color = 'var(--success)'; }
    else if (total >= 85) { grade = 'A'; color = 'var(--success)'; }
    else if (total >= 80) { grade = 'A-'; color = 'var(--success)'; }
    else if (total >= 75) { grade = 'B+'; color = 'var(--info)'; }
    else if (total >= 70) { grade = 'B'; color = 'var(--info)'; }
    else if (total >= 65) { grade = 'B-'; color = 'var(--info)'; }
    else if (total >= 60) { grade = 'C+'; color = 'var(--warning)'; }
    else if (total >= 50) { grade = 'C'; color = 'var(--warning)'; }
    else if (total >= 45) { grade = 'C-'; color = 'var(--warning)'; }
    else if (total >= 40) { grade = 'D'; color = 'var(--danger)'; }

    totalCell.textContent = total; gradeCell.textContent = grade;
    totalCell.style.color = color; totalCell.style.fontWeight = "bold";
    gradeCell.style.color = color; gradeCell.style.fontWeight = "bold";
}

function saveGrade(btnElement) {
    const row = btnElement.closest('tr');
    if (row.querySelector('.total-mark').textContent === "Error") {
        showToast("Cannot save. Fix the highlighted grade errors first.", "error");
        return;
    }
    const studentName = row.querySelector('td:first-child').innerText;
    showToast(`Grades saved for ${studentName}`, 'success');
}

// --- ADMIN PRINT FUNCTIONS ---
function generatePrintHTML(name, id, gpa, isNew = false) {
    let tableContent = '';

    if (isNew) {
        tableContent = `<tr><td colspan="5" style="text-align:center; padding: 30px; font-size: 16px; color: var(--text-muted);"><b>No records available for this student.</b></td></tr>`;
        gpa = "N/A";
    } else {
        tableContent = `
            <tr><td>Data Structures and Algorithm</td><td>3</td><td>88</td><td>A</td><td>12.0</td></tr>
            <tr><td>Web Design and Programming</td><td>3</td><td>96</td><td>A+</td><td>12.0</td></tr>
            <tr><td>Operating System and System Programming</td><td>4</td><td>76</td><td>B+</td><td>12.0</td></tr>
            <tr><td>Fundamentals of Networking</td><td>4</td><td>68</td><td>B+</td><td>12.0</td></tr>
            <tr><td>Object Oriented Programming</td><td>3</td><td>62</td><td>C+</td><td>6</td></tr>
            <tr><td>Computer Organization and Architecture</td><td>3</td><td>58</td><td>C</td><td>6.0</td></tr>
        `;
    }

    return `
    <div class="print-page">
        <div class="rc-header">
            <h1>Debremarkos University</h1>
            <h2>Institute of Technology</h2>
            <h3>Grade Report</h3>
        </div>
        <div class="rc-separator">--------------------------------------------------</div>
        <div class="rc-info">
            <div><p><b>Admission:</b> Regular</p><p><b>Major:</b> Software Engineering</p><p><b>Year:</b> 2026 | <b>Sem:</b> II</p></div>
            <div style="text-align: right;"><p><b>Name:</b> ${name}</p><p><b>ID:</b> ${id}</p></div>
        </div>
        <table class="rc-table">
            <tr><th>Course Title</th><th>Cr.Hr</th><th>Mark (100%)</th><th>Letter Grade</th><th>Grade Point</th></tr>
            ${tableContent}
        </table>
        <table class="rc-table" style="width: 50%;"><tr><th>GPA</th><th>Credit Cumulative</th></tr><tr><td><b>${gpa}</b></td><td><b>${isNew ? 0 : 20}</b></td></tr></table>
        <div class="rc-remarks"><p style="text-decoration: underline; font-weight: bold; margin-bottom:5px;">Remarks Section:</p><ul><li><span class="rc-box">${!isNew && gpa >= 1.75 ? 'X' : '&nbsp;'}</span> Promoted</li><li><span class="rc-box">${!isNew && gpa < 1.75 ? 'X' : '&nbsp;'}</span> Academic Warning</li></ul></div>
        <div style="margin-top: 40px; text-align: right; font-family: 'Times New Roman', serif;"><p>___________________________</p><p>Registrar Signature & Date</p></div>
    </div>
    `;
}

function viewSingleStudent(name, id, isNew = false) {
    document.getElementById('viewStudentName').innerText = name;
    document.getElementById('viewStudentID').innerText = `ID: ${id} | Software Eng.`;

    const printContainer = document.getElementById('adminPrintArea');
    printContainer.innerHTML = generatePrintHTML(name, id, isNew ? "0.00" : "3.18", isNew);

    toggleModal('viewStudentModal');
}

function printSingleStudent() {
    toggleModal('viewStudentModal');
    setTimeout(() => { window.print(); }, 200);
}

function generateBatchReports() {
    const printContainer = document.getElementById('adminPrintArea');
    printContainer.innerHTML = '';

    const batchStudents = [
        { name: "Abebe Kebede", id: "DMU/0012/14", gpa: "3.8" },
        { name: "Sara Tadesse", id: "DMU/0045/14", gpa: "3.80" },
        { name: "Dawit Bekele", id: "DMU/0112/14", gpa: "2.45" },
        { name: "Kidist Alemu", id: "DMU/0115/14", gpa: "3.50" }
    ];

    batchStudents.forEach(student => {
        printContainer.innerHTML += generatePrintHTML(student.name, student.id, student.gpa, false);
    });

    showToast('Preparing batch official documents...', 'success');
    setTimeout(() => { window.print(); }, 500);
}

function triggerPrint() {
    showToast('Preparing official document...', 'success');
    setTimeout(() => { window.print(); }, 500);
}