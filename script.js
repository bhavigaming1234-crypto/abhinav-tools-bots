// Admin password
const ADMIN_PASSWORD = 'abhinav22456';

// Data storage (using localStorage)
let files = [];
let socialLinks = {
    instagram: '#',
    discord: '#'
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    loadSocialLinks();
    displayUserFiles();
    updateSocialLinksDisplay();
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

// Load social links from localStorage
function loadSocialLinks() {
    const stored = localStorage.getItem('abhinav_social_links');
    if (stored) {
        socialLinks = JSON.parse(stored);
    }
}

// Save social links to localStorage
function saveSocialLinks() {
    localStorage.setItem('abhinav_social_links', JSON.stringify(socialLinks));
}

// Update social links display
function updateSocialLinksDisplay() {
    // Home page links
    document.getElementById('instagramLink').href = socialLinks.instagram;
    document.getElementById('discordLink').href = socialLinks.discord;
    
    // User portal links
    document.getElementById('userInstagramLink').href = socialLinks.instagram;
    document.getElementById('userDiscordLink').href = socialLinks.discord;
}

// Navigation with smooth transitions
function goToHome() {
    smoothTransition('homePage');
}

function goToAdminLogin() {
    smoothTransition('adminLoginPage');
    document.getElementById('adminPassword').value = '';
}

function goToUserPanel() {
    smoothTransition('userPortalPage');
    displayUserFiles();
}

function switchPage(pageId) {
    // Hide all pages with fade out
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page with fade in
    document.getElementById(pageId).classList.add('active');
}

function smoothTransition(pageId) {
    const currentPage = document.querySelector('.page.active');
    
    // Add fade out effect to current page
    if (currentPage) {
        currentPage.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            switchPage(pageId);
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 300);
    } else {
        switchPage(pageId);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Admin Login
function handleAdminLogin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (password === ADMIN_PASSWORD) {
        errorDiv.classList.remove('show');
        sessionStorage.setItem('adminLoggedIn', 'true');
        smoothTransition('adminPanelPage');
        displayAdminFiles();
        // Load current social links into form
        document.getElementById('instagramUrl').value = socialLinks.instagram;
        document.getElementById('discordUrl').value = socialLinks.discord;
    } else {
        errorDiv.textContent = '❌ Invalid password. Please try again.';
        errorDiv.classList.add('show');
        // Shake animation on error
        document.getElementById('adminPassword').style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.getElementById('adminPassword').style.animation = '';
        }, 500);
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    smoothTransition('homePage');
}

// Update Social Links
function updateSocialLinks() {
    const instagram = document.getElementById('instagramUrl').value.trim();
    const discord = document.getElementById('discordUrl').value.trim();
    const statusDiv = document.getElementById('socialStatus');
    
    if (!instagram || !discord) {
        statusDiv.textContent = '❌ Please fill in all social links';
        statusDiv.classList.remove('success');
        statusDiv.classList.add('error');
        return;
    }
    
    // Basic URL validation
    if (!isValidUrl(instagram) || !isValidUrl(discord)) {
        statusDiv.textContent = '❌ Please enter valid URLs';
        statusDiv.classList.remove('success');
        statusDiv.classList.add('error');
        return;
    }
    
    socialLinks.instagram = instagram;
    socialLinks.discord = discord;
    saveSocialLinks();
    updateSocialLinksDisplay();
    
    statusDiv.textContent = '✅ Social links updated successfully!';
    statusDiv.classList.remove('error');
    statusDiv.classList.add('success');
    
    // Clear message after 3 seconds with smooth fade
    setTimeout(() => {
        statusDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            statusDiv.classList.remove('success');
            statusDiv.style.animation = '';
        }, 300);
    }, 3000);
}

// URL validation
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
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
        
        // Smooth animation
        statusDiv.style.animation = 'slideInSuccess 0.4s ease-out';
    };
    reader.readAsDataURL(file);
}

