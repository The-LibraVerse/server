echo "Importing latest database schema";

if [ -z ${NODE_ENV+x} ];
then
        echo "NODE_ENV not set";
        exit 1;
fi
if [ -n "$DATABASE_URL" ]; then
        echo "DATABASE_URL is set to '$DATABASE_URL'";
        url=$DATABASE_URL;
elif [ -n "$DB_NAME" ]; then
        echo "DB_NAME is set to '$DB_NAME'";

        host=${DB_HOST:-"localhost"}
        v=${x:-"Hello"}
        port=${DB_PORT:-"5432"}
        url=postgres://$DB_USER:$DB_PASSWORD@$host:$port/$DB_NAME?sslmode=allow;
else
        echo "DB_NAME is unset";
        exit 1;
fi

echo "Node Environment: $NODE_ENV";

SCHEMA_FILE="SQL/schemas/current_schema.sql"; 

psql $url -c "DROP SCHEMA public CASCADE;";
psql $url -c "CREATE SCHEMA public;";

psql $url -c "\i $SCHEMA_FILE"
