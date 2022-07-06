echo "Restoring saved data to '$DB_NAME'";

if [ -z ${NODE_ENV+x} ];
then
        echo "NODE_ENV not set";
        exit 1;
fi
if [ -n "$DB_NAME" ]; then
        echo "DB_NAME is set to '$DB_NAME'";

        host=${DB_HOST:-"localhost"}
        v=${x:-"Hello"}
        port=${DB_PORT:-"5432"}
        url=postgres://$DB_USER:$DB_PASSWORD@$host:$port/$DB_NAME?sslmode=allow;
elif [ -n "$DATABASE_URL" ]; then
        echo "DATABASE_URL is set to '$DATABASE_URL'";
        url=$DATABASE_URL;
fi

echo "Node Environment: $NODE_ENV";
BACKUP_DIR="SQL/local-backups"
BACKUP_FILE="$BACKUP_DIR/db_backup_$NODE_ENV.sql"

# Import saved data into database
if test -f "$BACKUP_FILE"; then
        psql $url -c "\i $BACKUP_FILE"
fi
