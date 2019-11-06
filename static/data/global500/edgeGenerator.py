import csv
from random import randint

reader = csv.reader(open("data.csv","rb"))
header = reader.next()

nodeList = []
for line in reader:
	nodeList.append(line)

def isCoveredEdge(newEdge,edgeList):
	for edge in edgeList:
		if edge==newEdge or (edge[1]==newEdge[0] and edge[0]==newEdge[1]):
			return 1

	return -1


coveredEdges = []
for i in range(0,500):
	index1 = randint(0,len(nodeList)-1)
	index2 = randint(0,len(nodeList)-1)
	while index2==index1 and isCoveredEdge([index1,index2],coveredEdges)==1:
		index1 = randint(0,len(nodeList)-1)
		index2 = randint(0,len(nodeList)-1)

	coveredEdges.append([index1,index2])

writer = csv.writer(open("edges.csv","wb"))
writer.writerow(["source","target"])

for edge in coveredEdges:
	writer.writerow([nodeList[edge[0]][header.index("Name")],nodeList[edge[1]][header.index("Name")]])