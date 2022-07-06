## Only run this script on development machine
if [ -z ${DB_NAME+x} ];
then
        echo "DB_NAME is unset";
        exit 1;
fi

echo "DB_NAME is set to '$DB_NAME'";

DATE=`date +%d-%m-%y_%H:%M:%S`
DBSAVE_FILENAME="schema-$DATE.sql"

# Export database data
pg_dump -s -x -O $DB_NAME > "SQL/schemas/current_schema.sql"
pg_dump -s -x -O $DB_NAME > "SQL/schemas/$DBSAVE_FILENAME"

exit 0;
