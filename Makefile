COMPOSE_BUILD = docker-compose -f docker-compose.yml
NAME = transcendence_dev

GREEN = \033[0;32m
RESET = \033[0m


all: build


ssl:
	@echo "$(GREEN)Generating SSL certificates...$(RESET)"
	@mkdir -p nginx/ssl
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/transcendence.key \
		-out nginx/ssl/transcendence.crt \
		-subj "/C=MA/ST=Khouribga/L=Khouribga/O=1337/CN=localhost"


build: ssl
	@echo "$(GREEN)Starting Transcendence in Build Mode...$(RESET)"
	$(COMPOSE_BUILD) up --build

stop:
	@echo "$(GREEN)Stopping containers...$(RESET)"
	$(COMPOSE_BUILD) stop

down:
	@echo "$(GREEN)Removing containers...$(RESET)"
	$(COMPOSE_BUILD) down

clean:
	@echo "$(GREEN)Cleaning up Docker system and certificates...$(RESET)"
	$(COMPOSE_BUILD) down --rmi all --volumes --remove-orphans
	rm -rf nginx/ssl

fclean:	clean
	docker system prune -af --volumes

logs:
	$(COMPOSE_BUILD) logs -f

ps:
	$(COMPOSE_BUILD) ps

.PHONY: all build ssl stop down clean logs ps