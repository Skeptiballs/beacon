# Deep Research Prompt: Maritime Technology Companies

## Objective
Find additional companies similar to the ones listed below that operate in the maritime technology sector, specifically focusing on:
- Vessel Traffic Services (VTS)
- Port Management Information Systems (PMIS)
- Port Community Systems (PCS)
- Coastal Surveillance (CS)
- Pilot Dispatch Management Systems (PDMS)
- AIS Network Management
- Terminal Operating Systems (TOS)
- Marine Hardware
- Marine Data services

## Existing Companies in Database

Here are examples of companies already in our database to understand the type and quality of companies we're looking for:

1. **724Solutions** - Maritime IT solutions provider specializing in vessel traffic services and port operations (Rotterdam, Netherlands)
2. **Actual IT** - Port management information systems and digitalization solutions (Helsinki, Finland)
3. **Signalis (Airbus)** - Integrated vessel traffic, port management, and coastal surveillance systems (Hamburg, Germany)
4. **Amura** - Coastal surveillance and maritime security solutions (Madrid, Spain)
5. **Awake.AI** - AI-powered port optimization platform (Turku, Finland)
6. **CBS Software** - Port community systems and terminal operating systems (Rotterdam, Netherlands)
7. **Cofano** - Port management software and terminal operating systems (Rotterdam, Netherlands)
8. **Copas** - Port community systems and single window solutions (Genoa, Italy)
9. **CSIC Pride** - Vessel traffic management systems (Wuhan, China)
10. **DBA Group** - Port management and logistics software (Copenhagen, Denmark)
11. **Denbridge Marine** - Vessel traffic services and maritime domain awareness (London, UK)
12. **Elman** - Maritime automation and control systems (Turku, Finland)
13. **Envision Digital** - Smart port and IoT platform solutions (Singapore)
14. **Experion Maritime** - Port call optimization and digital port solutions (Turku, Finland)
15. **Frequentis** - Communication and information systems for VTS and public safety (Vienna, Austria)
16. **Golden Trans** - Vessel traffic management and maritime communication systems (Shanghai, China)
17. **Grieg Connect** - Digital shipping and port technology solutions (Bergen, Norway)
18. **Harbour Mastery** - Marine management software for pilotage and harbour operations (Melbourne, Australia)
19. **IMIS Global** - Integrated maritime information systems (Rotterdam, Netherlands)
20. **Innovative Navigation (IN)** - Navigation and traffic management systems (Rotterdam, Netherlands)
21. **Indra Sistemas** - Global technology company providing VTS, port management, and defense systems (Madrid, Spain)
22. **Infoport** - Port community system for Port of Antwerp-Bruges (Antwerp, Belgium)
23. **Innovez One** - Smart port solutions and maritime surveillance (Mumbai, India)
24. **Inplan** - Port management and logistics planning software (Helsinki, Finland)
25. **Inport** - Digital port call and cargo handling solutions (Oslo, Norway)
26. **Insiris** - Maritime domain awareness and coastal surveillance (Arlington, USA)
27. **IT Partner** - Port and terminal management systems (Oslo, Norway)
28. **JRC (Japan Radio Co.)** - Marine electronics and vessel traffic management systems (Tokyo, Japan)
29. **Kale Logistics** - Port community systems and logistics solutions (Mumbai, India)
30. **Kongsberg NorControl** - Vessel traffic management, port operations, and maritime surveillance (Horten, Norway)
31. **Leonardo** - Aerospace and defense company providing radar, VTS, and integrated surveillance (Rome, Italy)
32. **Lockheed Martin** - Global aerospace and defense company with maritime traffic management solutions (Bethesda, USA)
33. **Marico Marine** - Maritime risk management, VTS, and port operations consultancy (North Shields, UK)
34. **MGI-CI5** - Port community systems and customs integration (Marseille, France)
35. **Navayuga Infotech** - Port management and logistics software (Hyderabad, India)
36. **Navielektro** - Vessel traffic services and coastal surveillance (Helsinki, Finland)
37. **Nicom Maritime** - Maritime communication and surveillance systems (Trondheim, Norway)
38. **Pilot Dispatch** - Pilot dispatch management, port operations, and maritime situational awareness (Brisbane, Australia)
39. **Polymathian** - AI-powered optimization platform for port operations (Melbourne, Australia)
40. **PortBase** - Port community system connecting Dutch maritime logistics chain (Rotterdam, Netherlands)
41. **Portchain** - AI-driven container terminal optimization and berth planning (Copenhagen, Denmark)
42. **Portel (GTD)** - Port community systems and cargo management (Madrid, Spain)
43. **PortXchange** - Port call optimization platform (Rotterdam, Netherlands)
44. **Prodevelop** - Port community systems and smart logistics (Valencia, Spain)
45. **Raytheon Technologies** - Defense and aerospace company with coastal surveillance and VTS solutions (Arlington, USA)
46. **Sercel** - Marine acoustic and seismic equipment manufacturer with maritime surveillance products (Nantes, France)
47. **Seaport OPX** - Port operations excellence platform (Houston, USA)
48. **Shiplogic** - Port call optimization and berth planning software (Rotterdam, Netherlands)
49. **SRT Marine Systems** - Maritime domain awareness systems including AIS and vessel tracking (Wymondham, UK)
50. **Thales** - Global technology company providing VTS, air traffic management, and defense systems (Paris, France)
51. **TimeZero** - Marine navigation software and charting systems (Vannes, France)
52. **Unikie** - Embedded systems and IoT solutions for port automation (Tampere, Finland)
53. **Vissim** - Port simulation, VTS training, and maritime traffic optimization (Rotterdam, Netherlands)
54. **Wärtsilä Voyage (PortLink)** - Comprehensive port operations platform (Helsinki, Finland)
55. **Webb Fontaine** - Customs and trade facilitation solutions with port community system capabilities (Dubai, UAE)
56. **Xanatos Marine** - Maritime surveillance and vessel traffic management systems (San Diego, USA)
57. **XST Technologies** - Maritime traffic management and vessel monitoring solutions (Sydney, Australia)
58. **Yantai Huadong Electronics** - Marine electronics and vessel traffic management systems manufacturer (Yantai, China)

