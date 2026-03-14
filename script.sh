#!/bin/bash
cd /Users/subham/My\ Drive/MovieBot/movie/
node_path="/Users/subham/.nvm/versions/node/v18.12.0/bin/node"
# NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check.js &
# NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_bms.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings automationWorking.js &s
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_pvr_vr_imax.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_pvr_vega_imax.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_pvr_kormangla_imax.js &
NODE_OPTIONS="--dns-result-order=ipv4first" $node_path --no-warnings check_cinepolis_imax.js &
wait
