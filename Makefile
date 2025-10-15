.DEFAULT_GOAL := help

.NOTPARALLEL: deploy-dev deploy-prod

.PHONY: help build deploy-dev deploy-prod upload-dev upload-prod

deploy-dev: build upload-dev
deploy-prod: build upload-prod

help:
	@printf "Available goals:\n"
	@printf "  build             — Build project\n"
	@printf "  deploy-dev        — Deploy main branch to dev server\n"
	@printf "  deploy-prod       — Deploy main branch to prod server\n"

upload-prod:
	scp -r dist deployer@18.198.250.222:/www/assistant-tma/

upload-dev:
	scp -r dist deployer@18.198.250.222:/www/assistant-tma-dev/

build:
	npm run build
