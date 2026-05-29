pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Backend (Maven)') {
      steps {
        script {
          if (isUnix()) {
            sh 'mvn -f backend/pom.xml clean install -DskipTests'
          } else {
            bat 'mvn -f backend/pom.xml clean install -DskipTests'
          }
        }
      }
    }

    stage('Build Frontend (Node/Vite)') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
            sh 'npm run build'
          } else {
            bat 'npm ci'
            bat 'npm run build'
          }
        }
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'backend/target/*.jar, dist/**', allowEmptyArchive: true
      }
    }
  }

  post {
    success {
      echo "Build succeeded"
    }
    failure {
      echo "Build failed"
    }
  }
}
