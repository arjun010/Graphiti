import os,csv,json
from flask import Flask, render_template, jsonify,request, session, redirect, url_for, _app_ctx_stack
from flask.ext.compress import Compress
import copy
import json
import re
import networkx as nx

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
Compress(app)

@app.route('/static/<name>')
def sendFile(fileName = None):
	return send_from_directory('static', fileName)


@app.route('/computeNetworkMetrics', methods=['POST'])
def computeNetworkMetrics():
	currentNetwork = json.loads(request.form['network'])
	nxG = nx.Graph()
	for node in currentNetwork['nodes']:
		nxG.add_node(node['id'])
	for link in currentNetwork['links']:
		nxG.add_edge(link['source']['id'],link['target']['id'])

	
	number_of_nodes = len(nx.nodes(nxG))
	number_of_edges = len(nx.edges(nxG))
	network_density = nx.density(nxG)
	average_clustering = nx.average_clustering(nxG)
	# average_shortest_path_length = nx.average_shortest_path_length(nxG)
	# number_of_cliques = nx.graph_number_of_cliques(nxG)

	# triangles = nx.triangles(nxG)
	# average_degree_connectivity = nx.average_degree_connectivity(nxG)
	return jsonify({
			"average_clustering":average_clustering,			
			"number_of_nodes" : number_of_nodes,
			"number_of_edges" : number_of_edges,			
			"network_density":network_density
		})

@app.route('/getNetwork', methods=['POST'])
def getNetworkJson():
	global currentNetwork
	currentNetwork = nx.MultiGraph()

	with open(APP_ROOT+'/static/data/'+request.form['directory']+'/network.json') as data_file:
		networkJson = json.load(data_file)
	
	for node in networkJson['nodes']:
		currentNetwork.add_node(node['id'])
	
	for link in networkJson['links']:
		# sourceNode = networkJson['nodes'][link['source']]
		# targetNode = networkJson['nodes'][link['target']]
		sourceNodeId = link['source']
		targetNodeId = link['target']
		weight = link['weight']
		if weight==1:
			currentNetwork.add_edge(sourceNodeId,targetNodeId)
		elif weight==2:
			currentNetwork.add_edge(sourceNodeId,targetNodeId)
			currentNetwork.add_edge(sourceNodeId,targetNodeId)

	# currentNetwork = currentNetwork.to_undirected()
	with open(APP_ROOT+'/static/data/'+request.form['directory']+'/nodeMap.json') as data_file:
		nodeMap = json.load(data_file)

	with open(APP_ROOT+'/static/data/'+request.form['directory']+'/edgeMap.json') as data_file:
		edgeMap = json.load(data_file)

	return jsonify({
			"network" : networkJson,
			"nodeMap" : nodeMap,
			"edgeMap" : edgeMap
		})

