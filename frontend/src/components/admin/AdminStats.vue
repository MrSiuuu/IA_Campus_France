<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Carte des étudiants -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Étudiants</h3>
        <span class="text-2xl">👥</span>
      </div>
      <p class="text-3xl font-bold text-[#6366F1]">{{ stats.studentsCount }}</p>
      <div class="mt-4">
        <canvas ref="studentsChart"></canvas>
      </div>
    </div>

    <!-- Carte des messages -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Messages</h3>
        <span class="text-2xl">💬</span>
      </div>
      <p class="text-3xl font-bold text-[#6366F1]">{{ stats.messagesCount }}</p>
      <div class="mt-4">
        <canvas ref="messagesChart"></canvas>
      </div>
    </div>

    <!-- Carte des tokens -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Tokens consommés</h3>
        <span class="text-2xl">🔢</span>
      </div>
      <p class="text-3xl font-bold text-[#6366F1]">{{ stats.tokensConsumed }}</p>
      <div class="mt-4">
        <canvas ref="tokensChart"></canvas>
      </div>
    </div>

    <!-- Carte des documents -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Documents partagés</h3>
        <span class="text-2xl">📁</span>
      </div>
      <p class="text-3xl font-bold text-[#6366F1]">{{ stats.sharedDocumentsCount }}</p>
      <div class="mt-4">
        <canvas ref="documentsChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const studentsChart = ref(null)
const messagesChart = ref(null)
const tokensChart = ref(null)
const documentsChart = ref(null)

let charts = {}

function createCharts() {
  // Graphique des étudiants
  charts.students = new Chart(studentsChart.value, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Nouveaux étudiants',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#6366F1',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })

  // Graphique des messages
  charts.messages = new Chart(messagesChart.value, {
    type: 'bar',
    data: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Messages',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#6366F1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })

  // Graphique des tokens
  charts.tokens = new Chart(tokensChart.value, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Tokens consommés',
        data: [3000, 4500, 3800, 5200, 4800, 6000],
        borderColor: '#6366F1',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })

  // Graphique des documents
  charts.documents = new Chart(documentsChart.value, {
    type: 'doughnut',
    data: {
      labels: ['PDF', 'DOC', 'TXT', 'Autres'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: ['#6366F1', '#4F46E5', '#818CF8', '#C7D2FE']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

onMounted(() => {
  createCharts()
})

// Mettre à jour les graphiques quand les stats changent
watch(() => props.stats, (newStats) => {
  if (!newStats) return

  // Mettre à jour le graphique des étudiants
  if (newStats.monthlyStudents) {
    charts.students.data.labels = newStats.monthlyStudents.map(s => 
      new Date(s.month).toLocaleDateString('fr-FR', { month: 'short' })
    ).reverse()
    charts.students.data.datasets[0].data = newStats.monthlyStudents.map(s => s.count).reverse()
    charts.students.update()
  }

  // Mettre à jour le graphique des messages
  if (newStats.messagesByDay) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    charts.messages.data.labels = days
    charts.messages.data.datasets[0].data = days.map((_, i) => {
      const day = newStats.messagesByDay.find(d => d.day === i)
      return day ? day.count : 0
    })
    charts.messages.update()
  }

  // Mettre à jour le graphique des tokens
  if (newStats.tokenDistribution) {
    charts.tokens.data.labels = newStats.tokenDistribution.map(d => d.message_type)
    charts.tokens.data.datasets[0].data = newStats.tokenDistribution.map(d => d.total_tokens)
    charts.tokens.update()
  }
}, { deep: true })
</script> 