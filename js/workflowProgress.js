/**
 * Dental CAD Pro - Workflow Progress System
 * Manages the dynamic progress bar across all workflow stages
 */

class WorkflowProgress {
    constructor() {
        this.stages = [
            { id: 1, name: 'Order Form', key: 'orderform', file: 'orderform.html' },
            { id: 2, name: 'Scan Cleaning', key: 'scanning', file: 'index.html' },
            { id: 3, name: 'Margin & Crown', key: 'margin', file: 'margin-setup.html' },
            { id: 4, name: 'Design', key: 'design', file: 'design.html' },
            { id: 5, name: 'Finalize', key: 'finalize', file: 'finalize.html' }
        ];
        
        this.currentStage = this.getCurrentStage();
        this.completedStages = this.getCompletedStages();
    }

    getCurrentStage() {
        const currentPage = window.location.pathname.split('/').pop() || 'orderform.html';
        const stage = this.stages.find(s => s.file === currentPage);
        return stage ? stage.id : 1;
    }

    getCompletedStages() {
        const completed = JSON.parse(localStorage.getItem('dentalWorkflowCompleted') || '[]');
        return completed;
    }

    markStageComplete(stageId) {
        const completed = this.getCompletedStages();
        if (!completed.includes(stageId)) {
            completed.push(stageId);
            localStorage.setItem('dentalWorkflowCompleted', JSON.stringify(completed));
            this.completedStages = completed;
        }
    }

    renderProgressBar(containerId = 'workflowProgressContainer') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('Progress bar container not found:', containerId);
            return;
        }

        const progressHTML = `
            <div class="bg-gray-800 border-b border-gray-700">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div class="flex items-center justify-center space-x-8">
                        ${this.stages.map(stage => this.renderStageButton(stage)).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = progressHTML;
        this.attachEventListeners();
    }

    renderStageButton(stage) {
        const isCompleted = this.completedStages.includes(stage.id);
        const isActive = this.currentStage === stage.id;
        const isAccessible = isCompleted || isActive || stage.id === 1 || this.completedStages.includes(stage.id - 1);

        let stageClass = 'workflow-step';
        let textClass = 'text-gray-400';
        let buttonAttributes = '';

        if (isCompleted) {
            stageClass += ' completed';
            textClass = 'text-green-400';
        } else if (isActive) {
            stageClass += ' active';
            textClass = 'text-dental-primary';
        }

        if (isAccessible && !isActive) {
            buttonAttributes = `onclick="workflowProgress.navigateToStage(${stage.id})" style="cursor: pointer;"`;
            stageClass += ' clickable';
        }

        return `
            <div class="${stageClass}" ${buttonAttributes}>
                <div class="step-circle">${stage.id}</div>
                <span class="ml-2 text-sm font-medium ${textClass}">${stage.name}</span>
            </div>
        `;
    }

    attachEventListeners() {
        // Add hover effects for clickable stages
        document.querySelectorAll('.workflow-step.clickable').forEach(step => {
            step.addEventListener('mouseenter', function() {
                this.style.opacity = '0.8';
            });
            step.addEventListener('mouseleave', function() {
                this.style.opacity = '1';
            });
        });
    }

    navigateToStage(stageId) {
        const stage = this.stages.find(s => s.id === stageId);
        if (!stage) return;

        const isAccessible = this.completedStages.includes(stageId) || 
                           stageId === 1 || 
                           this.completedStages.includes(stageId - 1);

        if (!isAccessible) {
            this.showNotification('Complete previous stages first', 'warning');
            return;
        }

        if (stageId === this.currentStage) return;

        // Confirm navigation if leaving current stage with unsaved changes
        if (this.hasUnsavedChanges && this.hasUnsavedChanges()) {
            if (!confirm('You have unsaved changes. Continue to next stage?')) {
                return;
            }
        }

        window.location.href = stage.file;
    }

    proceedToNextStage() {
        // Mark current stage as complete
        this.markStageComplete(this.currentStage);
        
        // Navigate to next stage
        const nextStageId = this.currentStage + 1;
        if (nextStageId <= this.stages.length) {
            this.navigateToStage(nextStageId);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        switch(type) {
            case 'success':
                notification.className += ' bg-green-600 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-600 text-white';
                break;
            case 'warning':
                notification.className += ' bg-yellow-600 text-white';
                break;
            default:
                notification.className += ' bg-blue-600 text-white';
        }

        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Global instance
window.workflowProgress = new WorkflowProgress();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.workflowProgress) {
        window.workflowProgress.renderProgressBar();
    }
});
