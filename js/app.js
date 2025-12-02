const app = {
    state: {
        habits: {
            water: 0, 
            sleep: 0, 
            exercise: 0
        },
        goals: {
            water: 2000,
            sleep: 8,
            exercise: 30
        },
        logs: [],
        view: 'home'
    },

    init() {
        this.loadState();
        this.setupNavigation();
        this.renderView('home');
        this.updateGreeting();
    },

    loadState() {
        const saved = localStorage.getItem('aura_state');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    saveState() {
        localStorage.setItem('aura_state', JSON.stringify(this.state));
        this.updateUI();
    },

    

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                const targetBtn = e.target.closest('.nav-item');
                targetBtn.classList.add('active');
                
                const viewName = targetBtn.dataset.target;
                this.renderView(viewName);
            });
        });
    },

    renderView(viewName) {
        const main = document.getElementById('main-content');
        const template = document.getElementById(`view-${viewName}`);
        
        if (!template) return;

        main.innerHTML = '';
        
        const content = template.content.cloneNode(true);
        main.appendChild(content);
        
        this.state.view = viewName;
        this.updateUI(); 
    },

    updateUI() {
        if (this.state.view === 'home') {
            this.updateHomeProgress();
        } else if (this.state.view === 'habits') {
            this.updateHabitsView();
        } else if (this.state.view === 'health') {
            this.renderLogs();
            this.renderMoodChart();
        }
    },

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Buenas noches';
        if (hour < 12) greeting = 'Buenos días';
        else if (hour < 20) greeting = 'Buenas tardes';
    },

    updateHomeProgress() {
        const waterP = Math.min(this.state.habits.water / this.state.goals.water, 1);
        const sleepP = Math.min(this.state.habits.sleep / this.state.goals.sleep, 1);
        const exerciseP = Math.min(this.state.habits.exercise / this.state.goals.exercise, 1);
        
        const totalAvg = (waterP + sleepP + exerciseP) / 3;
        const percentage = Math.round(totalAvg * 100);

        const ring = document.querySelector('.progress-ring__circle');
        const text = document.querySelector('.progress-stats h3');
        
        if (ring && text) {
            const radius = ring.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (totalAvg * circumference);
            
            ring.style.strokeDashoffset = offset;
            text.textContent = `${percentage}% Completado`;
        }
    },

    addWater() {
        this.updateHabit('water', 250);
        alert('💧 Agua registrada (+250ml)');
    },

    updateHabit(type, value) {
        if (type === 'sleep') {
            this.state.habits.sleep = parseFloat(value);
        } else {
            this.state.habits[type] += parseInt(value);
            if (this.state.habits[type] < 0) this.state.habits[type] = 0;
        }
        this.saveState();
    },

    

    updateHabitsView() {
        const waterVal = document.getElementById('water-val');
        const waterBar = document.querySelector('.progress-bar-fill.blue');
        if (waterVal) {
            waterVal.textContent = `${this.state.habits.water}ml`;
            const wPct = Math.min((this.state.habits.water / this.state.goals.water) * 100, 100);
            waterBar.style.width = `${wPct}%`;
        }

        const sleepVal = document.getElementById('sleep-val');
        const sleepBar = document.querySelector('.progress-bar-fill.indigo');
        const sleepInput = document.querySelector('.slider');
        if (sleepVal) {
            sleepVal.textContent = `${this.state.habits.sleep}h`;
            const sPct = Math.min((this.state.habits.sleep / this.state.goals.sleep) * 100, 100);
            sleepBar.style.width = `${sPct}%`;
            sleepInput.value = this.state.habits.sleep;
        }

        const exVal = document.getElementById('exercise-val');
        const exBar = document.querySelector('.progress-bar-fill.green');
        if (exVal) {
            exVal.textContent = `${this.state.habits.exercise}min`;
            const ePct = Math.min((this.state.habits.exercise / this.state.goals.exercise) * 100, 100);
            exBar.style.width = `${ePct}%`;
        }
    },

    isBreathing: false,
    breathingInterval: null,
    
    startBreathing() {
        this.renderView('mindfulness');
    },

    toggleBreathing() {
        const circle = document.querySelector('.breathing-circle');
        const text = document.querySelector('.breathing-text');
        const btn = document.getElementById('breath-btn');

        if (this.isBreathing) {
            this.isBreathing = false;
            clearInterval(this.breathingInterval);
            circle.classList.remove('inhale');
            text.textContent = 'Inhala';
            btn.textContent = 'Iniciar';
            btn.style.background = '';
        } else {
            this.isBreathing = true;
            btn.textContent = 'Detener';
            btn.style.background = 'var(--secondary)';
            
            this.breathingCycle(circle, text);
            this.breathingInterval = setInterval(() => {
                this.breathingCycle(circle, text);
            }, 8000);
        }
    },

    breathingCycle(circle, text) {
        text.textContent = 'Inhala...';
        circle.classList.add('inhale');
        
        setTimeout(() => {
            if (!this.isBreathing) return;
            text.textContent = 'Exhala...';
            circle.classList.remove('inhale');
        }, 4000);
    },

    logSymptom() {
        this.renderView('health');
    },
    
    logSleep() {
        this.renderView('habits');
    },

    saveHealthLog(e) {
        e.preventDefault();
        const mood = document.querySelector('input[name="mood"]:checked')?.value || 'neutral';
        const notes = document.querySelector('textarea').value;
        
        const newLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood,
            notes
        };

        this.state.logs.unshift(newLog);
        this.saveState();
        
        e.target.reset();
        this.renderLogs();
    },

    resetProgress() {
        if (confirm("¿Quieres resetear tu progreso? Se perderán todos los datos guardados.")) {
            localStorage.removeItem('aura_state');
            this.state = {
                habits: {
                    water: 0,
                    sleep: 0,
                    exercise: 0
                },
                goals: {
                    water: 2000,
                    sleep: 8,
                    exercise: 30
                },
                logs: [],
                view: 'home'
            };
            this.saveState();
            this.renderView(this.state.view);
        }},

    renderLogs() {
        const container = document.getElementById('health-logs');
        if (!container) return;

        container.innerHTML = this.state.logs.map(log => {
            const date = new Date(log.date);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const moodMap = { 'great': '😄', 'good': '🙂', 'meh': '😐', 'bad': '😫', 'neutral': '😶' };
            
            return `
                <div class="log-item glass-card fade-in">
                    <div class="log-header">
                        <span class="log-mood">${moodMap[log.mood]}</span>
                        <span class="log-time">${timeStr}</span>
                    </div>
                    <p class="log-text">${log.notes}</p>
                </div>
            `;
        }).join('');
    },

    renderMoodChart() {
        const ctx = document.getElementById('mood-chart');
        if (!ctx) return;

        const moodValues = { 'bad': 1, 'meh': 2, 'good': 3, 'great': 4, 'neutral': 2.5 };
        const recentLogs = this.state.logs.slice(0, 7).reverse();

        const labels = recentLogs.map(log => {
            const date = new Date(log.date);
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        });

        const data = recentLogs.map(log => moodValues[log.mood] || 2.5);

        if (this.moodChart) this.moodChart.destroy();

        this.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Estado de ánimo',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)'
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 1,
                        max: 4,
                        ticks: {
                            stepSize: 1,
                            callback: val => {
                                const moodLabels = {1: '😫', 2: '😐', 3: '🙂', 4: '😄'};
                                return moodLabels[val] || '';
                            },
                            color: 'var(--text-muted)'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-muted)'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-main)'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const moodEmojis = {1: '😫 Mal', 2: '😐 Neutral', 3: '🙂 Bien', 4: '😄 Genial'};
                                return moodEmojis[context.parsed.y] || 'Neutral';
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});