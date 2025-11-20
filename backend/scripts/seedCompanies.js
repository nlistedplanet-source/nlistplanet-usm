import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/NSE_India_logo.svg/1200px-NSE_India_logo.svg.png",
    "CompanyName": "National Stock Exchange of",
    "ScripName": "NSE India",
    "ISIN": "INE721I01024",
    "PAN": "AAACN1797L",
    "CIN": "U67120MH1992PLC069769",
    "RegistrationDate": "27/11/1992",
    "Sector": "Financial Service"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/SBI_Mutual_Fund_Logo.svg/640px-SBI_Mutual_Fund_Logo.svg.png",
    "CompanyName": "SBI Funds Management",
    "ScripName": "SBI AMC",
    "ISIN": "INE640G01020",
    "PAN": "AAACS7339D",
    "CIN": "U65990MH1992PLC065256",
    "RegistrationDate": "07/02/1992",
    "Sector": "Financial Service"
  },
  {
    "Logo": "https://seeklogo.com/vector-logo/480639/zepto.png",
    "CompanyName": "Zepto Private Limited",
    "ScripName": "Zepto",
    "ISIN": "INE143401029",
    "PAN": "AAICK4821A",
    "CIN": "U46909MH2020PTC351336",
    "RegistrationDate": "05/12/2020",
    "Sector": "eCommerce"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/d/de/Airtel_Payments_Bank_logo.svg/1280px-Airtel_Payments_Bank_logo.svg.png",
    "CompanyName": "Airtel Payments Bank Limited",
    "ScripName": "Airtel Payments",
    "ISIN": "INE360U01018",
    "PAN": "AAICA4398J",
    "CIN": "U65100DL2010PLC201058",
    "RegistrationDate": "01/04/2010",
    "Sector": "Bank"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/5/59/Goa_Shipyard_Limited_Logo.svg",
    "CompanyName": "Goa Shipyard Limited",
    "ScripName": "Goa Shipyard",
    "ISIN": "INE178Z01013",
    "PAN": "AAACG7569F",
    "CIN": "U63032GA1967GOI000077",
    "RegistrationDate": "29/09/1967",
    "Sector": "Shipping"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/6/69/Acko_logo_2025.svg",
    "CompanyName": "Acko General Insurance Limited",
    "ScripName": "Acko GIC",
    "ISIN": "INE07N501018",
    "PAN": "AAOCA9055C",
    "CIN": "U66000KA2016PLC138288",
    "RegistrationDate": "03/11/2016",
    "Sector": "General Insurance"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/a/a6/OYO_logo.svg",
    "CompanyName": "Oravel Stays Limited",
    "ScripName": "OYO Rooms",
    "ISIN": "INE561T01021",
    "PAN": "AANCA6342H",
    "CIN": "U63090GJ2012PLC107088",
    "RegistrationDate": "21/02/2012",
    "Sector": "Hospitality"
  },
  {
    "Logo": "",
    "CompanyName": "Inox Clean Energy Limited",
    "ScripName": "Inox Clean Energy (ICEL)",
    "ISIN": "INE0H7K01023",
    "PAN": "AAFCN8456P",
    "CIN": "U40300GJ2017PLC098852",
    "RegistrationDate": "20/11/2017",
    "Sector": "Renewable Energy"
  },
  {
    "Logo": "",
    "CompanyName": "GFCL EV Products Limited",
    "ScripName": "GFCL EV",
    "ISIN": "INE0KA501014",
    "PAN": "AAJCG4540K",
    "CIN": "U24296GJ2021PLC127819",
    "RegistrationDate": "08/12/2021",
    "Sector": "Chemical"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/HDFC_Securities_Logo.svg/512px-HDFC_Securities_Logo.svg.png",
    "CompanyName": "HDFC Ergo General Insurance Company Limited",
    "ScripName": "HDFC Ergo",
    "ISIN": "INE225R01027",
    "PAN": "AABCL5045N",
    "CIN": "U66030MH2007PLC177117",
    "RegistrationDate": "27/12/2007",
    "Sector": "Health Insurance"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Cochin_International_Airport_logo.svg/1200px-Cochin_International_Airport_logo.svg.png",
    "CompanyName": "Cochin International Airport Limited",
    "ScripName": "CIAL",
    "ISIN": "INE02KH01019",
    "PAN": "AAACC9658B",
    "CIN": "U63033KL1994PLC007803",
    "RegistrationDate": "30/03/1994",
    "Sector": "Airport"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Rapido_logo.svg/512px-Rapido_logo.svg.png",
    "CompanyName": "Roppen Transportation Services Pvt Ltd",
    "ScripName": "Rapido",
    "ISIN": "INE0QQK01019",
    "PAN": "AAHCR1710J",
    "CIN": "U52210TG2015PTC097115",
    "RegistrationDate": "05/01/2015",
    "Sector": "Transport"
  },
  {
    "Logo": "",
    "CompanyName": "SEIL Energy India Limited",
    "ScripName": "SEIL Energy",
    "ISIN": "INE460M01013",
    "PAN": "AACCT8413D",
    "CIN": "U40103HR2008PLC095648",
    "RegistrationDate": "08/01/2008",
    "Sector": "Power & Electricity"
  },
  {
    "Logo": "",
    "CompanyName": "Kogta Financial Limited",
    "ScripName": "Kogta Financial",
    "ISIN": "INE192U01015",
    "PAN": "AABCK8899F",
    "CIN": "U67120RJ1996PLC011406",
    "RegistrationDate": "15/01/1996",
    "Sector": "Financial Service"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/en/thumb/2/25/Boat_Logo.svg/2560px-Boat_Logo.svg.png",
    "CompanyName": "Imagine Marketing Limited",
    "ScripName": "BOAT",
    "ISIN": "INE03AV01027",
    "PAN": "AADC13821M",
    "CIN": "U52300MH2013PLC249758",
    "RegistrationDate": "01/11/2013",
    "Sector": "Consumer Durable"
  },
  {
    "Logo": "",
    "CompanyName": "Shriram General Insurance Co Limited",
    "ScripName": "Shriram GIC",
    "ISIN": "INE477J01013",
    "PAN": "AAKCS2509K",
    "CIN": "U66010RJ2006PLC029979",
    "RegistrationDate": "28/07/2006",
    "Sector": "General Insurance"
  },
  {
    "Logo": "",
    "CompanyName": "Hero FinCorp Limited",
    "ScripName": "Hero Fincorp",
    "ISIN": "INE957N01016",
    "PAN": "AAACH0157J",
    "CIN": "U74899DL1991PLC046774",
    "RegistrationDate": "16/12/1981",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "HDFC Securities Limited",
    "ScripName": "HDFC Securities",
    "ISIN": "INE700G01014",
    "PAN": "AAACH8215R",
    "CIN": "U67120MH2000PLC152193",
    "RegistrationDate": "17/04/2000",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Inox Leasing And Finance Limited",
    "ScripName": "Inox Leasing",
    "ISIN": "INE608E01014",
    "PAN": "AAACI1954L",
    "CIN": "U65910HP1995PLC011680",
    "RegistrationDate": "17/02/1995",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Ecom Express Limited",
    "ScripName": "Ecom",
    "ISIN": "INE004R01026",
    "PAN": "AADCE1344F",
    "CIN": "U63000DL2012PLC241107",
    "RegistrationDate": "27/08/2012",
    "Sector": "Courier"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/6/6f/PNB_MetLife_India_Logo.svg",
    "CompanyName": "PNB Metlife India Insurance Company Limited",
    "ScripName": "PNB Metlife",
    "ISIN": "INE207O01014",
    "PAN": "AACCM6448H",
    "CIN": "U66010KA2001PLC028883",
    "RegistrationDate": "11/04/2001",
    "Sector": "Life Insurance"
  },
  {
    "Logo": "https://upload.wikimedia.org/wikipedia/commons/6/60/Reliance_General_Insurance_Logo.svg",
    "CompanyName": "Reliance General Insurance Company Limited",
    "ScripName": "Reliance GIC",
    "ISIN": "INE124D01014",
    "PAN": "AABCR6747B",
    "CIN": "U66030MH2000PLC128300",
    "RegistrationDate": "17/08/2000",
    "Sector": "General Insurance"
  },
  {
    "Logo": "https://companieslogo.com/img/company/SBI-GENERAL.png",
    "CompanyName": "SBI General Insurance Company Ltd",
    "ScripName": "SBI General Insurance",
    "ISIN": "INE01MM01017",
    "PAN": "AAMCS8857L",
    "CIN": "U66000MH2009PLC190546",
    "RegistrationDate": "20/02/2009",
    "Sector": "General Insurance"
  },
  {
    "Logo": "",
    "CompanyName": "Hinduja Leyland Finance Limited",
    "ScripName": "Hinduja Leyland",
    "ISIN": "INE146O01014",
    "PAN": "AACCH1807P",
    "CIN": "U65993MH2008PLC384221",
    "RegistrationDate": "12/11/2008",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Parag Parikh Financial Advisory Services Ltd",
    "ScripName": "PPFAS",
    "ISIN": "INE0FGC01012",
    "PAN": "AABCP9117F",
    "CIN": "U67190MH1992PLC068970",
    "RegistrationDate": "12/10/1992",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Hero Motors Limited",
    "ScripName": "Hero Motors",
    "ISIN": "INE012G01022",
    "PAN": "AAACH4073P",
    "CIN": "U29299PB1998PLC039602",
    "RegistrationDate": "30/04/1998",
    "Sector": "Automobile"
  },
  {
    "Logo": "",
    "CompanyName": "Vivriti Capital Limited",
    "ScripName": "Vivriti Capital",
    "ISIN": "INE01HV01018",
    "PAN": "AAFCV9757P",
    "CIN": "U65929TN2017PLC117196",
    "RegistrationDate": "22/06/2017",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "ASK Investment Managers Limited",
    "ScripName": "ASK Investment",
    "ISIN": "INE925L01025",
    "PAN": "AAFCA2302P",
    "CIN": "U65993MH2004PLC147890",
    "RegistrationDate": "09/08/2004",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Incred Holdings Limited",
    "ScripName": "Incred Holdings",
    "ISIN": "INE732W01014",
    "PAN": "AAECK1977B",
    "CIN": "U67190MH2011PLC211738",
    "RegistrationDate": "03/01/2011",
    "Sector": "Investment & Holding"
  },
  {
    "Logo": "",
    "CompanyName": "API Holdings Ltd",
    "ScripName": "PharmEasy",
    "ISIN": "INEDJ201029",
    "PAN": "AASCA1201E",
    "CIN": "U60100MH2019PLC323444",
    "RegistrationDate": "31/03/2019",
    "Sector": "eCommerce"
  },
  {
    "Logo": "",
    "CompanyName": "Fractal Analytics Limited",
    "ScripName": "Fractal",
    "ISIN": "INE212S01015",
    "PAN": "AAACF4502D",
    "CIN": "U72400MH2000PLC125369",
    "RegistrationDate": "28/03/2000",
    "Sector": "Artificial Intelligence"
  },
  {
    "Logo": "",
    "CompanyName": "Emaar India Limited",
    "ScripName": "Emaar India",
    "ISIN": "INE451H01020",
    "PAN": "AABCE4308B",
    "CIN": "U45201DL2005PLC133161",
    "RegistrationDate": "18/02/2005",
    "Sector": "Real Estate"
  },
  {
    "Logo": "",
    "CompanyName": "Manjushree Technopack Limited",
    "ScripName": "Manjushree Technopack",
    "ISIN": "INE435H01023",
    "PAN": "AAACM9418K",
    "CIN": "U67120KA1987PLC032636",
    "RegistrationDate": "13/11/1987",
    "Sector": "Packaging"
  },
  {
    "Logo": "",
    "CompanyName": "Indian Potash Limited",
    "ScripName": "Indian Potash",
    "ISIN": "INE863S01015",
    "PAN": "AAACI0888H",
    "CIN": "U14219TN1955PLC000961",
    "RegistrationDate": "17/06/1995",
    "Sector": "Fertilisers"
  },
  {
    "Logo": "",
    "CompanyName": "Manipal Payment and Identity Solution Limited",
    "ScripName": "Manipal Payment",
    "ISIN": "INE241U01028",
    "PAN": "AAFCM4088E",
    "CIN": "U72900KA2008PLC045316",
    "RegistrationDate": "19/02/2008",
    "Sector": "Financial Technologies"
  },
  {
    "Logo": "",
    "CompanyName": "Acevector Limited",
    "ScripName": "Snapdeal",
    "ISIN": "INE580P01029",
    "PAN": "AABCJ8820B",
    "CIN": "U72300DL2007PLC168097",
    "RegistrationDate": "12/09/2007",
    "Sector": "eCommerce"
  },
  {
    "Logo": "",
    "CompanyName": "SK Finance Limited",
    "ScripName": "SK Finance",
    "ISIN": "INE124N01039",
    "PAN": "AAACE5115F",
    "CIN": "U65923RJ1994PLC009051",
    "RegistrationDate": "21/11/1994",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Motilal Oswal Home Finance Limited",
    "ScripName": "MOHFL",
    "ISIN": "INE658R01011",
    "PAN": "AAMCA0234H",
    "CIN": "U65923MH2013PLC248741",
    "RegistrationDate": "01/10/2013",
    "Sector": "Financial Service"
  },
  {
    "Logo": "",
    "CompanyName": "Chennai Super Kings Cricket Limited",
    "ScripName": "CSK",
    "ISIN": "INE852S01026",
    "PAN": "AAFCC8730K",
    "CIN": "U74900TN2014PLC098517",
    "RegistrationDate": "19/12/2014",
    "Sector": "Sports Franchisee"
  },
  {
    "Logo": "",
    "CompanyName": "Hella Infra Market Limited",
    "ScripName": "Hella Infra",
    "ISIN": "INE06E501010",
    "PAN": "AAGCB8087R",
    "CIN": "U46632MH2016PLC283737",
    "RegistrationDate": "15/07/2016",
    "Sector": "Building Materials"
  }
];

async function seedCompanies() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unlisted-hub');
    console.log('Connected to MongoDB');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Insert new companies one by one
    const result = [];
    for (let i = 0; i < companies.length; i++) {
      try {
        // Add name field to avoid unique index issues
        const companyData = {
          ...companies[i],
          name: companies[i].CompanyName
        };
        const company = await Company.create(companyData);
        result.push(company);
        console.log(`${i + 1}. Created: ${company.CompanyName}`);
      } catch (error) {
        console.error(`Failed to create company #${i + 1}:`, companies[i].CompanyName, error.message);
      }
    }
    console.log(`\nSuccessfully seeded ${result.length} out of ${companies.length} companies`);

    // Display summary
    console.log('\nSeeded companies:');
    result.forEach((company, index) => {
      console.log(`${index + 1}. ${company.CompanyName} (${company.ScripName}) - ${company.Sector}`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();
