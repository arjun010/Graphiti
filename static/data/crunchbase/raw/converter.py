import csv

# permalink	name	homepage_url	category_list	 funding_total_usd 	status	country_code	state_code	region	city	funding_rounds	founded_at	founded_month	founded_quarter	founded_year	first_funding_at	last_funding_at

reader = csv.reader(open('companies.csv','rb'))
header = reader.next()

companyList = []
for line in reader:
	company = {}
	fundingIndex = header.index('funding_total_usd')
	stateIndex = header.index('state_code')

	if line[stateIndex] == 'CA':
		for i in range(0,len(line)):
			if fundingIndex == i:
				try:
					company[header[i]] = int(line[i])
				except:
					company[header[i]] = 0
			else:
				company[header[i]] = line[i]

		companyList.append(company)

sortedCompanyList = sorted(companyList, key=lambda k: k['funding_total_usd'], reverse=True)
writer = csv.writer(open('data.csv','wb'))
writer.writerow(header+['first_funding_year','last_funding_year'])

companyCount = 0
for company in sortedCompanyList:
	skip = -1
	for attr in header:
		if company[attr]=='':
			skip = 1
			break
	
	if skip==-1:
		company['first_funding_year'] = company['first_funding_at'][:4]
		company['last_funding_year'] = company['last_funding_at'][:4]
		row = []
		for attr in header+['first_funding_year','last_funding_year']:
			row.append(company[attr])
		writer.writerow(row)
		companyCount += 1

	if companyCount > 500:
		break