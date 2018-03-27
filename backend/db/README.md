Creating dump of schema:
$ pg_dump --schema-only pingpong > pingpong_db.template

Restore with:
$ psql pingpong < pingpong_db.template
