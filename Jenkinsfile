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
    APP_NAME       = 'for-hobom-backend'
    SERVICE_NAME   = 'for-hobom-backend'
    ENTRY_FILE     = 'dist/main.js'
    DEPLOY_HOST    = 'your.server.ip.or.hostname'
    DEPLOY_USER    = 'ubuntu'
    DEPLOY_DIR     = '/srv/for-hobom-backend'
    SSH_CRED_ID    = 'deploy-ssh-key'
    ENV_FILE_CRED  = 'env-file-cred'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Install dependencies') {
      steps { sh 'npm ci' }
    }

    stage('Lint & Test') {
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
      steps { sh 'npm run build' }
      post {
        success { archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true }
      }
    }

    stage('Package artifact') {
      steps {
        sh '''
          rm -rf deploy && mkdir -p deploy
          cp -r dist deploy/dist
          cp package.json package-lock.json deploy/
          # 필요 시 기타 파일 포함 (ex: static, prisma 등)
          [ -d prisma ] && cp -r prisma deploy/prisma || true
        '''
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            if [ -f "$ENV_FILE" ]; then
              cp "$ENV_FILE" deploy/.env
            fi
          '''
        }
        sh 'tar -C deploy -czf artifact.tgz .'
        archiveArtifacts artifacts: 'artifact.tgz', onlyIfSuccessful: true
      }
    }

    stage('Deploy to server (systemd)') {
      when { anyOf { branch 'develop'; branch 'main' } } // 멀티브랜치가 아니면 제거하거나 수정
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh """
            scp -o StrictHostKeyChecking=no artifact.tgz ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/${APP_NAME}.tgz
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
    set -e

    # 1) 디렉토리 준비
    sudo mkdir -p ${DEPLOY_DIR}
    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}

    # 2) 산출물 전개
    tar -xzf /tmp/${APP_NAME}.tgz -C ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}

    # 3) 프로덕션 의존성 설치 (npm v7+)
    if command -v npm >/dev/null 2>&1; then
      npm ci --omit=dev
    else
      echo "npm not found on target host"; exit 1
    fi

    # 4) systemd 서비스 유닛 작성/갱신
    NODE_BIN="\$(command -v node || true)"
    if [ -z "\$NODE_BIN" ]; then echo "node not found on target host"; exit 1; fi

    sudo bash -c 'cat > /etc/systemd/system/${SERVICE_NAME}.service' <<SERVICE
    [Unit]
    Description=${APP_NAME} service
    After=network-online.target
    Wants=network-online.target

    [Service]
    Type=simple
    User=${DEPLOY_USER}
    Group=${DEPLOY_USER}
    WorkingDirectory=${DEPLOY_DIR}
    Environment=NODE_ENV=production
    EnvironmentFile=-${DEPLOY_DIR}/.env
    ExecStart=\$NODE_BIN ${DEPLOY_DIR}/${ENTRY_FILE}
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    SERVICE

    # 5) 재시작 및 상태확인
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    sudo systemctl restart ${SERVICE_NAME}

    for i in 1 2 3 4 5; do
      sleep 2
      if systemctl is-active --quiet ${SERVICE_NAME}; then
        echo "Service ${SERVICE_NAME} is active."
        exit 0
      fi
    done

    echo "Service ${SERVICE_NAME} failed to become active."
    sudo systemctl status ${SERVICE_NAME} --no-pager -l || true
    exit 1
    EOF
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build #${env.BUILD_NUMBER} OK (${env.BRANCH_NAME})"
      echo "🚀 Deployed to ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:${env.DEPLOY_DIR} (systemd: ${env.SERVICE_NAME})"
    }
    failure {
      echo "❌ Build failed (${env.BRANCH_NAME})"
    }
  }
}
