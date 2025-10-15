.DEFAULT_GOAL := help

.NOTPARALLEL: deploy-dev deploy-prod

.PHONY: help build-dev build-prod deploy-dev deploy-prod upload-dev upload-prod

deploy-dev: build-dev upload-dev
deploy-prod: build-prod upload-prod

help:
	@printf "Available goals:\n"
	@printf "  build-dev         — Build project for development\n"
	@printf "  build-prod        — Build project for production\n"
	@printf "  deploy-dev        — Deploy main branch to dev server\n"
	@printf "  deploy-prod       — Deploy main branch to prod server\n"

upload-prod:
	scp -r dist deployer@18.198.250.222:/www/assistant-tma/

upload-dev:
	scp -r dist deployer@18.198.250.222:/www/assistant-tma-dev/

build-dev:
	npm run build:dev

build-prod:
	npm run build:prod
