#!/bin/bash
echo "welcome"
ls
echo "This is script for upload files to by doing tar"
echo "$1"
echo "$2"
echo "$3"
cd /media/userdata/
cp -r  vgw_lte_handler.log filetotransfer/
cp -r  vgw_zwave_devmgr.log filetotransfer/
cp -r  vgw_nw_handler.log filetotransfer/
cp -r  zome_cli_0.log filetotransfer/
cp -r  zome_cli_1.log filetotransfer/
cp -r  restart_counter filetotransfer/
cp -r  microservices/zome-gateway-app/log/ filetotransfer/
cp -r  microservices/zome-gateway-agent/log/ filetotransfer/

# Store the last line of the file in a variable
last_line=$(tail -n 1 restart_counter)

# Extract the count value and date from the last line
count=$(echo $last_line | awk '{print $4}' | tr -d '()')
date=$(echo $last_line | awk '{$1=$2=$3=$4=""; print $0}' | sed 's/^[ \t]*//')

#gets time in epoch
curEpoch=$(date +%s)
#gets the mac id of eth0 interface
macID=$(ifconfig eth0 | grep HWaddr | awk '{ print $5 }')

mkdir filetotransfer/gwmac_$macID

tar -cvf filetotransfer/gwmac_$macID/syslogs_$curEpoch.tar filetotransfer/

file="filetotransfer/gwmac_$macID/syslogs_$curEpoch.tar"
bucket="$3"
resource="/${bucket}/${file}"
contentType="application/x-compressed-tar"
dateValue=`date -R`
stringToSign="PUT\n\n${contentType}\n${dateValue}\n${resource}"
# s3Key=AKIAUUJPLRJXMXX5S7GS
# s3Secret=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
s3Key="$1"
s3Secret="$2"
echo $s3Key
echo $s3Secret
signature=`echo -en ${stringToSign} | openssl sha1 -hmac ${s3Secret} -binary | base64`
curl -X PUT -T "${file}" \
    -H "Host: ${bucket}.s3.amazonaws.com" \
    -H "Date: ${dateValue}" \
    -H "Content-Type: ${contentType}" \
    -H "Authorization: AWS ${s3Key}:${signature}" \
    https://${bucket}.s3.amazonaws.com/${file}
rm -rf /media/userdata/filetotransfer/*


# permanently delete
# excecute follwoing command
# ./nitin.sh AKIAUUJPLRJXMXX5S7GS ujb0Dz3E0RixjkDEaNcj6rNWkYBQWbJbtNJe/I3H

# Ref links:
# https://gist.github.com/chrismdp/6c6b6c825b07f680e710
# https://tmont.com/blargh/2014/1/uploading-to-s3-in-bash
# https://stackoverflow.com/questions/44751574/uploading-to-amazon-s3-via-curl-route/44751929
# https://czak.pl/2015/09/15/s3-rest-api-with-curl.html