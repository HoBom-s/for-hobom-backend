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
      steps {
        sh 'npm run build'
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true
        }
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
          sh """
            # 1) 설정 읽기
            set -a
            source /tmp/deploy.env
            set +a

            # 2) Node 없으면 설치 (대비용)
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
                echo "Unsupported distro: pre-install Node 20+"
                exit 1
              fi
            fi

            # 3) 배포 디렉토리 준비
            sudo mkdir -p "$DEPLOY_DIR"
            sudo chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR"

            # 4) 산출물 전개 (.env 포함)
            tar -xzf "/tmp/$APP_NAME.tgz" -C "$DEPLOY_DIR"
            cd "$DEPLOY_DIR"

            # 5) .env 권한/소유권 보강
            chmod 600 "$DEPLOY_DIR/.env"
            chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR/.env"

            # 6) prod deps 설치
            npm ci --omit=dev

            # 7) systemd 유닛 생성/갱신
            NODE_BIN="\$(command -v node || true)"
            if [ -z "\$NODE_BIN" ]; then echo "node not found"; exit 1; fi
            if [ ! -f "$DEPLOY_DIR/.env" ]; then echo "ERROR: $DEPLOY_DIR/.env not found"; exit 1; fi

            sudo tee /etc/systemd/system/"$SERVICE_NAME".service >/dev/null <<SERVICE
            [Unit]
            Description=$APP_NAME service
            After=network-online.target
            Wants=network-online.target

            [Service]
            Type=simple
            User=$DEPLOY_USER
            Group=$DEPLOY_USER
            WorkingDirectory=$DEPLOY_DIR
            Environment=NODE_ENV=production
            EnvironmentFile=$DEPLOY_DIR/.env
            Environment=PATH=/usr/local/bin:/usr/bin:/bin
            ExecStart=\$NODE_BIN \$DEPLOY_DIR/\$ENTRY_FILE
            Restart=always
            RestartSec=3

            [Install]
            WantedBy=multi-user.target
            SERVICE

            sudo systemctl daemon-reload
            sudo systemctl enable "$SERVICE_NAME"
            sudo systemctl restart "$SERVICE_NAME"

            # 8) 상태 확인
            for i in 1 2 3 4 5; do
              sleep 2
              if systemctl is-active --quiet "$SERVICE_NAME"; then
                echo "Service $SERVICE_NAME is active."
                exit 0
              fi
            done

            echo "Service $SERVICE_NAME failed to become active."
            sudo systemctl status "$SERVICE_NAME" --no-pager -l || true
            exit 1
            BASH
                        chmod +x remote_deploy.sh

                        # 0-2) 원격에서 읽을 환경파일 생성 (여긴 Groovy가 값 치환)
                        cat > deploy.env <<EOF
            APP_NAME=${env.APP_NAME}
            SERVICE_NAME=${env.SERVICE_NAME}
            ENTRY_FILE=${env.ENTRY_FILE}
            DEPLOY_DIR=${env.DEPLOY_DIR}
            DEPLOY_USER=${env.DEPLOY_USER}
            EOF

            # 1) 비밀 포함 배포 패키지 전송 + 원격 스크립트/환경파일 전송
            scp -o StrictHostKeyChecking=no -P ${env.DEPLOY_PORT} deploy.tgz remote_deploy.sh deploy.env ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:/tmp/

            # 2) 원격 실행 (bash 엄격모드로 실행, 실패 지점 라인까지 출력)
            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'bash -euxo pipefail /tmp/remote_deploy.sh'
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
