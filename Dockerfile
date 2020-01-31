FROM node:alpine3.10

# This works, but it takes over the terminal window that you run it in when you do the first build/run
# Buuuut then subsequent starts are fine. so...
ENTRYPOINT ["yarn", "--cwd", "app/", "start"]


# Rebuild and run:
# docker run -it --name ggj2020 --volume /home/tehdi/projects/react/ggj2020:/app $(docker build -q .)

# Start existing stopped:
# docker start ggj2020
# sh, if you want to. but it starts yarn on its own, so you don't need to.
# docker exec -it ggj2020 sh
