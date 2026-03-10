#!/bin/bash
cd /home/ec2-user/movieBot/movie
node_path="~/.nvm/versions/node/v25.8.0/bin/node"
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_bms.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_cinepolis_imax.js &
wait