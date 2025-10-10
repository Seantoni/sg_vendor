// UI Components
// =============
// Contains all UI-related functionality: sidebar, filters, modals

// Configurar funcionalidad de cierre de sesión
function initializeLogout() {
    const userDisplayName = sessionStorage.getItem('userDisplayName') || 'Usuario';
    document.getElementById('welcomeUser').textContent = userDisplayName;
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// Sidebar Navigation Functionality
class SidebarNavigation {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.collapseBtn = document.getElementById('sidebarCollapseBtn');
        this.menuItems = document.querySelectorAll('.sidebar-menu-item');
        this.sections = document.querySelectorAll('.dashboard-section');
        this.isCollapsed = false;
        
        this.init();
    }
    
    init() {
        // Set initial active section
        this.showSection('overview');
        
        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Sidebar collapse toggle
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }
        
        // Overlay click to close sidebar
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }
        
        // Menu item clicks
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
                
                // Close sidebar on mobile after selection
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeSidebar();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        if (this.sidebar.classList.contains('open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        this.sidebar.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            this.sidebar.classList.add('collapsed');
            this.collapseBtn.classList.add('collapsed');
            this.collapseBtn.title = 'Mostrar sidebar';
        } else {
            this.sidebar.classList.remove('collapsed');
            this.collapseBtn.classList.remove('collapsed');
            this.collapseBtn.title = 'Ocultar sidebar';
        }
    }
    
    showSection(sectionName) {
        console.log('🎯 Switching to section:', sectionName);
        
        // Remove active class from all sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to target sections
        this.sections.forEach(section => {
            if (section.getAttribute('data-section') === sectionName) {
                section.classList.add('active');
                console.log('✅ Activated section:', section.id);
            }
        });
        
        // Update menu items
        this.menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
                console.log('✅ Activated menu item:', item.textContent.trim());
            }
        });
        
        // Initialize section-specific functionality
        if (sectionName === 'locations') {
            // Location charts are already initialized with filtered data via updateCharts()
            // No need to re-initialize here
        }
    }
}

// Global function to update filter summary
function updateFilterSummary() {
    const summaryText = document.getElementById('filterSummaryText');
    if (!summaryText) return;
    
    // Get values from main page filters
    const businessSearch = document.getElementById('businessSearch');
    const locationSearch = document.getElementById('locationSearch');
    const quickDateFilter = document.getElementById('quickDateFilter');
    const currentDateRange = document.getElementById('currentDateRange');
    const previousDateRange = document.getElementById('previousDateRange');
    
    const filters = [];
    
    // Don't include business name since it's already displayed separately
    if (locationSearch && locationSearch.value && locationSearch.value !== 'Todas las Ubicaciones') {
        filters.push(`📍 ${locationSearch.value}`);
    }
    
    if (quickDateFilter && quickDateFilter.value) {
        // Format quick date filter options for better readability
        const quickValue = quickDateFilter.value;
        const quickFormatted = quickValue === 'historico' ? '📅 Histórico' :
                             quickValue === '30' ? '📅 30 días' :
                             quickValue === '90' ? '📅 90 días' :
                             quickValue === '120' ? '📅 120 días' :
                             quickValue === '180' ? '📅 180 días' :
                             quickValue === '360' ? '📅 360 días' :
                             `📅 ${quickValue}`;
        filters.push(quickFormatted);
    }
    
    if (currentDateRange && currentDateRange.value) {
        // Clean up date range display
        const dateRange = currentDateRange.value.replace(/\(\d+ days?\)/, '').trim();
        filters.push(`📆 ${dateRange}`);
    }
    
    if (previousDateRange && previousDateRange.value) {
        const prevDateRange = previousDateRange.value.replace(/\(\d+ days?\)/, '').trim();
        filters.push(`📆 Anterior: ${prevDateRange}`);
    }
    
    if (filters.length > 0) {
        summaryText.textContent = filters.join(' · ');
    } else {
        summaryText.textContent = '';
    }
}