// Add File Info
function addFileInfo() {
    const fileName = document.getElementById('fileName').value.trim();
    const fileReadme = document.getElementById('fileReadme').value.trim();
    const currentFile = sessionStorage.getItem('currentFile');
    
    if (!currentFile) {
        showAlert('❌ Please upload a file first', 'error');
        return;
    }
    
    if (!fileName || !fileReadme) {
        showAlert('❌ Please fill in all fields', 'error');
        return;
    }
    
    const fileData = JSON.parse(currentFile);
    fileData.displayName = fileName;
    fileData.readme = fileReadme;
    
    files.push(fileData);
    saveFiles();
    
    // Clear form with smooth transition
    const form = document.getElementById('fileInfoForm');
    form.style.animation = 'pulse 0.4s ease-out';
    
    // Clear form
    document.getElementById('fileInfoForm').reset();
    document.getElementById('uploadStatus').textContent = '';
    document.getElementById('uploadStatus').classList.remove('success');
    sessionStorage.removeItem('currentFile');
    document.getElementById('fileInput').value = '';
    
    showAlert('✅ File added successfully!', 'success');
    displayAdminFiles();
}

// Show alert with smooth animation
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-notification ${type}`;
    alertDiv.textContent = message;
    alertDiv.style.animation = 'slideInSuccess 0.3s ease-out';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 3000);
}

// Display Admin Files
function displayAdminFiles() {
    const container = document.getElementById('adminFilesList');
    
    if (files.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No files uploaded yet</div>';
        return;
    }
    
    container.innerHTML = files.map((file, index) => `
        <div class="admin-file-item" style="animation: slideInSuccess ${0.2 + index * 0.1}s ease-out;">
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
    // Custom confirm with smooth animation
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'modal active';
    confirmDiv.style.animation = 'fadeIn 0.3s ease-out';
    confirmDiv.innerHTML = `
        <div class="modal-content" style="animation: slideUp 0.3s ease-out;">
            <div class="modal-header">
                <h2>🗑️ Delete File</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this file? This action cannot be undone.</p>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-primary" style="flex: 1;" onclick="confirmDeleteFile(${id}); this.closest('.modal').remove();">Yes, Delete</button>
                    <button class="btn-back" style="flex: 1;" onclick="this.closest('.modal').remove();">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDiv);
    confirmDiv.addEventListener('click', (e) => {
        if (e.target === confirmDiv) confirmDiv.remove();
    });
}

function confirmDeleteFile(id) {
    files = files.filter(f => f.id !== id);
    saveFiles();
    displayAdminFiles();
    showAlert('✅ File deleted successfully!', 'success');
}

// Display User Files
function displayUserFiles() {
    const container = document.getElementById('userFilesList');
    
    if (files.length === 0) {
        container.innerHTML = '<div class="no-files">📭 No tools or bots available yet. Check back soon!</div>';
        return;
    }
    
    container.innerHTML = files.map((file, index) => `
        <div class="user-file-card" style="animation: slideUp ${0.2 + index * 0.1}s ease-out;">
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
    let visibleCount = 0;
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const content = card.querySelector('.file-readme').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            card.style.display = '';
            card.style.animation = 'slideUp 0.3s ease-out';
            visibleCount++;
        } else {
            card.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                card.style.display = 'none';
            }, 200);
        }
    });
    
    // Show no results message if needed
    if (visibleCount === 0 && searchTerm.length > 0) {
        const container = document.getElementById('userFilesList');
        const noResults = document.createElement('div');
        noResults.className = 'no-files';
        noResults.id = 'noResults';
        noResults.textContent = `🔍 No files found for "${searchTerm}"`;
        noResults.style.animation = 'fadeIn 0.3s ease-out';
        
        if (!document.getElementById('noResults')) {
            container.appendChild(noResults);
        }
    } else {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                noResults.remove();
            }, 200);
        }
    }
}

// View File
function viewFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.animation = 'fadeIn 0.3s ease-out';
    modal.innerHTML = `
        <div class="modal-content" style="animation: slideUp 0.3s ease-out;">
            <div class="modal-header">
                <h2>📄 ${file.displayName}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">${file.readme}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
}

// Download File
function downloadFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    // Add download animation
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    
    // Simulate download with visual feedback
    showAlert(`⬇️ Downloading: ${file.name}`, 'success');
    link.click();
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const input = document.getElementById('adminPassword');
    const button = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
        button.style.animation = 'rotate 0.3s ease-out';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
        button.style.animation = 'rotate 0.3s ease-out';
    }
}

// Add smooth scroll behavior globally
document.addEventListener('scroll', () => {
    // Smooth scroll effect can be added here if needed
}, { passive: true });

// Prevent default alert and use custom animations
window.alert = function(message) {
    showAlert(message, 'info');
};