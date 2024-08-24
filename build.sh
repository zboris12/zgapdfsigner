# !/bin/sh
# set -x

OUTFLDR=dist
if [ -d ${OUTFLDR} ]
then
	rm -f ${OUTFLDR}/*
else
	mkdir ${OUTFLDR}
fi

VER=$(sed -n -r "s/^.*\"version\": ?\"([0-9.]+)\".*$/\1/p" package.json)

GCCOPT="--charset UTF-8 --compilation_level SIMPLE_OPTIMIZATIONS --warning_level VERBOSE"
GCCEXT="--externs closure/google-ext.js --externs closure/forge-ext.js --externs closure/pdflib-ext.js --externs closure/zb-externs.js"
jss=""
while read js
do
	if [ -n "${js}" ]
	then
		c=$(echo "${js}" | cut -b1)
		if [ "$c" != "#" ]
		then
			outf="${OUTFLDR}/_${js}"
			if [ "${js}" = "zgaindex.js" ]
			then
				sed -e "s/\/\/Only for nodejs Start\/\//\/*/g" -e "s/\/\/Only for nodejs End\/\//*\//g" -e "s/ver: \"\"/ver: \"${VER}\"/" "lib/${js}" > "${outf}"
			else
				sed -e "s/\/\/Only for nodejs Start\/\//\/*/g" -e "s/\/\/Only for nodejs End\/\//*\//g" "lib/${js}" > "${outf}"
			fi
			if [ $? -eq 0 ]
			then
				echo "Created js file: ${outf}"
				jss="${jss} --js ${outf}"
			else
				echo "Failed create js file: ${outf}"
				exit 10
			fi
		fi
	fi
done <<EOF
zgafetch.js
zgacertsutil.js
zgapdfcryptor.js
zgapdfsigner.js
zgaindex.js
EOF
npx google-closure-compiler ${GCCOPT} ${GCCEXT} ${jss} --js_output_file ${OUTFLDR}/zgapdfsigner.min.js
if [ $? -eq 0 ]
then
	echo "Build result:"
	ls -l ${OUTFLDR}/*.min.js
else
	echo "google-closure-compiler failed."
	exit 20
fi

exit 0
