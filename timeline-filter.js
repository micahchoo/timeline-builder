
class TimelineFilter {
    constructor(timelineData) {
        this.originalData = JSON.parse(JSON.stringify(timelineData));
        this.currentData = JSON.parse(JSON.stringify(timelineData));
        this.timeline = null;
        this.activeGroupFilters = new Set();
        this.activeEraFilters = new Set();
        
        this.init();
    }
    
    init() {
        this.generateFilterButtons();
        this.createTimeline();
        this.updateFilterStatus();
    }
    
    generateFilterButtons() {
        this.generateGroupButtons();
        this.generateEraButtons();
    }
    
    generateGroupButtons() {
        const groupContainer = document.getElementById('group-filters');
        const groups = this.getUniqueGroups();
        
        // Clear existing buttons
        groupContainer.innerHTML = '';
        
        // Add "Show All" button
        const showAllBtn = document.createElement('button');
        showAllBtn.className = 'filter-btn show-all';
        showAllBtn.textContent = 'Show All Groups';
        showAllBtn.onclick = () => this.clearGroupFilters();
        groupContainer.appendChild(showAllBtn);
        
        // Add individual group buttons
        groups.forEach(group => {
            if (group) { // Skip empty groups
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.textContent = group;
                btn.onclick = () => this.toggleGroupFilter(group, btn);
                groupContainer.appendChild(btn);
            }
        });
    }
    
    generateEraButtons() {
        const eraContainer = document.getElementById('era-filters');
        const eras = this.getUniqueEras();
        
        // Clear existing buttons
        eraContainer.innerHTML = '';
        
        // Add "Show All" button
        const showAllBtn = document.createElement('button');
        showAllBtn.className = 'filter-btn show-all';
        showAllBtn.textContent = 'Show All Eras';
        showAllBtn.onclick = () => this.clearEraFilters();
        eraContainer.appendChild(showAllBtn);
        
        // Add individual era buttons
        eras.forEach(era => {
            if (era) { // Skip empty eras
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.textContent = era;
                btn.onclick = () => this.toggleEraFilter(era, btn);
                eraContainer.appendChild(btn);
            }
        });
    }
    
    getUniqueGroups() {
        const groups = new Set();
        this.originalData.events.forEach(event => {
            if (event.group) {
                groups.add(event.group);
            }
        });
        return Array.from(groups).sort();
    }
    
    getUniqueEras() {
        const eras = new Set();
        if (this.originalData.eras) {
            this.originalData.eras.forEach(era => {
                if (era.text && era.text.headline) {
                    eras.add(era.text.headline);
                }
            });
        }
        return Array.from(eras).sort();
    }
    
    toggleGroupFilter(group, button) {
        if (this.activeGroupFilters.has(group)) {
            this.activeGroupFilters.delete(group);
            button.classList.remove('active');
        } else {
            this.activeGroupFilters.add(group);
            button.classList.add('active');
        }
        this.applyFilters();
    }
    
    toggleEraFilter(era, button) {
        if (this.activeEraFilters.has(era)) {
            this.activeEraFilters.delete(era);
            button.classList.remove('active');
        } else {
            this.activeEraFilters.add(era);
            button.classList.add('active');
        }
        this.applyFilters();
    }
    
    clearGroupFilters() {
        this.activeGroupFilters.clear();
        document.querySelectorAll('#group-filters .filter-btn:not(.show-all)').forEach(btn => {
            btn.classList.remove('active');
        });
        this.applyFilters();
    }
    
    clearEraFilters() {
        this.activeEraFilters.clear();
        document.querySelectorAll('#era-filters .filter-btn:not(.show-all)').forEach(btn => {
            btn.classList.remove('active');
        });
        this.applyFilters();
    }
    
    applyFilters() {
        // Start with original data
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        
        // Filter events by group
        if (this.activeGroupFilters.size > 0) {
            this.currentData.events = this.currentData.events.filter(event => 
                this.activeGroupFilters.has(event.group)
            );
        }
        
        // Filter eras
        if (this.activeEraFilters.size > 0 && this.currentData.eras) {
            this.currentData.eras = this.currentData.eras.filter(era => 
                this.activeEraFilters.has(era.text.headline)
            );
        }
        
        this.recreateTimeline();
        this.updateFilterStatus();
    }
    
    createTimeline() {
        if (this.timeline) {
            // Remove existing timeline
            document.getElementById('timeline-embed').innerHTML = '';
        }
        
        this.timeline = new TL.Timeline('timeline-embed', this.currentData);
    }
    
    recreateTimeline() {
        this.createTimeline();
    }
    
    updateFilterStatus() {
        const statusEl = document.getElementById('filter-status');
        const totalEvents = this.originalData.events.length;
        const filteredEvents = this.currentData.events.length;
        const totalEras = this.originalData.eras ? this.originalData.eras.length : 0;
        const filteredEras = this.currentData.eras ? this.currentData.eras.length : 0;
        
        if (this.activeGroupFilters.size === 0 && this.activeEraFilters.size === 0) {
            statusEl.textContent = 'Showing all events';
        } else {
            const parts = [];
            if (this.activeGroupFilters.size > 0) {
                parts.push(`${filteredEvents}/${totalEvents} events`);
            }
            if (this.activeEraFilters.size > 0) {
                parts.push(`${filteredEras}/${totalEras} eras`);
            }
            statusEl.textContent = `Showing ${parts.join(', ')}`;
        }
    }
}

// Initialize the timeline filter system
$(document).ready(function() {
    // Try to load your JSON file, fallback to sample data
    $.getJSON("2025-2026_timeline.json")
        .done(function(data) {
            new TimelineFilter(data);
        })
        .fail(function() {
            console.log("Could not load 2025-2026_timeline.json, using sample data");
            new TimelineFilter(sampleTimelineData);
        });
});
