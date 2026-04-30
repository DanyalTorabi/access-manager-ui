.PHONY: dev build type-check lint preview generate-types \
        docker-build docker-up docker-down docker-logs

dev:
	npm run dev

build:
	npm run build

type-check:
	npx tsc -b --noEmit

lint:
	npm run lint

preview:
	npm run preview

generate-types:
	npm run generate-types

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
