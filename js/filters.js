// Filter Management Functions
// ===========================

// Function to initialize business search with keyboard navigation
function initializeBusinessSearch() {
    const searchInput = document.getElementById('businessSearch');
    const optionsContainer = document.getElementById('businessOptions');
    
    if (!searchInput || !optionsContainer) return;

    // Clear existing options
    optionsContainer.innerHTML = '';

    // Get unique businesses from transaction data
    const businesses = [...new Set(AppState.transactionData.map(item => extractBusinessName(item.merchant)))].sort();

    // Create "All Businesses" option
    const allOption = document.createElement('div');
    allOption.className = 'option' + (AppState.selectedBusiness === 'all' ? ' selected' : '');
    allOption.dataset.value = 'all';
    allOption.textContent = 'Todos los Negocios';
    allOption.addEventListener('click', () => selectBusiness('all'));
    optionsContainer.appendChild(allOption);

    const sortedBusinesses = businesses.sort();

    // Function to filter businesses
    function filterBusinesses(searchTerm) {
        optionsContainer.innerHTML = '';
        
        const normalizedTerm = searchTerm.toLowerCase();
        const filteredBusinesses = sortedBusinesses.filter(business => 
            business.toLowerCase().includes(normalizedTerm)
        );

        // Always show "All Businesses" option first
        const allOption = document.createElement('div');
        allOption.className = 'option' + (AppState.selectedBusiness === 'all' ? ' selected' : '');
        allOption.dataset.value = 'all';
        allOption.textContent = 'Todos los Negocios';
        allOption.addEventListener('click', () => selectBusiness('all'));

        optionsContainer.appendChild(allOption);

        if (filteredBusinesses.length > 0) {
            filteredBusinesses.forEach(business => {
                const option = document.createElement('div');
                option.className = 'option' + (AppState.selectedBusiness === business ? ' selected' : '');
                option.dataset.value = business;
                option.textContent = business;
                option.addEventListener('click', () => selectBusiness(business));
                optionsContainer.appendChild(option);
            });
        } else if (searchTerm) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No matching businesses found';
            optionsContainer.appendChild(noResults);
        }

        optionsContainer.classList.add('show');
    }

    // Function to handle business selection
    function selectBusiness(business) {
        AppState.selectedBusiness = business;
        searchInput.value = business === 'all' ? '' : business;
        optionsContainer.classList.remove('show');

        // Update UI
        document.querySelectorAll('#businessOptions .option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === business);
        });
        
        // Remove notification if it exists
        const notification = document.getElementById('select-business-notification');
        if (notification) {
            notification.remove();
        }

        // Update location filter and refresh dashboard
        updateLocationFilter();
        filterAndUpdateDashboard();
    }

    // Keyboard navigation variables
    let selectedIndex = -1;
    
    function getVisibleOptions() {
        return Array.from(optionsContainer.querySelectorAll('.option')).filter(option => 
            option.style.display !== 'none'
        );
    }
    
    function updateSelection() {
        const visibleOptions = getVisibleOptions();
        visibleOptions.forEach((option, index) => {
            option.classList.toggle('keyboard-selected', index === selectedIndex);
        });
    }

    // Add event listeners
    searchInput.addEventListener('input', (e) => {
        selectedIndex = -1;
        filterBusinesses(e.target.value);
        updateSelection();
    });

    searchInput.addEventListener('focus', () => {
        selectedIndex = -1;
        filterBusinesses(searchInput.value);
        updateSelection();
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!optionsContainer.classList.contains('show')) return;
        
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
                    const selectedOption = visibleOptions[selectedIndex];
                    const businessValue = selectedOption.dataset.value;
                    selectBusiness(businessValue);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                optionsContainer.classList.remove('show');
                selectedIndex = -1;
                break;
        }
    });

    // Close options when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !optionsContainer.contains(e.target)) {
            optionsContainer.classList.remove('show');
            selectedIndex = -1;
        }
    });

    // Initialize with empty search
    filterBusinesses('');
}