@app.route('/getDataAttributeMap', methods=['POST'])
def getDataAttributeMap():
	dataDirectory = request.form['dataDirectory']
	if dataDirectory == 'company':
		pass
	elif dataDirectory == 'test':
		initialDataTypeMap = {
			"Name" : {
				"type":"Categorical",
				"label":"Name"
			},
			"Sales" : {
				"type":"Number",
				"label":"Sales"
			},
			"PrimarySegment" : {
				"type":"Categorical",
				"label":"PrimarySegment"
			},
			"OtherSegments" : {
				"type":"List",
				"label":"OtherSegments"
			},
			"Employees" : {
				"type":"Number",
				"label":"Employees"
			}
		}
	elif dataDirectory == 'sci-fi':
		# body,created,url,title,score,comms_num,id
		# body,entity_PERSON_count,entity_LOC_count,entity_GPE_count,entity_TIME_count,entity_PERSON_values,topics,entity_DATE_values,negativeScore,entity_GPE_values,topicsWordCount,entity_CARDINAL_values,entity_WORK_OF_ART_count,date,entity_LAW_values,entity_QUANTITY_count,entity_LOC_values,entity_PERCENT_values,positiveScore,postScore,entity_ORG_count,entity_PERCENT_count,entity_MONEY_values,entity_WORK_OF_ART_values,entity_PRODUCT_values,entity_MONEY_count,entity_FAC_values,entity_TIME_values,title,entity_LANGUAGE_count,entity_PRODUCT_count,entity_ORG_values,entity_LANGUAGE_values,entity_LAW_count,entity_FAC_count,entity_EVENT_values,entity_QUANTITY_values,entity_CARDINAL_count,entity_EVENT_count,entity_DATE_count,commentsCount
		initialDataTypeMap = {
			"body" : {
				"type":"Categorical",
				"label":"body"
			},
			"entity_PERSON_values" : {
				"type":"List",
				"label":"entity_PERSON_values"
			},
			"topics" : {
				"type":"List",
				"label":"topics"
			},
			"entity_DATE_values" : {
				"type":"List",
				"label":"entity_DATE_values"
			},
			"negativeScore" : {
				"type":"Number",
				"label":"negativeScore"
			},
			"entity_GPE_values" : {
				"type":"List",
				"label":"entity_GPE_values"
			},
			"topicsWordCount" : {
				"type":"Number",
				"label":"topicsWordCount"
			},
			"entity_CARDINAL_values" : {
				"type":"List",
				"label":"entity_CARDINAL_values"
			},
			"date" : {
				"type":"Categorical",
				"label":"date"
			},
			"entity_LAW_values" : {
				"type":"List",
				"label":"entity_LAW_values"
			},
			"entity_LOC_values" : {
				"type":"List",
				"label":"entity_LOC_values"
			},
			"entity_PERCENT_values" : {
				"type":"List",
				"label":"entity_PERCENT_values"
			},
			"positiveScore" : {
				"type":"Number",
				"label":"positiveScore"
			},
			"postScore" : {
				"type":"Number",
				"label":"postScore"
			},
			"entity_MONEY_values" : {
				"type":"List",
				"label":"entity_MONEY_values"
			},
			"entity_WORK_OF_ART_values" : {
				"type":"List",
				"label":"entity_WORK_OF_ART_values"
			},
			"entity_PRODUCT_values" : {
				"type":"List",
				"label":"entity_PRODUCT_values"
			},
			"entity_FAC_values" : {
				"type":"List",
				"label":"entity_FAC_values"
			},
			"entity_TIME_values" : {
				"type":"List",
				"label":"entity_TIME_values"
			},
			"title" : {
				"type":"Categorical",
				"label":"title"
			},
			"entity_ORG_values" : {
				"type":"List",
				"label":"entity_ORG_values"
			},
			"entity_LANGUAGE_values" : {
				"type":"List",
				"label":"entity_LANGUAGE_values"
			},
			"entity_EVENT_values" : {
				"type":"List",
				"label":"entity_EVENT_values"
			},
			"entity_QUANTITY_values" : {
				"type":"List",
				"label":"entity_QUANTITY_values"
			},
			"commentsCount" : {
				"type":"Number",
				"label":"commentsCount"
			}
		}
	elif dataDirectory == 'euro-16':
		initialDataTypeMap = {
			"Foot" : {
				"type":"Categorical",
				"label":"Foot"
			},
			"Name" : {
				"type":"Categorical",
				"label":"Name"
			},
			"Position" : {
				"type":"Categorical",
				"label":"Position"
			},
			"Club" : {
				"type":"Categorical",
				"label":"Club"
			},
			"Country" : {
				"type":"Categorical",
				"label":"Country"
			},
			"Age" : {
				"type":"Number",
				"label":"Age"
			},
			"Salary" : {
				"type":"Number",
				"label":"Salary"
			},
			"Goals" : {
				"type":"Number",
				"label":"Goals"
			}
		}
	elif dataDirectory == 'crunchbase':
		initialDataTypeMap = {
			"name" : {
				"type" : "Categorical",
				"label" : "name"
			},
			"homepage_url" : {
				"type" : "Categorical",
				"label" : "homepage_url"
			},
			"category_list" : {
				"type" : "List",
				"label" : "category_list"
			},
			"funding_total_usd" : {
				"type" : "Number",
				"label" : "funding_total_usd"
			},
			"status" : {
				"type" : "Categorical",
				"label" : "status"
			},
			"country_code" : {
				"type" : "Categorical",
				"label" : "country_code"
			},
			"state_code" : {
				"type" : "Categorical",
				"label" : "state_code"
			},
			"region" : {
				"type" : "Categorical",
				"label" : "region"
			},
			"city" : {
				"type" : "Categorical",
				"label" : "city"
			},
			"funding_rounds" : {
				"type" : "Number",
				"label" : "funding_rounds"
			},
			"founded_at" : {
				"type" : "Categorical",
				"label" : "founded_at"
			},
			"founded_month" : {
				"type" : "Categorical",
				"label" : "founded_month"
			},
			"founded_quarter" : {
				"type" : "Categorical",
				"label" : "founded_quarter"
			},
			"founded_year" : {
				"type" : "Categorical",
				"label" : "founded_year"
			},
			"first_funding_at" : {
				"type" : "Categorical",
				"label" : "first_funding_at"
			},
			"last_funding_at" : {
				"type" : "Categorical",
				"label" : "last_funding_at"
			},
			"first_funding_year" : {
				"type" : "Categorical",
				"label" : "first_funding_year"
			},
			"last_funding_year" : {
				"type" : "Categorical",
				"label" : "last_funding_year"
			}

		}
	elif dataDirectory == 'apis':
		initialDataTypeMap = {
			"Name" : {
				"type":"Categorical",
				"label":"Name"
			},
			"PrimaryCategory" : {
				"type":"Categorical",
				"label":"PrimaryCategory"
			},
			"OtherCategories" : {
				"type":"List",
				"label":"OtherCategories"
			},
			"SupportsSSL" : {
				"type":"Categorical",
				"label":"SupportsSSL"
			},
			"Protocols" : {
				"type":"List",
				"label":"Protocols"
			}
		}
	elif dataDirectory == 'global500':
		initialDataTypeMap = {
			"Name" : {
				"type":"Categorical",
				"label":"Name"
			},
			"Revenue" : {
				"type":"Number",
				"label":"Revenue"
			},
			"Profits" : {
				"type":"Number",
				"label":"Profits"
			},
			"Assets" : {
				"type":"Number",
				"label":"Assets"
			},
			"MarketValue" : {
				"type":"Number",
				"label":"MarketValue"
			},
			"Employees" : {
				"type":"Number",
				"label":"Employees"
			},
			"Industry" : {
				"type":"Categorical",
				"label":"Industry"
			},
			"City" : {
				"type":"Categorical",
				"label":"City"
			},
			"State" : {
				"type":"Categorical",
				"label":"State"
			},
			"Country" : {
				"type":"Categorical",
				"label":"Country"
			},
			"Region" : {
				"type":"Categorical",
				"label":"Region"
			},
			"EconomicPole" : {
				"type":"Categorical",
				"label":"EconomicPole"
			},
			"Ticker" : {
				"type":"Categorical",
				"label":"Ticker"
			},
			"CeoTitle" : {
				"type":"Categorical",
				"label":"CeoTitle"
			}
		}
	elif dataDirectory == "sdc-energy":
		initialDataTypeMap = {
			"name" : {
				"type" : "Categorical",
				"label" : "name"
			},
			"primarySegment" : {
				"type" : "Categorical",
				"label" : "primarySegment"
			},
			"allSegments" : {
				"type" : "List",
				"label" : "allSegments"
			},
			"SIC" : {
				"type" : "Categorical",
				"label" : "SIC"
			},
			"country" : {
				"type" : "Categorical",
				"label" : "country"
			},
			"latitude" : {
				"type" : "Number",
				"label" : "latitude"
			},
			"longitude" : {
				"type" : "Number",
				"label" : "longitude"
			}
		}
	elif dataDirectory == "imdb":
		initialDataTypeMap = {
		  "color": {
		    "type": "Categorical",
		    "label": "color"
		  },
		  "director_name": {
		    "type": "Categorical",
		    "label": "director_name"
		  },
		  "num_critic_for_reviews": {
		    "type": "Number",
		    "label": "num_critic_for_reviews"
		  },
		  "duration": {
		    "type": "Number",
		    "label": "duration"
		  },
		  "director_facebook_likes": {
		    "type": "Number",
		    "label": "director_facebook_likes"
		  },
		  "actor_3_facebook_likes": {
		    "type": "Number",
		    "label": "actor_3_facebook_likes"
		  },
		  "actor_2_name": {
		    "type": "Categorical",
		    "label": "actor_2_name"
		  },
		  "actor_1_facebook_likes": {
		    "type": "Number",
		    "label": "actor_1_facebook_likes"
		  },
		  "gross": {
		    "type": "Number",
		    "label": "gross"
		  },
		  "genres": {
		    "type": "List",
		    "label": "genres"
		  },
		  "actor_1_name": {
		    "type": "Categorical",
		    "label": "actor_1_name"
		  },
		  "movie_title": {
		    "type": "Categorical",
		    "label": "movie_title"
		  },
		  "num_voted_users": {
		    "type": "Number",
		    "label": "num_voted_users"
		  },
		  "cast_total_facebook_likes": {
		    "type": "Number",
		    "label": "cast_total_facebook_likes"
		  },
		  "actor_3_name": {
		    "type": "Categorical",
		    "label": "actor_3_name"
		  },
		  "facenumber_in_poster": {
		    "type": "Number",
		    "label": "facenumber_in_poster"
		  },
		  "plot_keywords": {
		    "type": "List",
		    "label": "plot_keywords"
		  },
		  "movie_imdb_link": {
		    "type": "Categorical",
		    "label": "movie_imdb_link"
		  },
		  "num_user_for_reviews": {
		    "type": "Number",
		    "label": "num_user_for_reviews"
		  },
		  "language": {
		    "type": "Categorical",
		    "label": "language"
		  },
		  "country": {
		    "type": "Categorical",
		    "label": "country"
		  },
		  "content_rating": {
		    "type": "Categorical",
		    "label": "content_rating"
		  },
		  "budget": {
		    "type": "Number",
		    "label": "budget"
		  },
		  "title_year": {
		    "type": "Categorical",
		    "label": "title_year"
		  },
		  "actor_2_facebook_likes": {
		    "type": "Number",
		    "label": "actor_2_facebook_likes"
		  },
		  "imdb_score": {
		    "type": "Number",
		    "label": "imdb_score"
		  },
		  "aspect_ratio": {
		    "type": "Categorical",
		    "label": "aspect_ratio"
		  },
		  "movie_facebook_likes": {
		    "type": "Number",
		    "label": "movie_facebook_likes"
		  }
		}
	elif dataDirectory == "imdb-demo":
		initialDataTypeMap = {
		  "director_name": {
		    "type": "Categorical",
		    "label": "director_name"
		  },
		  "duration": {
		    "type": "Number",
		    "label": "duration"
		  },
		  "actor_2_name": {
		    "type": "Categorical",
		    "label": "actor_2_name"
		  },
		  "gross": {
		    "type": "Number",
		    "label": "gross"
		  },
		  "genres": {
		    "type": "List",
		    "label": "genres"
		  },
		  "actor_1_name": {
		    "type": "Categorical",
		    "label": "actor_1_name"
		  },
		  "movie_title": {
		    "type": "Categorical",
		    "label": "movie_title"
		  },
		  "actor_3_name": {
		    "type": "Categorical",
		    "label": "actor_3_name"
		  },
		  "plot_keywords": {
		    "type": "List",
		    "label": "plot_keywords"
		  },
		  "movie_imdb_link": {
		    "type": "Categorical",
		    "label": "movie_imdb_link"
		  },
		  "content_rating": {
		    "type": "Categorical",
		    "label": "content_rating"
		  },
		  "budget": {
		    "type": "Number",
		    "label": "budget"
		  },
		  "title_year": {
		    "type": "Categorical",
		    "label": "title_year"
		  },
		  "imdb_score": {
		    "type": "Number",
		    "label": "imdb_score"
		  },
		  "movie_facebook_likes": {
		    "type": "Number",
		    "label": "movie_facebook_likes"
		  }
		}

	return jsonify({
		"dataAttributeMap":initialDataTypeMap
	})

