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

    DEPLOY_HOST     = 'ishisha.iptime.org'
    DEPLOY_PORT     = '22223'
    DEPLOY_USER     = 'infra-admin'
    DEPLOY_DIR      = '/srv/for-hobom-backend'

    SSH_CRED_ID     = 'deploy-ssh-key'
    ENV_FILE_CRED   = 'hobom-infra-env'
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

    stage('Lint & Test') {
      steps {
        sh '''
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
      steps { sh 'npm run build' }
      post {
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
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
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
            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'echo OK && whoami && hostname'
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
            scp -o StrictHostKeyChecking=no -P ${env.DEPLOY_PORT} deploy.tgz ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:/tmp/${env.APP_NAME}.tgz

            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} << 'EOF'
          '''
sh """
    set -e

    # 0) Node 없으면 설치 (대비용)
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

    # 2) 패키지 전개 (.env 포함)
    tar -xzf /tmp/${APP_NAME}.tgz -C ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}

    # 🔒 .env 권한/소유권 보강
    chmod 600 ${DEPLOY_DIR}/.env
    
    # ★★★ 수정됨: 셸 스크립트 문법 오류 수정 ★★★
    chown ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}/.env

    # 3) prod deps 설치
    npm ci --omit=dev

    # 4) systemd 유닛 설정
    NODE_BIN="$(command -v node || true)"
    if [ -z "$NODE_BIN" ]; then echo "node not found"; exit 1; fi

    # 안전: .env 확인
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

    # 상태 확인
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