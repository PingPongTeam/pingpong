# UNDERSKRUV

###Deploy: 
Install heroku CLI https://devcenter.heroku.com/articles/heroku-cli

Login with heroku CLI https://devcenter.heroku.com/articles/heroku-cli#getting-started

Navigate to masterbranch root folder and run `heroku container:push web --app underskruv`

After the image is built and pushed to heroku container repository run `heroku container:release web --app underskruv`
