// Admin password
const ADMIN_PASSWORD = 'abhinav22456';

// Data storage (using localStorage)
let files = [];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    displayUserFiles();
});

// Load files from localStorage
function loadFiles() {
    const stored = localStorage.getItem('abhinav_files');
    files = stored ? JSON.parse(stored) : [];
}

// Save files to localStorage
function saveFiles() {
    localStorage.setItem('abhinav_files', JSON.stringify(files));
}

// Navigation
function goToHome() {
    switchPage('homePage');
}

function goToAdminLogin() {
    switchPage('adminLoginPage');
    document.getElementById('adminPassword').value = '';
}

function goToUserPanel() {
    switchPage('userPortalPage');
    displayUserFiles();
}

function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
}

// Admin Login
function handleAdminLogin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (password === ADMIN_PASSWORD) {
        errorDiv.classList.remove('show');
        sessionStorage.setItem('adminLoggedIn', 'true');
        switchPage('adminPanelPage');
        displayAdminFiles();
    } else {
        errorDiv.textContent = '❌ Invalid password. Please try again.';
        errorDiv.classList.add('show');
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    goToHome();
}

// File Upload Handler
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('uploadArea').classList.remove('drag-over');
    
    const files_list = event.dataTransfer.files;
    if (files_list.length > 0) {
        processFile(files_list[0]);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    document.getElementById('uploadArea').classList.add('drag-over');
}

function handleDragLeave(event) {
    document.getElementById('uploadArea').classList.remove('drag-over');
}

function handleFileSelect(event) {
    const file_list = event.target.files;
    if (file_list.length > 0) {
        processFile(file_list[0]);
    }
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const fileData = {
            name: file.name,
            size: (file.size / 1024).toFixed(2),
            type: file.type,
            content: e.target.result,
            timestamp: new Date().toLocaleString(),
            id: Date.now()
        };
        
        // Store in temporary storage for use with file info form
        sessionStorage.setItem('currentFile', JSON.stringify(fileData));
        
        const statusDiv = document.getElementById('uploadStatus');
        statusDiv.textContent = `✅ File uploaded: ${file.name} (${fileData.size} KB)`;
        statusDiv.classList.remove('error');
        statusDiv.classList.add('success');
    };
    reader.readAsDataURL(file);
}

// Add File Info
function addFileInfo() {
    const fileName = document.getElementById('fileName').value;
    const fileReadme = document.getElementById('fileReadme').value;
    const currentFile = sessionStorage.getItem('currentFile');
    
    if (!currentFile) {
        alert('❌ Please upload a file first');
        return;
    }
    
    if (!fileName || !fileReadme) {
        alert('❌ Please fill in all fields');
        return;
    }
    
    const fileData = JSON.parse(currentFile);
    fileData.displayName = fileName;
    fileData.readme = fileReadme;
    
    files.push(fileData);
    saveFiles();
    
    // Clear form
    document.getElementById('fileInfoForm').reset();
    document.getElementById('uploadStatus').textContent = '';
    document.getElementById('uploadStatus').classList.remove('success');
    sessionStorage.removeItem('currentFile');
    document.getElementById('fileInput').value = '';
    
    alert('✅ File added successfully!');
    displayAdminFiles();
}

// Display Admin Files
function displayAdminFiles() {
    const container = document.getElementById('adminFilesList');
    
    if (files.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No files uploaded yet</div>';
        return;
    }
    
    container.innerHTML = files.map(file => `
        <div class="admin-file-item">
            <div class="admin-file-info">
                <h3>📄 ${file.displayName}</h3>
                <p>${file.readme.substring(0, 100)}...</p>
                <small>Uploaded: ${file.timestamp} | Size: ${file.size} KB</small>
            </div>
            <div class="admin-file-actions">
                <button class="btn-delete" onclick="deleteFile(${file.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete File
function deleteFile(id) {
    if (confirm('Are you sure you want to delete this file?')) {
        files = files.filter(f => f.id !== id);
        saveFiles();
        displayAdminFiles();
        alert('✅ File deleted successfully!');
    }
}

// Display User Files
function displayUserFiles() {
    const container = document.getElementById('userFilesList');
    
    if (files.length === 0) {
        container.innerHTML = '<div class="no-files">📭 No tools or bots available yet. Check back soon!</div>';
        return;
    }
    
    container.innerHTML = files.map(file => `
        <div class="user-file-card">
            <div class="user-file-header">
                <h3>📦 ${file.displayName}</h3>
            </div>
            <div class="user-file-content">
                <div class="file-readme">${file.readme}</div>
                <div class="file-actions">
                    <button class="btn-view" onclick="viewFile(${file.id})">👁️ View</button>
                    <button class="btn-download" onclick="downloadFile(${file.id})">⬇️ Download</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Files (Search)
function filterFiles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.user-file-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const content = card.querySelector('.file-readme').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// View File
function viewFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📄 ${file.displayName}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">${file.readme}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Download File
function downloadFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    link.click();
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const input = document.getElementById('adminPassword');
    const button = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}