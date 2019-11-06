import csv,json

nodesFileReader = csv.reader(open('nodesFile.csv','rb'))
nodeHeader = nodesFileReader.next()

nodeMap = {}

for row in nodesFileReader:
	name = row[nodeHeader.index('label')]
	primarySegment = row[nodeHeader.index('primaryCategory')]
	
	allSegmentVals = row[nodeHeader.index('allCategories')]

	country = row[nodeHeader.index('country')]
	sic = row[nodeHeader.index('SIC')]
	latitude = row[nodeHeader.index('latitude')]
	longitude = row[nodeHeader.index('longitude')]

	nodeId = row[nodeHeader.index('id')]

	subrow = [name,primarySegment,allSegmentVals,country,sic,latitude,longitude,nodeId]
	if '' not in subrow:
		allSegments = []
		for val in allSegmentVals.split(';'):
			if val!='':
				allSegments.append(val)
		print allSegments, ';'.join(allSegments)
		nodeMap[nodeId] = {
			"name" : name,
			"primarySegment" : primarySegment,
			"allSegments" : ';'.join(allSegments),
			"country" : country,
			"SIC" : sic,
			"latitude" : latitude,
			"longitude" : longitude
		}

edgeFileReader = csv.reader(open('edgesFile.csv','rb'))
edgeHeader = edgeFileReader.next()

nodeFileWriter = csv.writer(open('../data.csv','wb'))
nodeFileWriter.writerow(['name','primarySegment','allSegments','country','SIC','latitude','longitude'])

edgeFileWriter = csv.writer(open('../edges.csv','wb'))
edgeFileWriter.writerow(['source','target'])

usefulNodes = []

for row in edgeFileReader:
	sourceId = row[edgeHeader.index('node1')]
	targetId = row[edgeHeader.index('node2')]
	# print sourceId, targetId
	if sourceId in nodeMap and targetId in nodeMap:
		if sourceId not in usefulNodes:
			usefulNodes.append(sourceId)
		if targetId not in usefulNodes:
			usefulNodes.append(targetId)	
		
		edgeFileWriter.writerow([nodeMap[sourceId]['name'],nodeMap[targetId]['name']])
	# else:
	# 	print 'here'

for nodeId in usefulNodes:
	node = nodeMap[nodeId]
	nodeFileWriter.writerow([node['name'],node['primarySegment'],node['allSegments'],node['country'],node['SIC'],node['latitude'],node['longitude']])