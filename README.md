# pipedrive-app

docker build -t yedaysal/pipedrive-app:1.0 .

docker run -d -p 8000:8080 --name pipedrive-app yedaysal/pipedrive-app:1.0

docker exec -it pipedrive-app /bin/bashh