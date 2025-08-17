pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  options {
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME     = 'for-hobom-backend'
    REGISTRY     = 'docker.io'
    IMAGE_REPO   = '<hub-username>/<repo>'   // ex) hobom/for-hobom-backend
    IMAGE_TAG    = "${REGISTRY}/${IMAGE_REPO}:${env.BUILD_NUMBER}"

    REGISTRY_CRED = 'dockerhub-cred'         // Jenkins Credentials (Docker Hub)
    KUBE_CONFIG   = 'kubeconfig-cred-id'     // Jenkins에 등록한 kubeconfig 파일
    K8S_NAMESPACE = 'default'
    DEPLOY_NAME   = 'for-hobom-backend'      // Deployment 이름 (kubectl set image용)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint & Test start') {
      steps {
        sh '''
          npm run lint || true
          npm run test:ci || npm run test || true
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/**/*.xml'
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.REGISTRY_CRED, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            docker build -t ${IMAGE_TAG} .
            echo "$REG_PASS" | docker login ${REGISTRY} -u "$REG_USER" --password-stdin
            docker push ${IMAGE_TAG}
            docker logout ${REGISTRY}
          """
        }
      }
    }

    stage('Deploy to k3s (only develop)') {
      when { expression { env.BRANCH_NAME == 'develop' } }
      steps {
        withCredentials([file(credentialsId: env.KUBE_CONFIG, variable: 'KUBECONFIG_FILE')]) {
          sh """
            export KUBECONFIG="$KUBECONFIG_FILE"
            kubectl -n ${K8S_NAMESPACE} set image deployment/${DEPLOY_NAME} api=${IMAGE_TAG} --record
            kubectl -n ${K8S_NAMESPACE} rollout status deployment/${DEPLOY_NAME} --timeout=300s
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build #${env.BUILD_NUMBER} OK (${env.BRANCH_NAME})"
      script {
        if (env.BRANCH_NAME == 'develop') {
          echo "🚀 Deployed ${IMAGE_TAG} to k3s (deployment: ${DEPLOY_NAME})"
        }
      }
    }
    failure {
      echo "❌ Build failed (${env.BRANCH_NAME})"
    }
  }
}