// Initialize main page filter summary functionality
function initializeMainPageFilterSummary() {
    // Add event listeners to update summary when main page filters change
    const businessSearch = document.getElementById('businessSearch');
    const locationSearch = document.getElementById('locationSearch');
    const quickDateFilter = document.getElementById('quickDateFilter');
    const currentDateRange = document.getElementById('currentDateRange');
    const previousDateRange = document.getElementById('previousDateRange');
    
    if (businessSearch) businessSearch.addEventListener('input', updateFilterSummary);
    if (locationSearch) locationSearch.addEventListener('input', updateFilterSummary);
    if (quickDateFilter) quickDateFilter.addEventListener('change', updateFilterSummary);
    if (currentDateRange) currentDateRange.addEventListener('change', updateFilterSummary);
    if (previousDateRange) previousDateRange.addEventListener('change', updateFilterSummary);
    
    // Initial update
    setTimeout(updateFilterSummary, 1000);
    
    // Also update summary when dashboard filters change
    const originalUpdateDashboard = window.updateDashboard;
    if (originalUpdateDashboard) {
        window.updateDashboard = function() {
            originalUpdateDashboard.apply(this, arguments);
            setTimeout(updateFilterSummary, 100);
        };
    }
}

// Collapsible Filters Functionality
function initializeCollapsibleFilters() {
    const compactDisplay = document.getElementById('compactBusinessDisplay');
    const filtersContainer = document.getElementById('filtersContainer');
    const expandBtn = document.getElementById('expandFiltersBtn');
    const businessNameDisplay = document.getElementById('compactBusinessName');
    const businessSearch = document.getElementById('businessSearch');
    
    let isExpanded = false;
    
    // Ensure filters are collapsed by default
    if (filtersContainer) {
        filtersContainer.classList.remove('expanded');
    }
    if (expandBtn) {
        expandBtn.classList.remove('expanded');
    }
    let startY = 0;
    let isDragging = false;

    // Toggle function
    function toggleFilters() {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            filtersContainer.classList.add('expanded');
            expandBtn.classList.add('expanded');
        } else {
            filtersContainer.classList.remove('expanded');
            expandBtn.classList.remove('expanded');
        }
    }

    // Update business name display
    function updateBusinessDisplay() {
        // Get the actual selected business from the search input or selected option
        const businessSearchInput = document.getElementById('businessSearch');
        const selectedOption = document.querySelector('#businessOptions .option.selected');
        
        let displayText = 'Todos los Negocios';
        
        // Priority 1: Check if there's a value in the search input (user typed/selected)
        if (businessSearchInput && businessSearchInput.value.trim()) {
            displayText = businessSearchInput.value.trim();
        }
        // Priority 2: Check selected option
        else if (selectedOption && selectedOption.textContent !== 'Todos los Negocios') {
            displayText = selectedOption.textContent;
        }
        // Priority 3: Check if a specific business was selected programmatically
        else if (window.selectedBusiness && window.selectedBusiness !== 'all') {
            displayText = window.selectedBusiness;
        }
        
        businessNameDisplay.textContent = displayText;
    }

    // Click to toggle
    compactDisplay.addEventListener('click', toggleFilters);

    // Touch/drag support
    compactDisplay.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isDragging = false;
    }, { passive: true });

    compactDisplay.addEventListener('touchmove', function(e) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        if (Math.abs(deltaY) > 10) {
            isDragging = true;
            
            if (deltaY > 30 && !isExpanded) {
                toggleFilters();
            } else if (deltaY < -30 && isExpanded) {
                toggleFilters();
            }
        }
    }, { passive: true });

    compactDisplay.addEventListener('touchend', function() {
        if (!isDragging) {
            // If not dragging, treat as click
            toggleFilters();
        }
        isDragging = false;
    });

    // Listen for business selection changes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option') && e.target.closest('#businessOptions')) {
            setTimeout(updateBusinessDisplay, 100);
        }
    });

    // Listen for input changes in business search
    const businessSearchInput = document.getElementById('businessSearch');
    if (businessSearchInput) {
        businessSearchInput.addEventListener('input', function() {
            setTimeout(updateBusinessDisplay, 100);
        });
        
        businessSearchInput.addEventListener('change', function() {
            setTimeout(updateBusinessDisplay, 100);
        });
    }

    // Watch for changes in selectedBusiness global variable (from script.js)
    let lastSelectedBusiness = window.selectedBusiness;
    setInterval(function() {
        if (window.selectedBusiness !== lastSelectedBusiness) {
            lastSelectedBusiness = window.selectedBusiness;
            updateBusinessDisplay();
        }
    }, 500);

    // Initialize display with a slight delay to ensure other scripts have loaded
    setTimeout(updateBusinessDisplay, 200);
    
    // Make updateBusinessDisplay available globally
    window.updateBusinessDisplay = updateBusinessDisplay;
}

