#!/bin/bash
cd /home/ec2-user/movieBot/movie
node --no-warnings check.js &
node --no-warnings check_bms.js &
node --no-warnings check_cinepolis_imax.js &
wait