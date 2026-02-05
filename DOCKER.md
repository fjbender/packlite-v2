# Docker Quick Reference for Packlite

## Starting Services

Start MongoDB and Mongo Express:

```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (background).

## Stopping Services

Stop containers (keeps data):

```bash
docker-compose down
```

Stop and remove all data:

```bash
docker-compose down -v
```

## Viewing Status

Check running containers:

```bash
docker-compose ps
```

View logs (all services):

```bash
docker-compose logs -f
```

View logs (specific service):

```bash
docker-compose logs -f mongodb
docker-compose logs -f mongo-express
```

## Accessing Services

- **MongoDB**: `localhost:27017`
- **Mongo Express**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## Database Connection

```
mongodb://packlite_admin:packlite_password@localhost:27017/packlite?authSource=admin
```

This connection string is already set in `.env.local`.

## Troubleshooting

### Restart a specific service

```bash
docker-compose restart mongodb
```

### View container health

```bash
docker inspect packlite-mongodb --format='{{.State.Health.Status}}'
```

### Access MongoDB shell

```bash
docker exec -it packlite-mongodb mongosh -u packlite_admin -p packlite_password --authenticationDatabase admin
```

### Remove and rebuild

```bash
docker-compose down -v
docker-compose up -d --force-recreate
```

## Data Persistence

Data is stored in Docker volumes:

- `mongodb_data` - Database files
- `mongodb_config` - MongoDB configuration

To backup data:

```bash
docker exec packlite-mongodb mongodump --username packlite_admin --password packlite_password --authenticationDatabase admin --out /data/backup
```

## Resource Management

View resource usage:

```bash
docker stats packlite-mongodb packlite-mongo-express
```

Stop all Docker containers:

```bash
docker stop $(docker ps -aq)
```
