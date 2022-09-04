# pipedrive-app

docker build -t yedaysal/pipedrive-app:1.0 .

docker run -d -p 49160:8080 -n pipedrive-app yedaysal/pipedrive-app:1.0