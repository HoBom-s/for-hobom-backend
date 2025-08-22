pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

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

    SSH_CRED_ID     = 'deploy-ssh-key'     // SSH private key (서버 접속)
    ENV_FILE_CRED   = 'hobom-infra-env'    // Jenkins Secret file (.env 업로드)

    NVM_DIR         = "${env.HOME}/.nvm"   // nvm 설치/로드 경로
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Bootstrap Node (nvm)') {
      steps {
        sh '''
          set -eux
          export NVM_DIR="$HOME/.nvm"
          if [ ! -d "$NVM_DIR" ]; then
            curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
          fi
          . "$NVM_DIR/nvm.sh"
          nvm install 20
          nvm alias default 20
          node -v
          npm -v
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh '''
          set -eux
          export NVM_DIR="$HOME/.nvm"
          . "$NVM_DIR/nvm.sh"
          nvm use 20 >/dev/null
          node -v && npm -v
          npm ci
        '''
      }
    }

    stage('Lint & Test') {
      steps {
        sh '''
          set -eux
          export NVM_DIR="$HOME/.nvm"
          . "$NVM_DIR/nvm.sh"
          nvm use 20 >/dev/null
          npm run lint || true
          npm run test || true
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
        sh '''
          set -eux
          export NVM_DIR="$HOME/.nvm"
          . "$NVM_DIR/nvm.sh"
          nvm use 20 >/dev/null
          npm run build
        '''
      }
      post {
        success { archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true }
      }
    }

    stage('Package for deploy (include .env from credentials)') {
      steps {
        sh '''
          set -eux
          rm -rf deploy && mkdir -p deploy
          cp -r dist deploy/dist
          cp package.json package-lock.json deploy/
          [ -d prisma ] && cp -r prisma deploy/prisma || true
          [ -d public ] && cp -r public deploy/public || true
        '''
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            set -eux
            install -m 600 "$ENV_FILE" deploy/.env
          '''
        }
        sh 'tar -C deploy -czf deploy.tgz .'
      }
    }

    stage('Verify SSH to target') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'echo OK && whoami && hostname'
          """
        }
      }
    }

    stage('Deploy to server (systemd)') {
      when {
        allOf {
          anyOf { branch 'develop'; branch 'main' }
          not { changeRequest() }
        }
      }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
            # 비밀 포함 배포 패키지 전송
            scp -o StrictHostKeyChecking=no deploy.tgz ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:/tmp/${env.APP_NAME}.tgz

            ssh -o StrictHostKeyChecking=no ${env.DEPLOY_USER}@${env.DEPLOY_HOST} << 'EOF'
set -e

# 0) Node 없으면(대비) 설치 — 원치 않으면 이 블록 삭제 가능
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
sudo mkdir -p ${env.DEPLOY_DIR}
sudo chown -R ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}

# 2) 패키지 전개 (.env 포함)
tar -xzf /tmp/${env.APP_NAME}.tgz -C ${env.DEPLOY_DIR}
cd ${env.DEPLOY_DIR}

# 🔒 .env 권한/소유권 보강
chmod 600 ${env.DEPLOY_DIR}/.env
chown ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}/.env

# 3) prod deps 설치
npm ci --omit=dev

# 4) systemd 유닛 설정
NODE_BIN="\\$(command -v node || true)"
if [ -z "\\$NODE_BIN" ]; then echo "node not found"; exit 1; fi

# 안전: .env 확인
if [ ! -f "${env.DEPLOY_DIR}/.env" ]; then
  echo "ERROR: ${env.DEPLOY_DIR}/.env not found"
  exit 1
fi

sudo bash -c 'cat > /etc/systemd/system/${env.SERVICE_NAME}.service' <<SERVICE
[Unit]
Description=${env.APP_NAME} service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${env.DEPLOY_USER}
Group=${env.DEPLOY_USER}
WorkingDirectory=${env.DEPLOY_DIR}
Environment=NODE_ENV=production
EnvironmentFile=${env.DEPLOY_DIR}/.env
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=\\$NODE_BIN ${env.DEPLOY_DIR}/${env.ENTRY_FILE}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable ${env.SERVICE_NAME}
sudo systemctl restart ${env.SERVICE_NAME}

# 상태 확인
for i in 1 2 3 4 5; do
  sleep 2
  if systemctl is-active --quiet ${env.SERVICE_NAME}; then
    echo "Service ${env.SERVICE_NAME} is active."
    exit 0
  fi
done

echo "Service ${env.SERVICE_NAME} failed to become active."
sudo systemctl status ${env.SERVICE_NAME} --no-pager -l || true
exit 1
EOF
          '''
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
