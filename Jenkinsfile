pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME        = 'for-hobom-backend'
    SERVICE_NAME    = 'for-hobom-backend'
    ENTRY_FILE      = 'dist/main.js'

    DEPLOY_HOST     = 'your.server.ip.or.hostname'
    DEPLOY_USER     = 'ubuntu'
    DEPLOY_DIR      = '/srv/for-hobom-backend'

    SSH_CRED_ID     = 'deploy-ssh-key'          // SSH private key (서버 접속)
    ENV_FILE_CRED   = 'hobom-infra-env'      // ✅ Jenkins Secret file (서버용 .env)
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
        // 에이전트에 node/npm이 있어야 함
        sh 'node -v && npm -v && npm ci'
      }
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
        // dist만 아카이브 (민감정보 없음)
        success { archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true }
      }
    }

    stage('Package for deploy (include .env from credentials)') {
      steps {
        sh '''
          rm -rf deploy && mkdir -p deploy
          cp -r dist deploy/dist
          cp package.json package-lock.json deploy/
          [ -d prisma ] && cp -r prisma deploy/prisma || true
          [ -d public ] && cp -r public deploy/public || true
        '''
        // ✅ Jenkins Secret file -> deploy/.env (로그에 절대 echo 하지 말 것!)
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            install -m 600 "$ENV_FILE" deploy/.env
          '''
        }
        // 🔒 배포용 tgz (비밀 포함) — 아카이브하지 않음
        sh 'tar -C deploy -czf deploy.tgz .'
      }
    }

    stage('Deploy to server (systemd)') {
      when {
        allOf {
          anyOf { branch 'develop'; branch 'main' } // 멀티브랜치 기준 배포 브랜치
          not { changeRequest() }                   // PR 배포 차단
        }
      }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh """
            # 비밀 포함 배포 패키지 전송 (아카이브 금지)
            scp -o StrictHostKeyChecking=no deploy.tgz ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/${APP_NAME}.tgz

            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'EOF'
set -e

# 0) Node 없으면(대비) 설치 — 원치 않으면 블록 삭제 가능
if ! command -v node >/dev/null 2>&1; then
  if [ -f /etc/debian_version ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get update -y && sudo apt-get install -y nodejs
  elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ] || [ -f /etc/rocky-release ]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
  elif [ -f /etc/amazon-linux-release ]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs || sudo yum install -y nodejs
  else
    echo "Unsupported distro: please pre-install Node 20+"
    exit 1
  fi
fi

# 1) 배포 디렉토리
sudo mkdir -p ${DEPLOY_DIR}
sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}

# 2) 패키지 전개 (여기에는 deploy/.env 포함)
tar -xzf /tmp/${APP_NAME}.tgz -C ${DEPLOY_DIR}
cd ${DEPLOY_DIR}

# 3) prod deps 설치
npm ci --omit=dev

# 4) systemd 유닛 (DEPLOY_DIR/.env 사용)
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then echo "node not found"; exit 1; fi

# 안전: .env 존재 검증 (없으면 실패)
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
  echo "ERROR: ${DEPLOY_DIR}/.env not found"
  exit 1
fi

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
EnvironmentFile=${DEPLOY_DIR}/.env
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=$NODE_BIN ${DEPLOY_DIR}/${ENTRY_FILE}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

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
