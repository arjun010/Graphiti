import csv

reader = csv.reader(open('nodesFile.csv','rb'))
header = reader.next()

writer = csv.writer(open('data.csv','wb'))
writer.writerow(['Name','PrimaryCategory','OtherCategories','SupportsSSL','Protocols'])

for line in reader:
	nodeType = line[header.index('type')]
	if nodeType == 'API':
		apiName = line[header.index('label')]
		primaryCategory = line[header.index('primaryCategory')]
		otherCategories = line[header.index('allCategories')].split(';')
		otherCategories[:] = [item for item in otherCategories if item != primaryCategory]
		otherCategories = ";".join(otherCategories)
		sslSupport = line[header.index('SSL_Support')]
		protocols = line[header.index('Protocols/Formats')].replace('|',';')

		writer.writerow([apiName,primaryCategory,otherCategories,sslSupport,protocols])