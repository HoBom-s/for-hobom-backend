pipeline {
  agent any

  tools {
    nodejs 'node-20'  // Jenkins에 NodeJS 설치 항목(node-20) 등록되어 있어야 함
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    // Docker Hub
    REGISTRY      = 'docker.io'
    IMAGE_REPO    = 'jjockrod/hobom-system'          // Docker Hub
    SERVICE_NAME  = 'for-hobom-backend'              // Tag
    IMAGE_TAG     = "${REGISTRY}/${IMAGE_REPO}:${SERVICE_NAME}-${env.BUILD_NUMBER}"
    IMAGE_LATEST  = "${REGISTRY}/${IMAGE_REPO}:${SERVICE_NAME}-latest"
    REGISTRY_CRED = 'dockerhub-cred'                 // Push only
    READ_CRED_ID  = 'dockerhub-readonly'             // Private pull only

    // Remote Server
    APP_NAME      = 'for-hobom-backend'
    DEPLOY_HOST   = 'ishisha.iptime.org'
    DEPLOY_PORT   = '22223'
    DEPLOY_USER   = 'infra-admin'
    SSH_CRED_ID   = 'deploy-ssh-key'                 // SSH private key
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Install / Lint / Test / Build') {
      steps {
        sh '''
          set -eux
          node -v
          npm -v
          npm ci
          npm run lint || true
          npm run test || true
          npm run build
        '''
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true
        }
      }
    }

    stage('Docker build & push') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.REGISTRY_CRED, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            set -eux
            docker build -t ${env.IMAGE_TAG} -t ${env.IMAGE_LATEST} .
            echo "$REG_PASS" | docker login ${env.REGISTRY} -u "$REG_USER" --password-stdin
            docker push ${env.IMAGE_TAG}
            docker push ${env.IMAGE_LATEST}
            docker logout ${env.REGISTRY}
          """
        }
      }
    }

    stage('Deploy container to server') {
      when { anyOf { branch 'develop'; branch 'main' } }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          withCredentials([usernamePassword(credentialsId: env.READ_CRED_ID, usernameVariable: 'PULL_USER', passwordVariable: 'PULL_PASS')]) {
            sh """
              # 원격에 환경 변수 넘기고 Here-doc으로 스크립트 실행
              ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} \\
                APP_NAME='${env.APP_NAME}' \\
                IMAGE='${env.IMAGE_LATEST}' \\
                CONTAINER='${env.APP_NAME}' \\
                ENV_PATH='/etc/${env.APP_NAME}/.env' \\
                HOST_PORT='8080' \\
                CONTAINER_PORT='8080' \\
                PULL_USER="$PULL_USER" \\
                PULL_PASS="$PULL_PASS" \\
                bash -s <<'EOF'
                set -euo pipefail
                echo "[REMOTE] Deploying $APP_NAME with image $IMAGE"

                # Docker 없으면 설치 (Debian/Ubuntu)
                if ! command -v docker >/dev/null 2>&1; then
                  if [ -f /etc/debian_version ]; then
                    sudo apt-get update -y
                    sudo apt-get install -y ca-certificates curl gnupg
                    sudo install -m 0755 -d /etc/apt/keyrings
                    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
                https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \\
                $(. /etc/os-release; echo "$VERSION_CODENAME") stable" | \\
                sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
                    sudo apt-get update -y
                    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                  else
                    echo "[REMOTE] Please install Docker manually for this distro"
                    exit 1
                  fi
                fi

                # Private 레포 → pull 전 로그인
                echo "$PULL_PASS" | sudo docker login docker.io -u "$PULL_USER" --password-stdin

                # 서버 .env 확인
                if [ ! -f "$ENV_PATH" ]; then
                  echo "[REMOTE][ERROR] $ENV_PATH not found. Create it on the server."
                  exit 1
                fi

                # 최신 이미지 pull
                sudo docker pull "$IMAGE"

                # 기존 컨테이너 정리
                if sudo docker ps -a --format '{{.Names}}' | grep -w "$CONTAINER" >/dev/null 2>&1; then
                  sudo docker stop "$CONTAINER" || true
                  sudo docker rm "$CONTAINER" || true
                fi

                # 새 컨테이너 실행
                sudo docker run -d --name "$CONTAINER" \\
                  --restart unless-stopped \\
                  --env-file "$ENV_PATH" \\
                  -p "${HOST_PORT}:${CONTAINER_PORT}" \\
                  "$IMAGE"

                # 상태 출력
                sudo docker ps --filter "name=$CONTAINER" --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"
                EOF
            """
          }
        }
      }
    }

    stage('Smoke check (optional)') {
      when { anyOf { branch 'develop'; branch 'main' } }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'curl -fsS http://localhost:8080/ || true'
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build #${env.BUILD_NUMBER} → pushed ${env.IMAGE_LATEST} & deployed on ${env.DEPLOY_HOST}"
    }
    failure {
      echo "❌ Build failed (${env.BRANCH_NAME})"
    }
  }
}