// Function to initialize searchable select with keyboard navigation
function initializeSearchableSelect(searchInput, optionsContainer, options, onSelect) {
    const input = document.getElementById(searchInput);
    const container = document.getElementById(optionsContainer);

    // Clear existing options
    container.innerHTML = '';

    // Keyboard navigation variables
    let selectedIndex = -1;
    
    function getVisibleOptions() {
        return Array.from(container.querySelectorAll('.option')).filter(option => 
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
        const allOptions = container.querySelectorAll('.option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const value = option.dataset.value;
        input.value = value === 'all' ? '' : option.textContent;
        container.classList.remove('show');
        selectedIndex = -1;
        onSelect(value);
    }

    // Add "All" option
    const allOption = document.createElement('div');
    allOption.className = 'option selected';
    allOption.textContent = 'Todos los Negocios';
    allOption.dataset.value = 'all';
    container.appendChild(allOption);

    // Add input event listener for search
    input.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const allOptions = container.querySelectorAll('.option');

        allOptions.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (text === 'todos los negocios' || text.includes(searchTerm)) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });

        container.classList.add('show');
        selectedIndex = -1;
        updateSelection();
    });

    // Show options on input focus
    input.addEventListener('focus', function () {
        container.classList.add('show');
        selectedIndex = -1;
        updateSelection();
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
        if (!container.classList.contains('show')) return;
        
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
                container.classList.remove('show');
                selectedIndex = -1;
                break;
        }
    });

    // Handle click on "All" option
    allOption.addEventListener('click', function () {
        selectOption(allOption);
    });

    // Add business options
    options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = option;
        div.dataset.value = option;

        div.addEventListener('click', () => {
            selectOption(div);
        });

        container.appendChild(div);
    });

    // Close options when clicking outside
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.classList.remove('show');
            selectedIndex = -1;
        }
    });
}

// Function to update business filter options
function updateBusinessFilter() {
    if (AppState.transactionData.length === 0) return;
    
    const businesses = [...new Set(AppState.transactionData.map(item => extractBusinessName(item.merchant)))];
    const businessSelect = document.getElementById('businessSearch');
    
    if (businessSelect) {
        // This will be handled by initializeBusinessSearch
    }
}

// Function to update location filter options
function updateLocationFilter() {
    let locations = [];
    
    if (AppState.selectedBusiness !== 'all') {
        // Filter locations based on selected business
        const businessData = AppState.transactionData.filter(item => 
            extractBusinessName(item.merchant) === AppState.selectedBusiness
        );
        locations = [...new Set(businessData.map(item => extractLocation(item.merchant)))];
    } else {
        // Show all locations if no business is selected
        locations = [...new Set(AppState.transactionData.map(item => extractLocation(item.merchant)))];
    }
    
    const locationSelect = document.getElementById('locationSearch');
    if (locationSelect) {
        // Initialize searchable select for locations
        initializeSearchableSelect(
            'locationSearch',
            'locationOptions', 
            locations.sort(),
            (selected) => {
                AppState.selectedLocation = selected;
                filterAndUpdateDashboard();
            }
        );
        
        // Update the "All" option text for locations
        const allOption = document.querySelector('#locationOptions .option[data-value="all"]');
        if (allOption) {
            allOption.textContent = 'Todas las Ubicaciones';
        }
    }
}

// Function to clear dashboard data
function clearDashboardData() {
    // Check if we're on the correct page before clearing dashboard data
    if (!document.getElementById('businessSearch') || !document.getElementById('uniqueUsers')) {
        console.log('ClearDashboardData: Not on the main analytics page, skipping data clearing');
        return;
    }
    
    // Clear metrics safely
    safeSetText('uniqueUsers', '0');
    safeSetText('uniqueUsersPrev', '0');
    safeSetText('returningUsers', '0');
    safeSetText('returningUsersPrev', '0');
    safeSetText('totalAmount', '$0');
    safeSetText('totalAmountPrev', '$0');
    safeSetText('avgVisits', '0');
    safeSetText('avgVisitsPrev', '0');
    
    // Clear comparison displays safely
    safeSetText('usersComparison', '-');
    safeSetText('returningUsersComparison', '-');
    safeSetText('amountComparison', '-');
    safeSetText('avgVisitsComparison', '-');
    
    // Reset comparison classes safely
    safeSetClass('usersComparison', 'comparison-value');
    safeSetClass('returningUsersComparison', 'comparison-value');
    safeSetClass('amountComparison', 'comparison-value');
    safeSetClass('avgVisitsComparison', 'comparison-value');
    
    // Clear single period metrics safely
    safeSetText('currentUniqueUsers', '0');
    safeSetText('currentTotalAmount', '$0');
    safeSetText('currentAvgVisits', '0');
    safeSetText('currentAvgTicket', '$0');
}
