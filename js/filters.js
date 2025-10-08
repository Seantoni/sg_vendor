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
    
    // Group similar businesses together
    const businessGroups = groupSimilarBusinesses(businesses);
    
    // Store globally for use in data processing
    window.businessGroups = businessGroups;

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
        const filteredBusinesses = businessGroups
            .map(group => group.primary) // Only show the primary business from each group
            .filter(business => {
                const group = businessGroups.find(g => g.primary === business);
                // Check if search term matches the primary business or any of its variants
                return business.toLowerCase().includes(normalizedTerm) ||
                       (group && group.variants.some(variant => variant.toLowerCase().includes(normalizedTerm)));
            });

        // Always show "All Businesses" option first
        const allOption = document.createElement('div');
        allOption.className = 'option' + (AppState.selectedBusiness === 'all' ? ' selected' : '');
        allOption.dataset.value = 'all';
        allOption.textContent = 'Todos los Negocios';
        allOption.addEventListener('click', () => selectBusiness('all'));

        optionsContainer.appendChild(allOption);

        if (filteredBusinesses.length > 0) {
            filteredBusinesses.forEach(business => {
                // Check if this business has variants (similar names)
                const group = businessGroups.find(g => g.all.includes(business));
                
                const option = document.createElement('div');
                option.className = 'option' + (AppState.selectedBusiness === business ? ' selected' : '');
                option.dataset.value = business;
                
                if (group && group.variants.length > 0) {
                    // Always show the primary (clean) business name
                    const displayName = group.primary;
                    option.innerHTML = `
                        <div style="font-weight: 500; color: #2d3436;">${displayName}</div>
                        <div style="font-size: 11px; color: #636e72; margin-top: 2px;">
                            También incluye: ${group.variants.slice(0, 2).join(', ')}${group.variants.length > 2 ? '...' : ''}
                        </div>
                    `;
                    // Store the actual business name for click handling
                    option.dataset.actualValue = business;
                } else {
                    option.textContent = business;
                }
                
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
        // Find the primary business name from the group (cleanest version)
        let selectedBusinessName = business;
        if (business !== 'all') {
            const group = businessGroups.find(g => g.all.includes(business));
            if (group) {
                selectedBusinessName = group.primary; // Use the clean primary name
            }
        }
        
        AppState.selectedBusiness = selectedBusinessName;
        searchInput.value = selectedBusinessName === 'all' ? '' : selectedBusinessName;
        optionsContainer.classList.remove('show');

        // Update UI - highlight the primary business option
        document.querySelectorAll('#businessOptions .option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === selectedBusinessName);
        });
        
        // Remove notification if it exists
        const notification = document.getElementById('select-business-notification');
        if (notification) {
            notification.remove();
        }

        // Show notification if similar businesses exist for the selected business
        showSimilarBusinessesNotification(selectedBusinessName, businessGroups);

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

// Function to group similar businesses together
function groupSimilarBusinesses(businesses) {
    const groups = [];
    const processed = new Set();
    
    for (const business of businesses) {
        if (processed.has(business)) continue;
        
        const similar = findSimilarBusinesses(business, businesses, 0.85);
        const group = [business, ...similar];
        
        // Mark all businesses in this group as processed
        group.forEach(b => processed.add(b));
        
        // Choose the "cleanest" version as primary (without encoding errors)
        let primaryBusiness = business;
        let cleanestScore = calculateCleanlinessScore(business);
        
        // Check all businesses in the group to find the cleanest one
        for (const groupBusiness of group) {
            const score = calculateCleanlinessScore(groupBusiness);
            if (score > cleanestScore) {
                cleanestScore = score;
                primaryBusiness = groupBusiness;
            }
        }
        
        // Separate variants (exclude primary from variants)
        const variants = group.filter(b => b !== primaryBusiness);
        
        groups.push({
            primary: primaryBusiness, // The "cleanest" version without encoding errors
            variants: variants,
            all: group
        });
    }
    
    return groups;
}

// Function to calculate how "clean" a business name is (higher score = cleaner)
function calculateCleanlinessScore(businessName) {
    let score = 0;
    
    // Check for encoding errors (lower score for these)
    const encodingErrors = [
        /ã¡/g, /ã©/g, /ã­/g, /ã³/g, /ãº/g, /ã±/g, /ã¼/g, /ã§/g, 
        /ã /g, /ã¨/g, /ã¬/g, /ã²/g, /ã¹/g, /ã¤/g, /ã¶/g
    ];
    
    for (const pattern of encodingErrors) {
        if (pattern.test(businessName)) {
            score -= 10; // Heavy penalty for encoding errors
        }
    }
    
    // Bonus for proper accented characters
    const properAccents = [/á/g, /é/g, /í/g, /ó/g, /ú/g, /ñ/g, /ü/g, /ç/g, /à/g, /è/g, /ì/g, /ò/g, /ù/g, /ä/g, /ö/g];
    for (const pattern of properAccents) {
        const matches = businessName.match(pattern);
        if (matches) {
            score += matches.length * 2; // Bonus for proper accents
        }
    }
    
    // Bonus for common business terms
    const businessTerms = ['laboratorio', 'clínico', 'clinical', 'laboratory', 'testlab', 'test lab'];
    for (const term of businessTerms) {
        if (businessName.toLowerCase().includes(term)) {
            score += 1;
        }
    }
    
    // Prefer shorter names (less likely to have accumulated errors)
    score += Math.max(0, 10 - businessName.length);
    
    return score;
}

// Function to show notification about similar businesses
function showSimilarBusinessesNotification(selectedBusiness, businessGroups) {
    if (selectedBusiness === 'all') return;
    
    const group = businessGroups.find(g => g.all.includes(selectedBusiness));
    if (!group || group.variants.length === 0) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'similar-businesses-notification';
    notification.style.cssText = `
        background: linear-gradient(135deg, #74b9ff, #0984e3);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin: 8px 0;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">ℹ️</span>
            <div>
                <strong>Datos agrupados:</strong> Este análisis incluye transacciones de negocios similares:
                <br><em>${group.variants.join(', ')}</em>
            </div>
        </div>
    `;
    
    // Insert after the business filter
    const businessFilter = document.querySelector('.filter-group:first-child');
    if (businessFilter) {
        businessFilter.insertAdjacentElement('afterend', notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}