## Required Data Format

Return the data as a JSON array of objects. Each company object must follow this exact structure:

```json
{
  "name": "Company Name",
  "website": "https://www.companywebsite.com",
  "linkedin_url": "https://linkedin.com/company/company-name",
  "hq_country": "XXX",
  "hq_city": "City Name",
  "categories": ["CATEGORY1", "CATEGORY2"],
  "summary": "Brief description of the company's maritime technology focus and solutions.",
  "employees": "EMPLOYEE_RANGE",
  "regions": ["REGION1", "REGION2"]
}
```

## Field Specifications

### Categories (REQUIRED - at least one)
Must be one or more of these exact codes:
- **VTS** - Vessel Traffic Services
- **HW** - Hardware
- **PMIS** - Port Management Information Systems
- **PCS** - Port Community Systems
- **CS** - Coastal Surveillance
- **PDMS** - Pilot Dispatch Management Systems
- **AIS** - AIS Network Management
- **TOS** - Terminal Operating Systems
- **MD** - Marine Data

### Regions (REQUIRED - at least one)
Must be one or more of these exact codes:
- **EU** - Europe
- **NA** - North America
- **AP** - Asia Pacific
- **LA** - Latin America

### Employee Ranges (REQUIRED)
Must be one of these exact strings:
- `"1-10"`
- `"11-50"`
- `"51-200"`
- `"201-500"`
- `"501-1000"`
- `"1001-5000"`
- `"5001-10000"`
- `"10001+"`

### HQ Country (REQUIRED)
Must be a 3-letter ISO country code (e.g., "NLD", "FIN", "USA", "GBR", "DEU", "FRA", "ESP", "ITA", "DNK", "NOR", "SWE", "BEL", "AUT", "CHN", "JPN", "IND", "SGP", "AUS", "ARE", etc.)

### HQ City (REQUIRED)
The city name where the company headquarters is located (e.g., "Rotterdam", "Helsinki", "London")

### Website (OPTIONAL but preferred)
Full URL including https://

### LinkedIn URL (OPTIONAL but preferred)
Full LinkedIn company page URL

### Summary (REQUIRED)
A concise 1-2 sentence description focusing on:
- What maritime technology solutions they provide
- Their primary focus area (VTS, PMIS, port operations, etc.)
- Target customers (ports, maritime authorities, terminals, etc.)

## Research Instructions

1. **Focus on companies that provide software, systems, or technology solutions** for:
   - Port operations and management
   - Vessel traffic management and monitoring
   - Maritime surveillance and domain awareness
   - Port community systems and logistics
   - Terminal operations
   - Pilot dispatch and maritime services
   - AIS and vessel tracking
   - Marine data and analytics

2. **Exclude**:
   - Pure shipping/logistics companies (unless they have significant technology divisions)
   - Shipbuilding companies (unless they have substantial software/technology divisions)
   - General IT consultancies (unless they specialize in maritime)
   - Companies that don't serve the maritime/port industry

3. **Geographic diversity**: Aim for a good mix across all regions (EU, NA, AP, LA)

4. **Size diversity**: Include companies of various sizes from startups to large enterprises

5. **Verify information**: Ensure company names, websites, and locations are accurate

6. **Avoid duplicates**: Check that companies aren't already in the list above

## Output Requirements

- Return at least 50-100 new companies
- Format as a valid JSON array
- Ensure all required fields are present
- Use exact category and region codes as specified
- Use exact employee range formats as specified
- Include accurate 3-letter ISO country codes
- Provide meaningful summaries that highlight maritime technology focus

## Example Output Format

```json
[
  {
    "name": "Example Maritime Tech",
    "website": "https://www.examplemaritime.com",
    "linkedin_url": "https://linkedin.com/company/example-maritime-tech",
    "hq_country": "GBR",
    "hq_city": "Southampton",
    "categories": ["PMIS", "VTS"],
    "summary": "Port management and vessel traffic systems provider for UK ports and maritime authorities.",
    "employees": "50-200",
    "regions": ["EU"]
  }
]
```

## Notes

- Companies can have multiple categories (e.g., ["PMIS", "VTS", "CS"])
- Companies can operate in multiple regions (e.g., ["EU", "NA", "AP"])
- If employee count is unknown, estimate based on company size indicators (website, LinkedIn, news)
- If exact city is unknown, use the most likely major city in that country
- Ensure all URLs are valid and properly formatted