@app.route('/processCSV', methods=['POST'])
def processCSV():
	dataDirectory = request.form['dataDirectory']
	aggregationAttribute = request.form['aggregationAttribute']
	linkingAttribute = request.form['linkingAttribute']

	print(dataDirectory)
	print("linkingAttribute: ", linkingAttribute)
	
	if dataDirectory == 'company':
		pass
	elif dataDirectory == 'test':
		initialDataTypeMap = {
			"Name" : "Categorical",
			"Sales" : "Number",
			"PrimarySegment" : "Categorical",
			"OtherSegments" : "List",
			"Employees" : "Number"
		}
	elif dataDirectory == 'sci-fi':
		# body,created,url,title,score,comms_num,id
		initialDataTypeMap = {
			"body" : "Categorical",
			"entity_PERSON_values" : "List",
			"topics" : "List",
			"entity_DATE_values" : "List",
			"negativeScore" : "Number",
			"entity_GPE_values" : "List",
			"topicsWordCount" : "Number",
			"entity_CARDINAL_values" : "List",
			"date" : "Categorical",
			"entity_LAW_values" : "List",
			"entity_LOC_values" : "List",
			"entity_PERCENT_values" : "List",
			"positiveScore" : "Number",
			"postScore" : "Number",
			"entity_MONEY_values" : "List",
			"entity_WORK_OF_ART_values" : "List",
			"entity_PRODUCT_values" : "List",
			"entity_FAC_values" : "List",
			"entity_TIME_values" : "List",
			"title" : "Categorical",
			"entity_ORG_values" : "List",
			"entity_LANGUAGE_values" : "List",
			"entity_EVENT_values" : "List",
			"entity_QUANTITY_values" : "List",
			"commentsCount" : "Number"
		}
	elif dataDirectory == 'euro-16':
		initialDataTypeMap = {
			"Foot" : "Categorical",
			"Name" : "Categorical",
			"Position" : "Categorical",
			"Club" : "Categorical",
			"Country" : "Categorical",
			"Age" : "Number",
			"Salary" : "Number",
			"Goals" : "Number"
		}
	elif dataDirectory == 'apis':
		initialDataTypeMap = {
			"Name" : "Categorical",
			"PrimaryCategory" : "Categorical",
			"OtherCategories" : "List",
			"SupportsSSL" : "Categorical",
			"Protocols" : "List"
		}
	elif dataDirectory == 'global500':
		initialDataTypeMap = {
			"Name" : "Categorical",
			"Revenue" : "Number",
			"Profits" : "Number",
			"Assets" : "Number",
			"MarketValue" : "Number",
			"Employees" : "Number",
			"Industry" : "Categorical",
			"City" : "Categorical",
			"State" : "Categorical",
			"Country" : "Categorical",
			"Region" : "Categorical",
			"EconomicPole" : "Categorical",
			"Ticker" : "Categorical",
			"CeoTitle" : "Categorical",
		}
	elif dataDirectory == "sdc-energy":
		initialDataTypeMap = {
			"name" : "Categorical",
			"primarySegment" : "Categorical",
			"allSegments" : "List",
			"country" : "Categorical",
			"SIC" : "Categorical",
			"latitude" : "Number",
			"longitude" : "longitude"
		}
	elif dataDirectory == "crunchbase":									
		initialDataTypeMap = {
			"name" : "Categorical",
			"homepage_url" : "Categorical",
			"category_list" : "List",
			"funding_total_usd" : "Number",
			"status" : "Categorical",
			"country_code" : "Categorical",
			"state_code" : "Categorical",
			"region" : "Categorical",
			"city" : "Categorical",
			"funding_rounds" : "Number",
			"founded_at" : "Categorical",
			"founded_month" : "Categorical",
			"founded_quarter" : "Categorical",
			"founded_year" : "Categorical",
			"first_funding_at" : "Categorical",
			"last_funding_at" : "Categorical",
			"first_funding_year" : "Categorical",
			"last_funding_year" : "Categorical"
		}
	elif dataDirectory == "imdb":
		initialDataTypeMap = {
			"color" : "Categorical",
		    "director_name": "Categorical",
		    "num_critic_for_reviews": "Number",
		    "duration": "Number",
		    "director_facebook_likes": "Number",
		    "actor_3_facebook_likes": "Number",
		    "actor_2_name": "Categorical",
		    "actor_1_facebook_likes": "Number",
		    "gross": "Number",
		    "genres": "List",
		    "actor_1_name": "Categorical",
		    "movie_title": "Categorical",
		    "num_voted_users": "Number",
		    "cast_total_facebook_likes": "Number",
		    "actor_3_name": "Categorical",
		    "facenumber_in_poster": "Number",
		    "plot_keywords": "List",
		    "movie_imdb_link": "Categorical",
		    "num_user_for_reviews": "Number",
		    "language": "Categorical",
		    "country": "Categorical",
		    "content_rating": "Categorical",
		    "budget": "Number",
		    "title_year": "Categorical",
		    "actor_2_facebook_likes": "Number",
		    "imdb_score": "Number",
		    "aspect_ratio": "Categorical",
		    "movie_facebook_likes": "Number"
		}

	elif dataDirectory == "imdb-demo":
		initialDataTypeMap = {
			"director_name": "Categorical",
		    "duration": "Number",
		    "actor_2_name": "Categorical",
		    "gross": "Number",
		    "genres": "List",
		    "actor_1_name": "Categorical",
		    "movie_title": "Categorical",
		    "actor_3_name": "Categorical",
		    "plot_keywords": "List",
		    "movie_imdb_link": "Categorical",
		    "content_rating": "Categorical",
		    "budget": "Number",
		    "title_year": "Categorical",
		    "imdb_score": "Number",
		    "movie_facebook_likes": "Number"
		}

	csvReader = csv.reader(open(APP_ROOT+"/static/data/"+dataDirectory+"/data.csv","r"))
	header = next(csvReader)
	dataList = []

	attributeStatsMap = {}
	for row in csvReader:
		rowItem = {}
		for attribute in header:
			if attribute not in attributeStatsMap:				
				attributeStatsMap[attribute] = {
					"values" : []
				}
			if initialDataTypeMap[attribute] == "Categorical":				
				if row[header.index(attribute)] not in attributeStatsMap[attribute]['values']:
					attributeStatsMap[attribute]['values'].append(row[header.index(attribute)])
			elif initialDataTypeMap[attribute] == "Number":
				attributeStatsMap[attribute]['values'].append(row[header.index(attribute)])

			rowItem[attribute] = row[header.index(attribute)]

		dataList.append(rowItem)

	dataAttributeMap = {}
	for attribute in initialDataTypeMap:
		if initialDataTypeMap[attribute] == "Number":
			if len(attributeStatsMap[aggregationAttribute]["values"])!=len(dataList):
				dataAttributeMap[attribute] = {
					"label" : "SUM(" + attribute + ")",
					"type" : initialDataTypeMap[attribute]
				}
			else:
				dataAttributeMap[attribute] = {
					"label" : attribute,
					"type" : initialDataTypeMap[attribute]
				}
		else:
			dataAttributeMap[attribute] = {
					"label" : attribute,
					"type" : initialDataTypeMap[attribute]
				}

	nodeList = []
	nodeIdMap = {}

	nodeCounter = 0 
	aggregatedValueMap = {}
	for value in attributeStatsMap[aggregationAttribute]["values"]: # go through all values for aggregation attribute		
		aggregatedValueMap[value] = {}
		for attribute in dataAttributeMap: # go through all available attributes
			if attribute!=aggregationAttribute: # skip aggregation attribute and initialize empty aggregation attribute map
				if dataAttributeMap[attribute]['type'] == "Number":
					aggregatedValueMap[value][attribute] = 0.0
				elif dataAttributeMap[attribute]['type'] == "Categorical":
					aggregatedValueMap[value][attribute] = {}
				elif dataAttributeMap[attribute]['type'] == "List":
					aggregatedValueMap[value][attribute] = []
				for dataObj in dataList: # pass through all dataset rows and compute aggregated values
					
					if dataAttributeMap[attribute]['type'] == "Number":
						if dataObj[attribute] == "":
							dataObj[attribute] = 0.0
					
					if dataObj[aggregationAttribute] == value: # if current row's value is the same as the aggregated value
						if dataAttributeMap[attribute]['type'] == "Number":							
							aggregatedValueMap[value][attribute] += float(dataObj[attribute])
						elif dataAttributeMap[attribute]['type'] == "Categorical":
							if dataObj[attribute] not in aggregatedValueMap[value][attribute]:
								aggregatedValueMap[value][attribute][dataObj[attribute]] = 1
							else:
								aggregatedValueMap[value][attribute][dataObj[attribute]] += 1
						elif dataAttributeMap[attribute]['type'] == "List":
							if dataObj[attribute] not in aggregatedValueMap[value][attribute]:
								if ';' in dataObj[attribute]:
									for splitVal in dataObj[attribute].split(';'): # split the list strings by  ';'
										if splitVal not in aggregatedValueMap[value][attribute]:
											aggregatedValueMap[value][attribute].append(splitVal)
								elif '|' in dataObj[attribute]:
									for splitVal in dataObj[attribute].split('|'): # split the list strings by  '|'
										if splitVal not in aggregatedValueMap[value][attribute]:
											aggregatedValueMap[value][attribute].append(splitVal)

		# create new node and initialize with aggregation attribute and id
		newNode = {
			"id" : aggregationAttribute+"-"+str(nodeCounter),
			aggregationAttribute : value,
			"nodeType" : aggregationAttribute
		}
		for attribute in aggregatedValueMap[value]: # iterate through remaining attributes and add to new node
			newNode[attribute] = aggregatedValueMap[value][attribute]

		# append new node to node list
		nodeList.append(newNode)
		nodeCounter += 1
		nodeIdMap[newNode["id"]] = newNode

	predefinedEdgeList = []
	predefinedEdgeMap = {}
	if linkingAttribute!="": # construct the edge list using the edge csv file
		edgeCSVReader = csv.reader(open(APP_ROOT+"/static/data/"+dataDirectory+"/edges.csv","rb"))
		header = edgeCSVReader.next()
		for row in edgeCSVReader:
			sourceNodeVal = row[header.index("source")]
			targetNodeVal = row[header.index("target")]
			sourceNodeId = getNodeId(nodeIdMap,linkingAttribute,sourceNodeVal)
			targetNodeId = getNodeId(nodeIdMap,linkingAttribute,targetNodeVal)
			predefinedEdgeList.append({
					"sourceNodeId" : sourceNodeId,
					"targetNodeId" : targetNodeId
				})
			if sourceNodeId not in predefinedEdgeMap:
				predefinedEdgeMap[sourceNodeId] = {}
				predefinedEdgeMap[sourceNodeId][targetNodeId] = 1
			else:
				predefinedEdgeMap[sourceNodeId][targetNodeId] = 1
			if targetNodeId not in predefinedEdgeMap:
				predefinedEdgeMap[targetNodeId] = {}
				predefinedEdgeMap[targetNodeId][sourceNodeId] = 1
			else:
				predefinedEdgeMap[targetNodeId][sourceNodeId] = 1

	return jsonify({
			"nodeList" : nodeList,
			"nodeIdMap" : nodeIdMap,
			"dataAttributeMap" : dataAttributeMap,
			"predefinedEdgeList" : predefinedEdgeList,
			"predefinedEdgeMap" : predefinedEdgeMap
		})

def getNodeId(nodeMap,linkingAttribute,nodeValue):
	for nodeId in nodeMap:
		node = nodeMap[nodeId]
		if node[linkingAttribute] == nodeValue:
			return nodeId

	return -1

@app.route('/v2')
def renderV2():
	return render_template('v2.html')

@app.route('/')
def renderIndexMain():
	return render_template('index.html')

if __name__ == "__main__":
	app.run(debug=True,threaded=True,port=5000)