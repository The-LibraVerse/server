echo "Saving database to backup";

if [ -z ${DB_NAME+x} ];
then echo "DB_NAME is unset";
        exit 1;
fi

if [ -z ${NODE_ENV+x} ];
then
        echo "NODE_ENV not set. $NODE_ENV";
        exit 1;
fi

echo "DB_NAME is set to '$DB_NAME'";
echo "Node environment: $NODE_ENV";

if [ -z ${host+x} ];
then
        host='localhost';
fi

if [ -z ${port+x} ];
then
        port=5432;
        echo $port;
fi

echo "Node Environment: $NODE_ENV";
url=postgres://$DB_USER:$DB_PASSWORD@$host:$port/$DB_NAME?sslmode=allow;

DATE=`date +%d-%m-%y_%H:%M:%S`
BACKUP_DIR="SQL/local-backups"
DBSAVE_FILENAME="$BACKUP_DIR/db_backup_$NODE_ENV-$DATE.sql"
if [ ! -d SQL/local-backups ]; then
        mkdir -p SQL/local-backups;
fi

# Backup database
pg_dump -a -O $url > "$DBSAVE_FILENAME"
# pg_dump -a -O $url $DB_NAME > "$DBSAVE_FILENAME" --username=$DB_USER --password
# pg_dump -a -O $DB_NAME > "$BACKUP_DIR/db_backup_$NODE_ENV.sql"
pg_dump -a -O $url > "$BACKUP_DIR/db_backup_$NODE_ENV.sql"