// Filter Modal Wizard Functionality
function initializeFilterModal() {
    const modal = document.getElementById('filterModal');
    const nextBtn = document.getElementById('modalNextBtn');
    const prevBtn = document.getElementById('modalPrevBtn');
    const doneBtn = document.getElementById('modalDoneBtn');
    // Skip button removed from modal
    const overlay = modal.querySelector('.modal-overlay');
    
    let currentStep = 1;
    const totalSteps = 3;
    
    // Modal will be shown via keyboard shortcut (Cmd/Ctrl+K) or manually
    // showModal(); // Removed automatic modal on page load
    
    // Next button click
    nextBtn.addEventListener('click', function() {
        if (currentStep < totalSteps) {
            currentStep++;
            updateWizardStep();
        }
    });
    
    // Previous button click
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateWizardStep();
        }
    });
    
    // Done button click
    doneBtn.addEventListener('click', function() {
        if (canCloseModal()) {
            applyModalFilters();
            forceHideModal();
            resetWizard();
        } else {
            showValidationMessage();
        }
    });
    
    // Skip button removed - users must select a business to continue
    
    // Step apply buttons
    document.getElementById('applyStep1').addEventListener('click', function() {
        if (canCloseModal()) {
            applyModalFilters();
            forceHideModal();
            resetWizard();
        } else {
            showValidationMessage();
        }
    });
    
    document.getElementById('applyStep2').addEventListener('click', function() {
        if (canCloseModal()) {
            applyModalFilters();
            forceHideModal();
            resetWizard();
        } else {
            showValidationMessage();
        }
    });
    
    // Close modal on overlay click
    overlay.addEventListener('click', function() {
        hideModal();
    });
    
    // Close modal on Escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
    
    // Open modal with keyboard shortcut (Cmd+K on Mac, Ctrl+K on others)
    document.addEventListener('keydown', function(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isShortcut = isMac ? (e.metaKey && e.key === 'k') : (e.ctrlKey && e.key === 'k');
        
        if (isShortcut) {
            e.preventDefault(); // Prevent browser default behavior
            if (modal.classList.contains('hidden')) {
                showModal();
            }
        }
    });
    
    // Setup modal option handlers
    setupModalHandlers();
    
    // Initialize modal date pickers
    initializeModalDatePickers();
    
    // Initialize filter summary functionality
    initializeFilterSummary();
    
    function showModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Populate modal with available options - try immediately and with delays
        populateModalOptions();
        setTimeout(populateModalOptions, 1000);
        setTimeout(populateModalOptions, 2000);
        
        // Auto-focus on business search field
        setTimeout(() => {
            const businessSearch = document.getElementById('modalBusinessSearch');
            if (businessSearch) {
                businessSearch.focus();
                businessSearch.select(); // Select any existing text
            }
        }, 100);
    }
    
    function canCloseModal() {
        // Check if a business is selected in the modal (not 'all' and not empty)
        const modalBusinessSearch = document.getElementById('modalBusinessSearch');
        const modalBusinessValue = modalBusinessSearch ? modalBusinessSearch.value.trim() : '';
        
        // Check if a specific business is selected in the modal
        if (!modalBusinessValue || modalBusinessValue === 'Todos los Negocios' || modalBusinessValue === '') {
            return false;
        }
        
        return true;
    }
    
    function showValidationMessage() {
        // Create or show validation message
        let validationMsg = document.getElementById('modal-validation-message');
        if (!validationMsg) {
            validationMsg = document.createElement('div');
            validationMsg.id = 'modal-validation-message';
            validationMsg.className = 'modal-validation-message';
            validationMsg.innerHTML = `
                <div class="validation-content">
                    <span class="validation-icon">⚠️</span>
                    <span class="validation-text">Debes seleccionar un negocio antes de continuar</span>
                </div>
            `;
            
            const modalBody = document.querySelector('.filter-modal .modal-body');
            if (modalBody) {
                modalBody.insertBefore(validationMsg, modalBody.firstChild);
            }
        }
        
        validationMsg.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (validationMsg) {
                validationMsg.style.display = 'none';
            }
        }, 3000);
    }
    
    function forceHideModal() {
        // Close modal without validation (used for skip button)
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Fold the compact business display when modal closes
        const filtersContainer = document.getElementById('filtersContainer');
        const expandBtn = document.getElementById('expandFiltersBtn');
        
        if (filtersContainer && expandBtn) {
            filtersContainer.classList.remove('expanded');
            expandBtn.classList.remove('expanded');
        }
    }
    
    function hideModal() {
        // Check if modal can be closed
        if (!canCloseModal()) {
            showValidationMessage();
            return false;
        }
        
        forceHideModal();
        return true;
    }
    
    function updateWizardStep() {
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update wizard steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            step.classList.toggle('active', stepNumber === currentStep);
        });
        
        // Update button visibility
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
        doneBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
        
        // Auto-focus on current step's input field
        setTimeout(() => {
            if (currentStep === 1) {
                const businessSearch = document.getElementById('modalBusinessSearch');
                if (businessSearch) {
                    businessSearch.focus();
                    businessSearch.select();
                }
            } else if (currentStep === 2) {
                const locationSearch = document.getElementById('modalLocationSearch');
                if (locationSearch) {
                    locationSearch.focus();
                    locationSearch.select();
                }
            }
        }, 100);
    }
    
    function resetWizard() {
        currentStep = 1;
        updateWizardStep();
    }
    
    function populateModalOptions() {
        // Wait for data to be loaded and try multiple times
        let attempts = 0;
        const maxAttempts = 20;
        
        function tryPopulate() {
            attempts++;
            
            // Copy business options from main filter
            const mainBusinessOptions = document.getElementById('businessOptions');
            const modalBusinessOptions = document.getElementById('modalBusinessOptions');
            
            if (mainBusinessOptions && modalBusinessOptions && mainBusinessOptions.children.length > 1) {
                modalBusinessOptions.innerHTML = mainBusinessOptions.innerHTML;
                setupBusinessOptionHandlers();
                
                // Copy location options from main filter
                const mainLocationOptions = document.getElementById('locationOptions');
                const modalLocationOptions = document.getElementById('modalLocationOptions');
                
                if (mainLocationOptions && modalLocationOptions) {
                    modalLocationOptions.innerHTML = mainLocationOptions.innerHTML;
                    setupLocationOptionHandlers();
                }
                
                console.log('Modal options populated successfully');
                return;
            }
            
            // If data not ready and haven't exceeded max attempts, try again
            if (attempts < maxAttempts) {
                setTimeout(tryPopulate, 500);
            } else {
                console.warn('Could not populate modal options after', maxAttempts, 'attempts');
                // Fallback: Add basic options
                if (modalBusinessOptions) {
                    modalBusinessOptions.innerHTML = `
                        <div class="option selected" data-value="all">Todos los Negocios</div>
                    `;
                    setupBusinessOptionHandlers();
                }
            }
        }
        
        tryPopulate();
    }
    
    function setupModalHandlers() {
        // Business search input handler with keyboard navigation
        const modalBusinessSearch = document.getElementById('modalBusinessSearch');
        const modalBusinessOptions = document.getElementById('modalBusinessOptions');
        
        if (modalBusinessSearch) {
            let selectedIndex = -1;
            
            function getVisibleOptions() {
                return Array.from(modalBusinessOptions.querySelectorAll('.option')).filter(option => 
                    option.style.display !== 'none'
                );
            }
            
            function updateSelection() {
                const visibleOptions = getVisibleOptions();
                visibleOptions.forEach((option, index) => {
                    option.classList.toggle('keyboard-selected', index === selectedIndex);
                });
            }
            
            function selectOption(option) {
                // Use data-value for the actual business name, or fallback to textContent
                const businessName = option.dataset.value || option.textContent;
                modalBusinessSearch.value = businessName;
                modalBusinessOptions.classList.remove('show');
                selectedIndex = -1;
                
                // Update selected state
                modalBusinessOptions.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Trigger change event
                modalBusinessSearch.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            modalBusinessSearch.addEventListener('click', function() {
                modalBusinessOptions.classList.add('show');
                selectedIndex = -1;
                updateSelection();
                // Re-populate in case data loaded late
                setTimeout(populateModalOptions, 100);
            });
            
            modalBusinessSearch.addEventListener('focus', function() {
                modalBusinessOptions.classList.add('show');
                selectedIndex = -1;
                updateSelection();
                setTimeout(populateModalOptions, 100);
            });
            
            modalBusinessSearch.addEventListener('input', function() {
                modalBusinessOptions.classList.add('show');
                selectedIndex = -1;
                filterModalOptions('modalBusinessOptions', this.value);
                updateSelection();
            });
            
            // Keyboard navigation for business search
            modalBusinessSearch.addEventListener('keydown', function(e) {
                if (!modalBusinessOptions.classList.contains('show')) return;
                
                const visibleOptions = getVisibleOptions();
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        selectedIndex = Math.min(selectedIndex + 1, visibleOptions.length - 1);
                        updateSelection();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        selectedIndex = Math.max(selectedIndex - 1, -1);
                        updateSelection();
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (selectedIndex >= 0 && selectedIndex < visibleOptions.length) {
                            selectOption(visibleOptions[selectedIndex]);
                        }
                        break;
                        
                    case 'Escape':
                        e.preventDefault();
                        modalBusinessOptions.classList.remove('show');
                        selectedIndex = -1;
                        break;
                }
            });
            
            // Handle option clicks for business
            modalBusinessOptions.addEventListener('click', function(e) {
                if (e.target.classList.contains('option')) {
                    selectOption(e.target);
                }
            });
        }
        
        // Location search input handler with keyboard navigation
        const modalLocationSearch = document.getElementById('modalLocationSearch');
        const modalLocationOptions = document.getElementById('modalLocationOptions');
        
        if (modalLocationSearch) {
            let selectedLocationIndex = -1;
            
            function getVisibleLocationOptions() {
                return Array.from(modalLocationOptions.querySelectorAll('.option')).filter(option => 
                    option.style.display !== 'none'
                );
            }
            
            function updateLocationSelection() {
                const visibleOptions = getVisibleLocationOptions();
                visibleOptions.forEach((option, index) => {
                    option.classList.toggle('keyboard-selected', index === selectedLocationIndex);
                });
            }
            
            function selectLocationOption(option) {
                modalLocationSearch.value = option.textContent;
                modalLocationOptions.classList.remove('show');
                selectedLocationIndex = -1;
                
                // Update selected state
                modalLocationOptions.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Trigger change event
                modalLocationSearch.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            modalLocationSearch.addEventListener('click', function() {
                modalLocationOptions.classList.add('show');
                selectedLocationIndex = -1;
                updateLocationSelection();
            });
            
            modalLocationSearch.addEventListener('focus', function() {
                modalLocationOptions.classList.add('show');
                selectedLocationIndex = -1;
                updateLocationSelection();
            });
            
            modalLocationSearch.addEventListener('input', function() {
                modalLocationOptions.classList.add('show');
                selectedLocationIndex = -1;
                filterModalOptions('modalLocationOptions', this.value);
                updateLocationSelection();
            });
            
            // Keyboard navigation for location search
            modalLocationSearch.addEventListener('keydown', function(e) {
                if (!modalLocationOptions.classList.contains('show')) return;
                
                const visibleOptions = getVisibleLocationOptions();
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        selectedLocationIndex = Math.min(selectedLocationIndex + 1, visibleOptions.length - 1);
                        updateLocationSelection();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        selectedLocationIndex = Math.max(selectedLocationIndex - 1, -1);
                        updateLocationSelection();
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (selectedLocationIndex >= 0 && selectedLocationIndex < visibleOptions.length) {
                            selectLocationOption(visibleOptions[selectedLocationIndex]);
                        }
                        break;
                        
                    case 'Escape':
                        e.preventDefault();
                        modalLocationOptions.classList.remove('show');
                        selectedLocationIndex = -1;
                        break;
                }
            });
            
            // Handle option clicks for location
            modalLocationOptions.addEventListener('click', function(e) {
                if (e.target.classList.contains('option')) {
                    selectLocationOption(e.target);
                }
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.select-search-container')) {
                modalBusinessOptions?.classList.remove('show');
                modalLocationOptions?.classList.remove('show');
            }
        });
    }
    
    function setupBusinessOptionHandlers() {
        const options = document.querySelectorAll('#modalBusinessOptions .option');
        const searchInput = document.getElementById('modalBusinessSearch');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Use data-value for the actual business name, or fallback to textContent
                const businessName = this.dataset.value || this.textContent;
                searchInput.value = businessName;
                
                document.getElementById('modalBusinessOptions').classList.remove('show');
            });
        });
    }
    
    function setupLocationOptionHandlers() {
        const options = document.querySelectorAll('#modalLocationOptions .option');
        const searchInput = document.getElementById('modalLocationSearch');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                searchInput.value = this.textContent;
                document.getElementById('modalLocationOptions').classList.remove('show');
            });
        });
    }
    
    function filterModalOptions(optionsId, searchTerm) {
        const options = document.querySelectorAll(`#${optionsId} .option`);
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase()) || searchTerm === '') {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    }
    
    function applyModalFilters() {
        // Track if a specific business was selected
        let specificBusinessSelected = false;
        
        // Transfer business selection with business group logic
        const modalBusinessSearch = document.getElementById('modalBusinessSearch');
        const mainBusinessSearch = document.getElementById('businessSearch');
        if (modalBusinessSearch.value && mainBusinessSearch) {
            let selectedBusinessName = modalBusinessSearch.value;
            
            // If not 'all', find the primary business name from the group
            if (selectedBusinessName !== 'Todos los Negocios' && selectedBusinessName !== '') {
                specificBusinessSelected = true;
                
                // Use the same business group logic as the main filter
                if (window.businessGroups) {
                    const group = window.businessGroups.find(g => g.all.includes(selectedBusinessName));
                    if (group) {
                        selectedBusinessName = group.primary; // Use the clean primary name
                    }
                }
                
                // Set the primary business name
                AppState.selectedBusiness = selectedBusinessName;
                mainBusinessSearch.value = selectedBusinessName;
            } else {
                AppState.selectedBusiness = 'all';
                mainBusinessSearch.value = '';
            }
            
            mainBusinessSearch.dispatchEvent(new Event('change'));
        }
        
        // Transfer location selection
        const modalLocationSearch = document.getElementById('modalLocationSearch');
        const mainLocationSearch = document.getElementById('locationSearch');
        if (modalLocationSearch.value && mainLocationSearch) {
            mainLocationSearch.value = modalLocationSearch.value;
            mainLocationSearch.dispatchEvent(new Event('change'));
        }
        
        // Transfer quick date filter
        const modalQuickFilter = document.getElementById('modalQuickDateFilter');
        const mainQuickFilter = document.getElementById('quickDateFilter');
        if (modalQuickFilter.value && mainQuickFilter) {
            mainQuickFilter.value = modalQuickFilter.value;
            mainQuickFilter.dispatchEvent(new Event('change'));
        }
        
        // Transfer date ranges
        const modalCurrentDate = document.getElementById('modalCurrentDateRange');
        const mainCurrentDate = document.getElementById('currentDateRange');
        if (modalCurrentDate.value && mainCurrentDate) {
            mainCurrentDate.value = modalCurrentDate.value;
        }
        
        const modalPreviousDate = document.getElementById('modalPreviousDateRange');
        const mainPreviousDate = document.getElementById('previousDateRange');
        if (modalPreviousDate.value && mainPreviousDate) {
            mainPreviousDate.value = modalPreviousDate.value;
        }
        
        // Auto-expand the filters panel to show applied filters
        const filtersContainer = document.getElementById('filtersContainer');
        const expandBtn = document.getElementById('expandFiltersBtn');
        if (filtersContainer && expandBtn) {
            filtersContainer.classList.add('expanded');
            expandBtn.classList.add('expanded');
        }
        
        // Update filter summary immediately after transferring modal values
        if (typeof updateFilterSummary === 'function') {
            updateFilterSummary();
        }
        
        // Update business display in compact view
        setTimeout(() => {
            const updateBusinessDisplay = window.updateBusinessDisplay;
            if (typeof updateBusinessDisplay === 'function') {
                updateBusinessDisplay();
            }
            
            // Update filter summary after modal filters are applied
            if (typeof updateFilterSummary === 'function') {
                updateFilterSummary();
            }
            
            // Open full analysis modal if a specific business was selected
            if (specificBusinessSelected && typeof window.openFullAnalysisModal === 'function') {
                setTimeout(() => {
                    window.openFullAnalysisModal();
                }, 500);
            }
        }, 300);
    }
    
    function initializeModalDatePickers() {
        // Helper function for calculating days between dates
        function getDaysBetween(date1, date2) {
            const oneDay = 24 * 60 * 60 * 1000;
            return Math.round(Math.abs((date2 - date1) / oneDay)) + 1;
        }
        
        // Initialize modal previous period date picker first (read-only)
        const modalPreviousDatePicker = flatpickr("#modalPreviousDateRange", {
            mode: "range",
            dateFormat: "M j, Y",
            defaultDate: null,
            clickOpens: false // Make it read-only
        });
        
        // Initialize modal current period date picker
        const modalCurrentDatePicker = flatpickr("#modalCurrentDateRange", {
            mode: "range",
            dateFormat: "M j, Y",
            defaultDate: null,
            onChange: function (selectedDates) {
                if (selectedDates.length === 2) {
                    const days = getDaysBetween(selectedDates[0], selectedDates[1]);
                    const input = document.querySelector('#modalCurrentDateRange');
                    if (input) {
                        input.value = `${selectedDates[0].toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })} to ${selectedDates[1].toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })} (${days} days)`;
                    }

                    // Automatically set previous period based on current selection
                    const periodLength = selectedDates[1] - selectedDates[0];
                    const previousEnd = new Date(selectedDates[0]);
                    previousEnd.setDate(previousEnd.getDate() - 1); // Day before current start
                    const previousStart = new Date(previousEnd);
                    previousStart.setTime(previousEnd.getTime() - periodLength);

                    const previousDays = getDaysBetween(previousStart, previousEnd);
                    modalPreviousDatePicker.setDate([previousStart, previousEnd]);
                    const previousInput = document.querySelector('#modalPreviousDateRange');
                    if (previousInput) {
                        previousInput.value = `${previousStart.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })} to ${previousEnd.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })} (${previousDays} days)`;
                    }
                }
            }
        });
    }
    
    function initializeFilterSummary() {
        // Add event listeners to update summary when filters change
        const modalBusinessSearch = document.getElementById('modalBusinessSearch');
        const modalLocationSearch = document.getElementById('modalLocationSearch');
        const modalQuickDateFilter = document.getElementById('modalQuickDateFilter');
        const modalCurrentDateRange = document.getElementById('modalCurrentDateRange');
        const modalPreviousDateRange = document.getElementById('modalPreviousDateRange');
        
        if (modalBusinessSearch) modalBusinessSearch.addEventListener('input', updateFilterSummary);
        if (modalLocationSearch) modalLocationSearch.addEventListener('input', updateFilterSummary);
        if (modalQuickDateFilter) modalQuickDateFilter.addEventListener('change', updateFilterSummary);
        if (modalCurrentDateRange) modalCurrentDateRange.addEventListener('change', updateFilterSummary);
        if (modalPreviousDateRange) modalPreviousDateRange.addEventListener('change', updateFilterSummary);
        
        // Set default 90-day filter for modal
        if (modalQuickDateFilter) {
            modalQuickDateFilter.value = '90';
        }
        
        // Initial update
        setTimeout(updateFilterSummary, 500);
    }
    
    // Make showModal globally available
    window.showFilterModal = showModal;
}

// Initialize all UI components after DOM is loaded and other scripts
function initializeUIComponents() {
    // Initialize logout functionality
    initializeLogout();
    
    // Wait for other scripts to initialize first
    setTimeout(() => {
        new SidebarNavigation();
        initializeCollapsibleFilters();
        initializeFilterModal();
        
        // Initialize filter summary for main page
        initializeMainPageFilterSummary();
    }, 100);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUIComponents);

// Make functions available globally
window.updateFilterSummary = updateFilterSummary;
window.initializeMainPageFilterSummary = initializeMainPageFilterSummary;
window.initializeCollapsibleFilters = initializeCollapsibleFilters;
window.initializeFilterModal = initializeFilterModal;
