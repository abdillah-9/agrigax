FROM node:25

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]

# | Command                 | Meaning            |
# | ----------------------- | ------------------ |
# | `docker ps`             | running containers |
# | `docker ps -a`          | all containers     |
# | `docker images`         | all images         |
# | `docker compose up`     | start services     |
# | `docker compose down`   | stop services      |
# | `docker logs container` | see logs           |
# | `docker exec -it x sh`  | enter container    |
# | `docker volume ls`      | list volumes       |

# MOST IMPORTANT
# docker ps
# docker images
# docker stop
# docker rm
# docker rmi
# docker compose up
# docker compose down
# docker exec -it
# docker logs

# | Command       | What it does     |
# | ------------- | ---------------- |
# | `docker -v`   | Docker version   |
# | `docker info` | Full system info |

# | Command                            | What it does                          |
# | ---------------------------------- | ------------------------------------- |
# | `docker system prune`              | Clean unused stuff                    |
# | `docker system prune -a`           | Remove ALL unused images + containers |
# | `docker system prune -a --volumes` | FULL RESET (⚠ deletes DB data)        |

# | Command                        | What it does          |
# | ------------------------------ | --------------------- |
# | `docker volume ls`             | List volumes          |
# | `docker volume inspect <name>` | Show volume details   |
# | `docker volume rm <name>`      | Delete volume         |
# | `docker volume prune`          | Remove unused volumes |

# | Command                          | What it does                |
# | -------------------------------- | --------------------------- |
# | `docker logs <container>`        | Show container logs         |
# | `docker exec -it <container> sh` | Enter container shell       |
# | `docker inspect <container>`     | Show full container details |

# | Command                | What it does             |
# | ---------------------- | ------------------------ |
# | `docker compose up`    | Start all services       |
# | `docker compose up -d` | Start in background      |
# | `docker compose down`  | Stop + remove containers |
# | `docker compose logs`  | Show logs                |
# | `docker compose ps`    | Show compose containers  |

# | Command                         | What it does                |
# | ------------------------------- | --------------------------- |
# | `docker build -t app-name .`    | Build image from Dockerfile |
# | `docker run image`              | Run container from image    |
# | `docker run -p 3000:3000 image` | Run with port mapping       |
# | `docker run -it image sh`       | Open container shell        |

# | Command                      | What it does                            |
# | ---------------------------- | --------------------------------------- |
# | `docker ps`                  | Show running containers                 |
# | `docker ps -a`               | Show all containers (running + stopped) |
# | `docker stop <container>`    | Stop container (NOT deleted)            |
# | `docker start <container>`   | Start stopped container                 |
# | `docker restart <container>` | Restart container                       |
# | `docker rm <container>`      | Delete container                        |
# | `docker rm $(docker ps -aq)` | Delete ALL containers                   |
# | `docker container prune`     | Delete all stopped containers           |

# | Command                          | What it does                   |
# | -------------------------------- | ------------------------------ |
# | `docker images`                  | List all images                |
# | `docker image ls`                | Same as above                  |
# | `docker pull postgres:15`        | Download image from Docker Hub |
# | `docker rmi <image>`             | Delete a specific image        |
# | `docker rmi $(docker images -q)` | Delete ALL images              |
# | `docker image prune`             | Remove unused images           |
# | `docker image prune -a`          | Remove ALL unused images       |
